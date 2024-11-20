import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { SpreadsheetService } from "./utils/spreadsheet.service";
import { GisService } from "src/calculations/utils/gis.service";
import { DepthRangeService } from "./utils/depthrange.service";
import { FileLoaderService } from "../file-loader/file-loader.service";
import { numberToFixed } from "../helpers/helpers";
import { GeothermalCostCalculationsDto } from "../dto/calculations/geothermal-cost-calculations.dto";
import { GeothermalService } from "./utils/geothermal.service";
import { DetailedGeothermalCostCalculationPointDto } from "src/dto/calculations/detailed-geothermal-cost-calculation-point.dto";
import { SpreadsheetMetadataDto } from "src/dto/metadata/spreadsheet-metadata.dto";
import { GeothermalCostCalculationPointDto } from "../dto/calculations/geothermal-cost-calculations-point.dto";
import { VersionControlRepository } from "src/repositories/version-control.repository";
import { GIS_NODATA_VALUE } from "src/constants";
import { IFinancialModel } from "./financial.model";
import { FinancialModel } from "./utils/hf.financial.model";

@Injectable()
export class CalculationsService implements OnModuleInit {
  private defaultDepths: number;
  private gisService: GisService;
  private depthRange: DepthRangeService;
  private geothermalService: GeothermalService;
  private financialModel: IFinancialModel;

  constructor(
    private readonly fileLoaderService: FileLoaderService,
    private readonly versionControlRepository: VersionControlRepository
  ) {}

  async onModuleInit(): Promise<void> {
    let loadedFiles: Buffer[] = [];
    console.log(process.env.ENVIRONMENT);
    if (process.env.ENVIRONMENT === "local") {
      loadedFiles = await this.fileLoaderService.loadLocalFiles();
    } else {
      console.log("Downloading files from s3");
      const { version } =
        await this.versionControlRepository.getPublishedVersion();
      loadedFiles = await this.fileLoaderService.loadS3Files(version);
      console.log("Downloaded");
    }

    const [gisFileBuffer, calculationFileBuffer, metadataFileBuffer] =
      loadedFiles;

    this.initializeServices(
      gisFileBuffer,
      calculationFileBuffer,
      metadataFileBuffer
    );
  }

  public initializeServices(
    gisFileBuffer: Buffer,
    calculationFileBuffer: Buffer,
    metadataFileBuffer: Buffer
  ): void {
    this.defaultDepths = Number(process.env.DEFAULT_DEPTHS) || 6;
    const metadata = new SpreadsheetMetadataDto(
      JSON.parse(metadataFileBuffer.toString())
    );
    this.gisService = new GisService(gisFileBuffer);
    const spreadsheetService = new SpreadsheetService(calculationFileBuffer);
    this.depthRange = new DepthRangeService(spreadsheetService, metadata);
    this.geothermalService = new GeothermalService();
    this.financialModel = new FinancialModel(metadata, spreadsheetService);
  }

  public async calculateGeothermalPoints(
    latitude: number,
    longitude: number
  ): Promise<GeothermalCostCalculationsDto> {
    const { depthToBasement, depth500Iso, depth300Iso } =
      await this.gisService.getDepthsByCoordinates(longitude, latitude);

    if (
      depthToBasement === GIS_NODATA_VALUE ||
      depth500Iso === GIS_NODATA_VALUE ||
      depth300Iso === GIS_NODATA_VALUE
    ) {
      throw new BadRequestException({
        error: {
          message: "Coordinates are out of bounds.",
          data: {
            depthToBasement:
              depthToBasement === GIS_NODATA_VALUE ? null : depthToBasement,
            depth500Iso: depth500Iso === GIS_NODATA_VALUE ? null : depth500Iso,
            depth300Iso: depth300Iso === GIS_NODATA_VALUE ? null : depth300Iso,
            latitude,
            longitude,
          },
        },
      });
    }

    const gradient = this.geothermalService.calculateGeothermalGradient({
      depth500Iso,
      depth300Iso,
    });

    if (!isFinite(gradient)) {
      throw new BadRequestException({
        error: {
          message: "Cannot calculate geothermal data by infinite gradient.",
          data: {
            depthToBasement,
            depth500Iso,
            depth300Iso,
            latitude,
            longitude,
            gradient,
          },
        },
      });
    }

    const parsedDepthToBasement = numberToFixed(depthToBasement, 1);

    const depths = this.depthRange.getWorthyDepthRangeForGradient(
      gradient,
      this.defaultDepths
    );
    const intermediatePoints = depths.map((depth) =>
      this.financialModel.calculateFinancialStatistics(
        gradient,
        depth,
        parsedDepthToBasement
      )
    );

    const detailedPoints: DetailedGeothermalCostCalculationPointDto[] =
      intermediatePoints.map(
        (point) => new DetailedGeothermalCostCalculationPointDto(point)
      );

    const regularPoints: GeothermalCostCalculationPointDto[] =
      intermediatePoints.map((point) => ({
        lcoe: point.levelizedCostOfElectricity,
        npv10: point.npv10,
        irr: point.irr,
        temperature: point.temperature,
        gradient: point.gradient,
        depth: point.depth,
        depthToBasement: point.depthToBasement,
      }));

    if (regularPoints.length == 0) {
      throw new BadRequestException({
        error: {
          message: "Cannot calculate geothermal data in coordinates.",
          data: {
            depthToBasement,
            depth500Iso,
            depth300Iso,
            latitude,
            longitude,
            gradient,
          },
        },
      });
    }
    const lowestPoint = this.findLowestCostOfElectricityPoint(detailedPoints);
    if (Object.keys(lowestPoint).length === 0) {
      throw new BadRequestException({
        error: {
          message: "Cannot calculate geothermal data in coordinates.",
          data: {
            depthToBasement,
            depth500Iso,
            depth300Iso,
            latitude,
            longitude,
            gradient,
          },
        },
      });
    }
    return new GeothermalCostCalculationsDto({
      lowestPoint: lowestPoint,
      points: regularPoints,
    });
  }

  private findLowestCostOfElectricityPoint(
    points: DetailedGeothermalCostCalculationPointDto[]
  ): DetailedGeothermalCostCalculationPointDto {
    const notNullPoints = points.filter(
      (point) => point.levelizedCostOfElectricity !== null
    );

    const lowestPoint = notNullPoints.reduce((optimalPoint, currentPoint) => {
      return currentPoint.levelizedCostOfElectricity <
        optimalPoint.levelizedCostOfElectricity
        ? currentPoint
        : optimalPoint;
    }, notNullPoints[0]);

    return new DetailedGeothermalCostCalculationPointDto(lowestPoint);
  }
}
