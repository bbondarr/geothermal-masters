import { Injectable } from "@nestjs/common";
import { GeoJSON } from "geojson";
import { bufferToJSON } from "src/helpers/helpers";
import { PolygonsRepository } from "src/repositories/polygons.repository";
import { VersionControlRepository } from "src/repositories/version-control.repository";

@Injectable()
export class MapService {
  constructor(
    private readonly polygonsRepository: PolygonsRepository,
    private readonly versionControlRepository: VersionControlRepository
  ) {}

  async getGradientsPolygons(): Promise<GeoJSON> {
    let polygonsBuffer: Buffer;

    if (process.env.ENVIRONMENT === "local") {
      polygonsBuffer = await this.polygonsRepository.getPolygonsByVersion(
        undefined
      );
    } else {
      const publishedVersion =
        await this.versionControlRepository.getPublishedVersion();
      polygonsBuffer = await this.polygonsRepository.getPolygonsByVersion(
        publishedVersion.version
      );
    }

    return bufferToJSON<GeoJSON>(polygonsBuffer);
  }
}
