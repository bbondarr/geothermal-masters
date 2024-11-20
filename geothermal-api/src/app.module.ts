import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { SettingsModule } from './settings/settings.module';
import { MapModule } from './map/map.module';
import { ConfigModule } from '@nestjs/config';
import { CalculationsModule } from './calculations/calculations.module';
import { StorageModule } from './storage/storage.module';
import { FileLoaderModule } from './file-loader/file-loader.module';

@Module({
  imports: [
    HealthModule,
    SettingsModule,
    MapModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    CalculationsModule,
    StorageModule,
    FileLoaderModule,
  ],
})
export class AppModule {}
