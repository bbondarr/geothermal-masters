import { BadRequestException, Injectable } from '@nestjs/common';
import { VersionDto } from 'src/dto/versions/version.dto';
import { bufferToJSON, formatDate, jsonToBuffer } from 'src/helpers/helpers';
import { StorageService } from 'src/storage/storage.service';
import { VersionValidationStatus } from 'src/types/enums';
@Injectable()
export class VersionControlRepository {
  private static readonly VERSION_CONTROL_FILE_NAME = 'VersionControl.json';

  constructor(private readonly storageService: StorageService) {}

  async getAllVersions(): Promise<VersionDto[]> {
    const versionsData = await this.storageService.getFile(
      `${VersionControlRepository.VERSION_CONTROL_FILE_NAME}`,
    );
    const versionsJson = bufferToJSON<VersionDto[]>(versionsData);

    if (!Array.isArray(versionsJson)) {
      throw new Error('Invalid versions data format.');
    }

    const versions: VersionDto[] = versionsJson.map((versionData) => {
      return new VersionDto(versionData);
    });

    return versions;
  }

  async getReversedAllVersions(): Promise<VersionDto[]> {
    const versions = await this.getAllVersions();

    return versions.reverse();
  }

  async getPublishedVersion(): Promise<VersionDto> {
    const versions = await this.getAllVersions();
    const publishedVersion = versions.find((version) => version.isPublished);
    return publishedVersion;
  }

  async publishVersion(versionNumber: number): Promise<void> {
    const versions = await this.getAllVersions();
    const versionToUpdate = versions.find(
      (version) => version.version === versionNumber,
    );
    if (!versionToUpdate) {
      throw new BadRequestException(
        `Could not found version ${versionNumber} to update`,
      );
    }

    const publishedVersion = versions.find((version) => version.isPublished);
    if (publishedVersion) {
      publishedVersion.isPublished = false;
    }

    versionToUpdate.isPublished = true;
    versionToUpdate.publishDate = formatDate(new Date());

    await this.uploadVersions(versions);
  }

  async updateVersionValidationStatus(
    versionNumber: number,
    status: VersionValidationStatus,
  ): Promise<void> {
    const versions = await this.getAllVersions();

    const versionToUpdate = versions.find(
      (version) => version.version === versionNumber,
    );

    if (!versionToUpdate) {
      throw new BadRequestException(`Version ${versionNumber} not found`);
    }

    versionToUpdate.testStatus = status;
    versionToUpdate.lastUploadDate = formatDate(new Date());

    await this.uploadVersions(versions);
  }

  async updateVersionUploadDate(
    versionNumber: number,
    uploadDate?: string,
  ): Promise<void> {
    const versions = await this.getAllVersions();

    const versionToUpdate = versions.find(
      (version) => version.version === versionNumber,
    );

    if (!versionToUpdate) {
      throw new BadRequestException(`Version ${versionNumber} not found`);
    }

    versionToUpdate.lastUploadDate = uploadDate
      ? uploadDate
      : formatDate(new Date());

    await this.uploadVersions(versions);
  }

  async addNewVersion(): Promise<VersionDto> {
    const versions = await this.getAllVersions();
    const lastVersionNumber =
      versions.length > 0 ? versions[versions.length - 1].version : 0;
    const newVersion: VersionDto = {
      version: lastVersionNumber + 1,
      testStatus: VersionValidationStatus.Pending,
      isPublished: false,
      publishDate: '',
      lastUploadDate: formatDate(new Date()),
    };

    versions.push(newVersion);

    await this.uploadVersions(versions);
    return new VersionDto(newVersion);
  }

  async getSpecificVersion(versionNumber: number): Promise<VersionDto> {
    const versions = await this.getAllVersions();

    const version = versions.find(
      (version) => version.version === versionNumber,
    );

    return version;
  }

  private async uploadVersions(versions: VersionDto[]): Promise<void> {
    await this.storageService.s3Upload({
      name: VersionControlRepository.VERSION_CONTROL_FILE_NAME,
      buffer: jsonToBuffer<VersionDto[]>(versions),
    });
  }
}
