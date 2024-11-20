import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class SettingsRepository {
  private static readonly SETTINGS_FILE_NAME = 'Settings.json';

  constructor(private readonly storageService: StorageService) {}

  async getSettingsByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${SettingsRepository.SETTINGS_FILE_NAME}`,
    );
  }
}
