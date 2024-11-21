import { Module } from '@nestjs/common';
import { CalculationsService } from './calculations.service';
import { FileLoaderModule } from 'src/file-loader/file-loader.module';
import { StorageModule } from 'src/storage/storage.module';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { MetadataRepository } from 'src/repositories/metadata.repository';
import { GisRepository } from 'src/repositories/gis.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { FinancialModel } from './utils/hf.financial.model';

@Module({
  imports: [FileLoaderModule, StorageModule],
  providers: [
    CalculationsService,
    FileLoaderService,
    VersionControlRepository,
    MetadataRepository,
    FinancialModelRepository,
    FinancialModel,
    GisRepository,
  ],
  exports: [CalculationsService],
})
export class CalculationsModule {}
