import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class GisRepository {
  private static readonly GIS_FILE_NAME = 'Map.tif';

  constructor(private readonly storageService: StorageService) {}

  async getGisByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${GisRepository.GIS_FILE_NAME}`,
    );
  }
}
