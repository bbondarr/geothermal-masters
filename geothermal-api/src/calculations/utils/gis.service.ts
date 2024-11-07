/* eslint-disable @typescript-eslint/no-unused-vars */
import { GeoTIFFImage, fromArrayBuffer } from 'geotiff';
import { convertBufferToArrayBuffer } from 'src/helpers/helpers';

export interface DepthCollection {
  depthToBasement: number;
  depth500Iso: number;
  depth400Iso: number;
  depth300Iso: number;
}
export class GisService {
  private imagePromise?: Promise<GeoTIFFImage>;
  private image?: GeoTIFFImage;

  constructor(gisFileBuffer: Buffer) {
    this.initializeImage(convertBufferToArrayBuffer(gisFileBuffer));
  }

  private async initializeImage(gisArrayBuffer: ArrayBuffer): Promise<void> {
    this.imagePromise = fromArrayBuffer(gisArrayBuffer).then((tiff) => tiff.getImage());
  }

  public async getDepthsByCoordinates(
    longitude: number,
    latitude: number
  ): Promise<DepthCollection> {
    this.image ??= await this.imagePromise;

    try {
      const { ModelPixelScale: scale, ModelTiepoint: tiepoint } = this.image.fileDirectory;

      const [sx, sy, sz] = scale;
      const [px, py, k, gx, gy, gz] = tiepoint;
      
      // WGS-84 tiles have a "flipped" y component so I make it negative
      const geoToPixel = [-gx / sx, 1 / sx, 0, -gy / -sy, 0, 1 / -sy];

      const [x, y] = this.transform(longitude, latitude, geoToPixel, true);

      const window = [x, y, x + 1, y + 1];
      const rasters = await this.image.readRasters({ window });

      // Extract band values
      const depthToBasement = rasters[0][0];
      const depth500Iso = rasters[1][0];
      const depth400Iso = rasters[2][0];
      const depth300Iso = rasters[3][0];

      return { 
        depthToBasement: depthToBasement * -1,
        depth500Iso,
        depth400Iso,
        depth300Iso
      };
    } catch (error: any) {
      console.error(`Error in getDepthsByCoordinates: ${error.message}`);
    }
  }

  private transform(a: number, b: number, M: number[], roundToInt = false): any[] {
    const round = (v) => (roundToInt ? v | 0 : v);

    return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)];
  }

  public setImage(gisImage: GeoTIFFImage): void {
    this.image = gisImage;
  }

  isWithinBoundaries(longitude: number, latitude: number): boolean {
    if (!this.image) {
      throw new Error('Image not initialized.');
    }

    const boundingBox = this.image.getBoundingBox();
    const [minX, minY, maxX, maxY] = boundingBox;

    return longitude >= minX && longitude <= maxX && latitude >= minY && latitude <= maxY;
  }
}
