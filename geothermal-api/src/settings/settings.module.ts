import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { StorageModule } from 'src/storage/storage.module';
import { ValidatorModule } from 'src/validator/validator.module';
import { CalculationsValidatorService } from 'src/validator/calculations-validator.service';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { FileLoaderModule } from 'src/file-loader/file-loader.module';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { GisRepository } from 'src/repositories/gis.repository';
import { TestDataRepository } from 'src/repositories/test-data.repository';
import { CalculationsModule } from 'src/calculations/calculations.module';
import { MetadataValidatorService } from 'src/validator/metadata-validator.service';
import { PolygonsRepository } from 'src/repositories/polygons.repository';
import { ChoroplethCalculationsService } from 'src/calculations/choropleth.calculations.service';

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,
    CalculationsValidatorService,
    MetadataValidatorService,
    FileLoaderService,
    ChoroplethCalculationsService,
    MetadataRepository,
    VersionControlRepository,
    FinancialModelRepository,
    GisRepository,
    PolygonsRepository,
    TestDataRepository,
  ],
  imports: [
    StorageModule,
    ValidatorModule,
    FileLoaderModule,
    CalculationsModule,
  ],
})
export class SettingsModule {}
