import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { CalculationsModule } from 'src/calculations/calculations.module';
import { VersionControlRepository } from 'src/repositories/version-control.repository';
import { PolygonsRepository } from 'src/repositories/polygons.repository';
import { MapService } from './map.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [CalculationsModule],
  controllers: [MapController],
  providers: [
    MapService,
    PolygonsRepository,
    VersionControlRepository,
    StorageService,
  ],
})
export class MapModule {}
