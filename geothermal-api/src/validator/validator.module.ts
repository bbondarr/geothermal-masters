import { Module } from '@nestjs/common';
import { CalculationsValidatorService } from './calculations-validator.service';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { FileLoaderModule } from 'src/file-loader/file-loader.module';
import { StorageModule } from 'src/storage/storage.module';
import { StorageService } from 'src/storage/storage.service';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { TestDataRepository } from 'src/repositories/test-data.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { GisRepository } from 'src/repositories/gis.repository';
import { MetadataValidatorService } from './metadata-validator.service';

@Module({
  imports: [FileLoaderModule, StorageModule],
  providers: [
    CalculationsValidatorService,
    MetadataValidatorService,
    FileLoaderService,
    StorageService,
    VersionControlRepository,
    MetadataRepository,
    FinancialModelRepository,
    GisRepository,
    TestDataRepository,
  ],
})
export class ValidatorModule {}
