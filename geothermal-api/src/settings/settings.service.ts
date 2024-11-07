import { BadRequestException, Injectable } from '@nestjs/common';
import { getFilesFromVersion } from './settings.utils';
import { StorageService } from 'src/storage/storage.service';
import { Readable } from 'stream';
import { CalculationsValidatorService } from 'src/validator/calculations-validator.service';
import { SpreadsheetMetadataDto } from 'src/dto/metadata/spreadsheet-metadata.dto';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { VersionDto } from 'src/dto/versions/version.dto';
import { UploadFileNames, VersionValidationStatus } from 'src/types/enums';
import { FilesDto } from 'src/dto/files/files.dto';
import { _Object } from '@aws-sdk/client-s3';
import { CalculationsService } from 'src/calculations/calculations.service';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { MetadataValidatorService } from 'src/validator/metadata-validator.service';
import { FileDto } from 'src/dto/files/file.dto';
import { PolygonsRepository } from 'src/repositories/polygons.repository';
import { jsonToBuffer } from 'src/helpers/helpers';
import { ChoroplethCalculationsService } from 'src/calculations/choropleth.calculations.service';
import { GeoJSON } from 'geojson';

@Injectable()
export class SettingsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly calculationsValidatorService: CalculationsValidatorService,
    private readonly metadataValidatorService: MetadataValidatorService,
    private readonly metadataRepository: MetadataRepository,
    private readonly versionControlRepository: VersionControlRepository,
    private readonly gridRepository: PolygonsRepository,
    private readonly polygonsRepository: PolygonsRepository,
    private readonly fileLoaderService: FileLoaderService,
    private readonly calculationsService: CalculationsService,
    private readonly choroplethService: ChoroplethCalculationsService,
  ) {}

  public async uploadFiles(files: FilesDto): Promise<void> {
    if (files.Metadata) {
      this.validateMetadata(files.Metadata);
    }

    const currentVersions =
      await this.versionControlRepository.getAllVersions();
    const isFirstUpload = !currentVersions.length;

    const missingFileNames = this.checkFileList(files);
    if (isFirstUpload && missingFileNames.length > 0) {
      throw new BadRequestException({
        error: {
          message: `Missing required files for first uploading: ${missingFileNames.join(', ')}`,
          data: {
            files,
          },
        },
      });
    }

    const lastPublishedVersion =
      await this.versionControlRepository.getPublishedVersion();

    if (isFirstUpload) {
      const validationResult =
        await this.calculationsValidatorService.validateFiles(
          files.Map.buffer,
          files.FinancialModel.buffer,
          Readable.from(files.TestData.buffer),
          files.Metadata.buffer,
        );
      const newVersion = await this.versionControlRepository.addNewVersion();
      const targetVersion = newVersion.version;
      await this.versionControlRepository.updateVersionValidationStatus(
        targetVersion,
        validationResult.isValid
          ? VersionValidationStatus.Success
          : VersionValidationStatus.Fail,
      );
      await this.storageService.uploadFiles(files, targetVersion);
    } else {
      await this.handleSubsequentUploads(
        files,
        missingFileNames,
        lastPublishedVersion,
      );
    }
  }

  public async updateFiles(files: FilesDto, version: number): Promise<void> {
    const versionToUpdate =
      await this.versionControlRepository.getSpecificVersion(version);
    if (!versionToUpdate) {
      throw new BadRequestException({
        error: {
          message: `Provided version: ${version} does not exist.`,
        },
      });
    }

    if (files.Metadata) {
      this.validateMetadata(files.Metadata);
    }

    const missingFileNames = this.checkFileList(files);
    const lastPublishedVersion =
      await this.versionControlRepository.getPublishedVersion();

    if (missingFileNames.length > 0) {
      const bucketContent = await this.storageService.getBucketContent();
      const prevVersion = lastPublishedVersion.version;
      const filesFromPrevVersion = getFilesFromVersion(
        prevVersion,
        bucketContent.files,
      );
      const combinedFiles = await this.combineFilesWithMissingFiles(
        files,
        missingFileNames,
        filesFromPrevVersion,
      );

      const validationResult =
        await this.calculationsValidatorService.validateFiles(
          combinedFiles.Map.buffer,
          combinedFiles.FinancialModel.buffer,
          Readable.from(combinedFiles.TestData.buffer),
          combinedFiles.Metadata.buffer,
        );
      await this.versionControlRepository.updateVersionValidationStatus(
        version,
        validationResult.isValid
          ? VersionValidationStatus.Success
          : VersionValidationStatus.Fail,
      );
      await this.storageService.uploadFiles(files, version);
    } else {
      const validationResult =
        await this.calculationsValidatorService.validateFiles(
          files.Map.buffer,
          files.FinancialModel.buffer,
          Readable.from(files.TestData.buffer),
          files.Metadata.buffer,
        );
      await this.versionControlRepository.updateVersionValidationStatus(
        version,
        validationResult.isValid
          ? VersionValidationStatus.Success
          : VersionValidationStatus.Fail,
      );
      await this.storageService.uploadFiles(files, version);
    }
  }

  public async uploadGradientsChoroplethMapFile(
    version: number,
  ): Promise<void> {
    const gridPolygons =
      await this.choroplethService.getChoroplethMapGradients();
    const gridFileBuffer = jsonToBuffer<GeoJSON>(gridPolygons);
    await this.gridRepository.uploadPolygons(gridFileBuffer, version);
  }

  private async checkChoroplethMapExistsByVersion(
    version: number,
  ): Promise<boolean> {
    try {
      const choroplethMapBuffer =
        await this.polygonsRepository.getPolygonsByVersion(version);

      if (choroplethMapBuffer) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return true;
  }

  private async getVersionValidationStatus(version: number): Promise<boolean> {
    const versionToCheck =
      await this.versionControlRepository.getSpecificVersion(version);
    if (!versionToCheck) {
      throw new BadRequestException({
        error: {
          message: `Version: ${version} does not exist.`,
        },
      });
    }

    return versionToCheck.testStatus === VersionValidationStatus.Success;
  }

  private async handleSubsequentUploads(
    files: FilesDto,
    missingFileNames: string[],
    lastPublishedVersion: VersionDto,
  ) {
    if (missingFileNames.length > 0) {
      const bucketContent = await this.storageService.getBucketContent();
      const prevVersion = lastPublishedVersion.version;
      const filesFromPrevVersion = getFilesFromVersion(
        prevVersion,
        bucketContent.files,
      );
      const combinedFiles = await this.combineFilesWithMissingFiles(
        files,
        missingFileNames,
        filesFromPrevVersion,
      );

      const validationResult =
        await this.calculationsValidatorService.validateFiles(
          combinedFiles.Map.buffer,
          combinedFiles.FinancialModel.buffer,
          Readable.from(combinedFiles.TestData.buffer),
          combinedFiles.Metadata.buffer,
        );
      const newVersion = await this.versionControlRepository.addNewVersion();
      await this.versionControlRepository.updateVersionValidationStatus(
        newVersion.version,
        validationResult.isValid
          ? VersionValidationStatus.Success
          : VersionValidationStatus.Fail,
      );
      await this.storageService.uploadFiles(combinedFiles, newVersion.version);
    } else {
      const validationResult =
        await this.calculationsValidatorService.validateFiles(
          files.Map.buffer,
          files.FinancialModel.buffer,
          Readable.from(files.TestData.buffer),
          files.Metadata.buffer,
        );
      const newVersion = await this.versionControlRepository.addNewVersion();
      await this.versionControlRepository.updateVersionValidationStatus(
        newVersion.version,
        validationResult.isValid
          ? VersionValidationStatus.Success
          : VersionValidationStatus.Fail,
      );
      await this.storageService.uploadFiles(files, newVersion.version);
    }
  }

  private checkFileList(files: FilesDto): string[] {
    const fileNames = Object.keys(files).map((key) => files[key].name);
    const requiredNames = Object.values(UploadFileNames);
    const missedFiles: string[] = [];

    for (const key of requiredNames) {
      if (!fileNames.some((item) => item === key)) {
        missedFiles.push(key);
      }
    }

    return missedFiles;
  }

  private async combineFilesWithMissingFiles(
    files: FilesDto,
    missingFileNames: string[],
    filesFromPrevVersion: _Object[],
  ): Promise<FilesDto> {
    const combinedFiles = files.clone();
    const filePromises = missingFileNames.map(async (key) => {
      const file = filesFromPrevVersion.find((item) => item.Key.endsWith(key));
      try {
        const buffer = await this.storageService.getFile(file.Key);
        const fileKey = key.split('.')[0];
        combinedFiles[fileKey] = {
          name: file.Key.split('/').at(-1),
          buffer,
        };
      } catch (err) {
        console.error(err);
      }
    });

    await Promise.all(filePromises);

    return combinedFiles;
  }

  private async downloadAndInitPublishedVersion(
    version: number,
  ): Promise<void> {
    const [gisFileBuffer, calculationFileBuffer, metadataBuffer] =
      await this.fileLoaderService.loadS3Files(version);
    this.calculationsService.initializeServices(
      gisFileBuffer,
      calculationFileBuffer,
      metadataBuffer,
    );

    this.choroplethService.initializeServices(gisFileBuffer);
  }

  private validateMetadata(metadataFile: FileDto): void {
    const metadataBuffer = metadataFile.buffer;
    const metadata = JSON.parse(metadataBuffer.toString());
    const metadataValidationResult =
      this.metadataValidatorService.validate(metadata);

    if (!metadataValidationResult) {
      throw new BadRequestException({
        error: {
          message: `Validation failed. Invalid metadata properties: ${this.metadataValidatorService.getInvalidProperties()}`,
          data: {
            metadata,
          },
        },
      });
    }
  }

  public async getSpreadsheetMetadata(): Promise<SpreadsheetMetadataDto> {
    const metadataVersion =
      await this.versionControlRepository.getPublishedVersion();
    if (!metadataVersion) {
      throw new BadRequestException({
        error: {
          message: 'Cannot find published version.',
        },
      });
    }
    const metadataFileBuffer =
      await this.metadataRepository.getMetadataByVersion(
        metadataVersion.version,
      );
    return new SpreadsheetMetadataDto(
      JSON.parse(metadataFileBuffer.toString()),
    );
  }

  public async getAllVersions(): Promise<VersionDto[]> {
    return await this.versionControlRepository.getReversedAllVersions();
  }

  public async publishVersion(version: number): Promise<void> {
    console.log(`Publishing version: ${version}`);
    const publishVersion =
      await this.versionControlRepository.getSpecificVersion(version);
    if (!publishVersion) {
      throw new BadRequestException({
        error: {
          message: `Version: ${version} does not exist.`,
        },
      });
    }
    const versionValidationStatus =
      await this.getVersionValidationStatus(version);

    if (!versionValidationStatus) {
      throw new BadRequestException({
        error: {
          message: 'Cannot publish version without verification.',
          data: {
            version,
          },
        },
      });
    }
    console.log('Downloading and initializing publish version files.');
    await this.downloadAndInitPublishedVersion(version);
    const isChoropleth = await this.checkChoroplethMapExistsByVersion(version);

    if (!isChoropleth) {
      console.log('Generating and uploading choropleth map file.');
      await this.uploadGradientsChoroplethMapFile(version);
    }

    await this.versionControlRepository.publishVersion(version);
    console.log('Finished version publish.');
  }
}
