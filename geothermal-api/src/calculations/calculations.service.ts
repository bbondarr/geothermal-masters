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
import { Input } from "src/types/interfaces";
import { GeothermalCostCalculationPointDto } from "../dto/calculations/geothermal-cost-calculations-point.dto";
import { VersionControlRepository } from "src/repositories/version-control.repository";
import { GeothermalPointDto } from "src/dto/calculations/geothermal-point.dto";
import { GIS_NODATA_VALUE } from "src/constants";

@Injectable()
export class CalculationsService implements OnModuleInit {
  private defaultDepths: number;
  private metadata: SpreadsheetMetadataDto;
  private spreadsheetService: SpreadsheetService;
  private gisService: GisService;
  private depthRange: DepthRangeService;
  private geothermalService: GeothermalService;

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
    this.metadata = new SpreadsheetMetadataDto(
      JSON.parse(metadataFileBuffer.toString())
    );
    this.gisService = new GisService(gisFileBuffer);
    this.spreadsheetService = new SpreadsheetService(calculationFileBuffer);
    this.depthRange = new DepthRangeService(
      this.spreadsheetService,
      this.metadata
    );
    this.geothermalService = new GeothermalService();
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

    // the value must be exactly one decimal place, otherwise the formula will return an error
    const parsedDepthToBasement = numberToFixed(depthToBasement, 1);

    const depths = this.depthRange.getWorthyDepthRangeForGradient(
      gradient,
      this.defaultDepths
    );
    const intermediatePoints = depths.map((depth) =>
      this.calculateGeothermalPointByDepth(
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

  private calculateGeothermalPointByDepth(
    gradient: number,
    depth: number,
    depthToBasement: number
  ): GeothermalPointDto {
    this.setInputValuesAndRecalculate({
      gradient,
      depth: depth,
      depthToBasement: depthToBasement,
    });

    let lcoe: number | null = null;
    let npv10: number | null = null;
    let irr: number | null = null;
    let reservoirTemperature: number | null = null;
    let recalculatedDepthToBasement: number | null = null;

    try {
      reservoirTemperature = this.spreadsheetService.getValue<number>({
        sheetName: this.metadata.outputSheet.name,
        addressString: this.metadata.outputSheet.temperature,
      });

      recalculatedDepthToBasement = this.spreadsheetService.getValue<number>({
        sheetName: this.metadata.outputSheet.name,
        addressString: this.metadata.outputSheet.depthToBasement,
      });

      lcoe = this.spreadsheetService.getValue<number>({
        sheetName: this.metadata.outputSheet.name,
        addressString: this.metadata.outputSheet.levelizedCostOfElectricity,
      });

      npv10 = this.spreadsheetService.getValue<number>({
        sheetName: this.metadata.outputSheet.name,
        addressString: this.metadata.outputSheet.netPresentValue10,
      });

      irr = this.spreadsheetService.getValue<number>({
        sheetName: this.metadata.outputSheet.name,
        addressString: this.metadata.outputSheet.internalRateOfReturn,
      });
    } catch (error) {
      console.error(
        `Error geothermal cost calculating point: ${error.message}`
      );
    }

    return new GeothermalPointDto({
      levelizedCostOfElectricity: lcoe !== null ? numberToFixed(lcoe, 2) : lcoe,
      npv10: npv10 !== null ? numberToFixed(npv10, 2) : npv10,
      irr: irr !== null ? numberToFixed(irr, 2) : irr,
      temperature: reservoirTemperature,
      gradient,
      depth,
      depthToBasement: recalculatedDepthToBasement,
    });
  }

  private setInputValuesAndRecalculate(input: Input): void {
    this.spreadsheetService.setValue({
      sheetName: this.metadata.inputSheet.name,
      addressString: this.metadata.inputSheet.gradient,
      value: input.gradient,
    });
    this.spreadsheetService.setValue({
      sheetName: this.metadata.inputSheet.name,
      addressString: this.metadata.inputSheet.depth,
      value: input.depth,
    });
    this.spreadsheetService.setValue({
      sheetName: this.metadata.inputSheet.name,
      addressString: this.metadata.inputSheet.depthToBasement,
      value: input.depthToBasement,
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

  // public calculateLcoeByDepthsAndGradient(
  //   depths: DepthCollection,
  //   gradient: number
  // ): number {
  //   const initialReservoirCapacity =
  //     this.calculateInitialReservoirCapacity(depths, gradient);
  //   const halfNumberOfWells =
  //     this.generatorGrossCapacity / initialReservoirCapacity;

  //   const capEx = this.calculateCapEx(halfNumberOfWells, halfNumberOfWells);

  //   let electricityTotal = 0;
  //   let opExTotal = 0;
  //   for (let index = 0; index < this.lifetimeYears; index++) {
  //     electricityTotal += this.calculateYearlyElectricity(initialReservoirCapacity);
  //     opExTotal += this.calculateYearlyOpEx();
  //   }

  //   return (NPV(this.r, capEx) + NPV(this.r, opExTotal)) /
  //     NPV(this.r, electricityTotal);
  // }

  // calculateInitialReservoirCapacity(depths: DepthCollection, gradient: number): number {
  //   throw new Error('Method not implemented.');
  // }
  // calculateCapEx(halfNumberOfWells: number, halfNumberOfWells1: number): number {
  //   throw new Error('Method not implemented.');
  // }
  // calculateYearlyElectricity(initialReservoirCapacity: number): number {
  //   throw new Error('Method not implemented.');
  // }
  // calculateYearlyOpEx(): number {
  //   throw new Error('Method not implemented.');
  // }
}
