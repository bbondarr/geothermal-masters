import { Injectable } from '@nestjs/common';
import { FileDto } from 'src/dto/files/file.dto';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class PolygonsRepository {
  private static readonly POLYGONS_FILE_NAME = 'GradientsPolygons.json';

  constructor(private readonly storageService: StorageService) {}

  async uploadPolygons(
    polygonsFileBuffer: Buffer,
    version: number,
  ): Promise<void> {
    const polygonsFile: FileDto = {
      name: PolygonsRepository.POLYGONS_FILE_NAME,
      buffer: polygonsFileBuffer,
    };

    await this.storageService.s3Upload(polygonsFile, version);
  }

  async getPolygonsByVersion(version: number): Promise<Buffer> {
    return this.storageService.getFile(
      `${version}/${PolygonsRepository.POLYGONS_FILE_NAME}`,
    );
  }
}
