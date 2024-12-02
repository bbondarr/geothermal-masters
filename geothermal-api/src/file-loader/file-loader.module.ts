import { Module } from '@nestjs/common';
import { FileLoaderService } from './file-loader.service';
import { StorageModule } from 'src/storage/storage.module';
import { MetadataRepository } from '../repositories/metadata.repository';
import { GisRepository } from 'src/repositories/gis.repository';
import { FinancialModelRepository } from 'src/repositories/financial-model.repository';
import { VersionControlRepository } from 'src/repositories/version-control.repository';

@Module({
  imports: [StorageModule],
  providers: [
    FileLoaderService,
    MetadataRepository,
    GisRepository,
    FinancialModelRepository,
    VersionControlRepository,
  ],
})
export class FileLoaderModule {}
