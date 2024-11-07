import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class TestDataRepository {
  private static readonly TEST_DATA_FILE_NAME = 'TestData.csv';

  constructor(private readonly storageService: StorageService) {}

  async getTestDataByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${TestDataRepository.TEST_DATA_FILE_NAME}`,
    );
  }
}
