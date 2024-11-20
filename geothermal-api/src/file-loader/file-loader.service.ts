import * as fs from 'fs/promises';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadFileNames } from 'src/types/enums';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { GisRepository } from 'src/repositories/gis.repository';

@Injectable()
export class FileLoaderService {
  private static readonly COUNTIES_FILE_NAME = 'USGeoJSON.json';

  constructor(
    private readonly metadataRepository: MetadataRepository,
    private readonly financialModelRepository: FinancialModelRepository,
    private readonly gisRepository: GisRepository,
  ) {}

  public async loadLocalFiles(): Promise<Buffer[]> {
    const localFileNames = [
      UploadFileNames.Map,
      UploadFileNames.FinancialModel,
      UploadFileNames.Metadata,
    ];

    try {
      const fileBufferPromises = localFileNames.map((fileName) => {
        console.log(`Trying to load local file ${fileName}...`);
        const fileData = fs.readFile(fileName);
        console.log(`Loaded local file ${fileName}.`);
        return fileData;
      });

      return Promise.all(fileBufferPromises);
    } catch (error) {
      console.error(`Error reading local files: ${error.message}`);
      throw error;
    }
  }

  public async loadS3Files(version: number): Promise<Buffer[]> {
    try {
      const fileBufferPromises = [
        this.gisRepository.getGisByVersion(version),
        this.financialModelRepository.getFinancialModelByVersion(version),
        this.metadataRepository.getMetadataByVersion(version),
      ];

      return await Promise.all(fileBufferPromises);
    } catch (error) {
      console.error(`Error reading S3 files: ${error.message}`);
      throw new BadRequestException({
        error: { message: error.message },
      });
    }
  }

  public async getChoroplethFile() {
    return await fs.readFile(FileLoaderService.COUNTIES_FILE_NAME);
  }
}
