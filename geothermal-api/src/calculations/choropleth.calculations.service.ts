import { Injectable } from '@nestjs/common';
import { MultiPolygon, Polygon, GeoJSON, FeatureCollection } from 'geojson';
import * as turf from '@turf/turf';
import { GRID_SIZE, GIS_NODATA_VALUE } from 'src/constants';
import { bufferToJSON } from 'src/helpers/helpers';
import { GradientsGridData } from 'src/types/types';
import { GisService } from 'src/calculations/utils/gis.service';
import { GeothermalService } from 'src/calculations/utils/geothermal.service';
import { FileLoaderService } from 'src/file-loader/file-loader.service';

@Injectable()
export class ChoroplethCalculationsService {
  private gisService: GisService;
  private geothermalService: GeothermalService;

  constructor(private readonly fileLoaderService: FileLoaderService) {}

  public initializeServices(gisFileBuffer: Buffer): void {
    this.gisService = new GisService(gisFileBuffer);
    this.geothermalService = new GeothermalService();
  }

  public async getChoroplethMapGradients(): Promise<GeoJSON> {
    const gradients = await this.calculateGradientsGrid();
    const polygonsBuffer = await this.fileLoaderService.getChoroplethFile();
    const geoJson = bufferToJSON<FeatureCollection>(polygonsBuffer);

    const updatedFeatures = geoJson.features.map((feature) => {
      if (feature.geometry.type === 'Polygon') {
        feature.properties.GRADIENT = this.calculateAverageGradientForPolygon(
          feature.geometry,
          gradients,
        );
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.properties.GRADIENT =
          this.calculateAverageGradientForMultiPolygon(
            feature.geometry,
            gradients,
          );
      }

      return feature;
    });

    return {
      type: geoJson.type,
      features: updatedFeatures,
    };
  }

  private async calculateGradientsGrid(): Promise<GradientsGridData> {
    const topLeft = GRID_SIZE.TOP_LEFT;
    const topRight = GRID_SIZE.TOP_RIGHT;
    const bottomLeft = GRID_SIZE.BOTTOM_LEFT;

    const gridData: GradientsGridData = [];
    const numRows = GRID_SIZE.VERTICAL_HORIZONTAL;
    const numCols = GRID_SIZE.VERTICAL_HORIZONTAL;
    const latStep = (bottomLeft.lat - topLeft.lat) / (numRows - 1);
    const lngStep = (topRight.lng - topLeft.lng) / (numCols - 1);

    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const lat = topLeft.lat + i * latStep;
        const lng = topLeft.lng + j * lngStep;

        if (!this.areCoordinatesInBounds(lat, lng)) {
          continue;
        }

        const { depthToBasement, depth500Iso, depth300Iso } =
          await this.gisService.getDepthsByCoordinates(lng, lat);

        if (
          depthToBasement === GIS_NODATA_VALUE ||
          depth500Iso === GIS_NODATA_VALUE ||
          depth300Iso === GIS_NODATA_VALUE
        ) {
          continue;
        }

        const gradient = this.geothermalService.calculateGeothermalGradient({
          depth500Iso,
          depth300Iso,
        });

        if (isFinite(gradient)) {
          gridData.push([lat, lng, gradient]);
        }
      }
    }

    return gridData;
  }

  private calculateAverageGradientForPolygon(
    polygon: Partial<Polygon>,
    gradients: GradientsGridData,
  ) {
    const polygonCoords = polygon.coordinates;
    if (
      !polygonCoords ||
      polygonCoords.length === 0 ||
      polygonCoords[0].length < 4
    ) {
      // Пропуск полігона з невірними координатами
      return 0;
    }

    let sum = 0;
    let count = 0;
    gradients.forEach((gradient) => {
      const gradientPoint = turf.point([gradient[1], gradient[0]]);
      if (
        turf.booleanPointInPolygon(gradientPoint, turf.polygon(polygonCoords))
      ) {
        sum += gradient[2];
        count++;
      }
    });

    return count > 0 ? Math.round(sum / count) : 0;
  }

  private calculateAverageGradientForMultiPolygon(
    multiPolygon: MultiPolygon,
    gradients: GradientsGridData,
  ) {
    const polygons = multiPolygon.coordinates.map((coords) => ({
      coordinates: coords,
    }));
    const gradientsSum = polygons.reduce(
      (acc, polygon) =>
        acc + this.calculateAverageGradientForPolygon(polygon, gradients),
      0,
    );
    const polygonsCount = polygons.length;
    return polygonsCount > 0 ? Math.round(gradientsSum / polygonsCount) : 0;
  }

  private areCoordinatesInBounds(lat: number, lng: number): boolean {
    const topLeft = GRID_SIZE.TOP_LEFT;
    const topRight = GRID_SIZE.TOP_RIGHT;
    const bottomLeft = GRID_SIZE.BOTTOM_LEFT;

    return (
      lat >= bottomLeft.lat &&
      lat <= topLeft.lat &&
      lng >= topLeft.lng &&
      lng <= topRight.lng
    );
  }
}
