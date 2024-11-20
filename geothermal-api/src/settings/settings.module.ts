import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { StorageModule } from 'src/storage/storage.module';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { FileLoaderModule } from 'src/file-loader/file-loader.module';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { GisRepository } from 'src/repositories/gis.repository';
import { CalculationsModule } from 'src/calculations/calculations.module';
import { PolygonsRepository } from 'src/repositories/polygons.repository';
import { ChoroplethCalculationsService } from 'src/calculations/choropleth.calculations.service';

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,
    FileLoaderService,
    ChoroplethCalculationsService,
    MetadataRepository,
    VersionControlRepository,
    FinancialModelRepository,
    GisRepository,
    PolygonsRepository,
  ],
  imports: [
    StorageModule,
    FileLoaderModule,
    CalculationsModule,
  ],
})
export class SettingsModule {}
