import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class MetadataRepository {
  private static readonly METADATA_FILE_NAME = 'Metadata.json';

  constructor(private readonly storageService: StorageService) {}

  async getMetadataByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${MetadataRepository.METADATA_FILE_NAME}`,
    );
  }
}
