import { BadRequestException, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { validationErrorRows, validationResponse } from '../types/interfaces';
import { CalculationsService } from '../calculations/calculations.service';
import { FileLoaderService } from 'src/file-loader/file-loader.service';
import { GeothermalCostCalculationPointDto } from 'src/dto/calculations/geothermal-cost-calculations-point.dto';
import { VersionControlRepository } from 'src/repositories/version-control.repository';

@Injectable()
export class CalculationsValidatorService {
  private calculationsService: CalculationsService;

  constructor(
    private readonly fileLoaderService: FileLoaderService,
    private versionControlRepository: VersionControlRepository,
  ) {}

  public async validateS3Files(): Promise<validationResponse> {
    const { version } =
      await this.versionControlRepository.getPublishedVersion();

    const [
      gisFileBuffer,
      calculationFileBuffer,
      metadataBuffer,
      csvFileBuffer,
    ] = await this.fileLoaderService.loadS3Files(version);

    return await this.validateFiles(
      gisFileBuffer,
      calculationFileBuffer,
      Readable.from(csvFileBuffer),
      metadataBuffer,
    );
  }

  public async validateFiles(
    gisFileBuffer: Buffer,
    calculationFileBuffer: Buffer,
    csvFileStream: Readable,
    metadataFileBuffer: Buffer,
  ): Promise<validationResponse> {
    try {
      this.calculationsService = new CalculationsService(
        this.fileLoaderService,
        this.versionControlRepository,
      );
      this.calculationsService.initializeServices(
        gisFileBuffer,
        calculationFileBuffer,
        metadataFileBuffer,
      );

      const csvData = await this.parseCsv(csvFileStream);

      const { lat, lng } = csvData[0];

      const { points } =
        await this.calculationsService.calculateGeothermalPoints(lat, lng);

      const expectedResults: GeothermalCostCalculationPointDto[] = csvData.map(
        (row) => ({
          lcoe: row.lcoe,
          temperature: row.temperature,
          gradient: row.gradient,
          depth: row.depth,
          depthToBasement: row.depthToBasement,
        }),
      );

      return this.compareLcoes(points, expectedResults);
    } catch (error) {
      throw new BadRequestException({
        error: { message: `Error during calculations validation.` },
      });
    }
  }

  private async parseCsv(csvFileStream: Readable): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const csvData: any[] = [];

      csvFileStream
        .pipe(csvParser())
        .on('data', (row) => {
          const parsedRow = {
            lat: parseFloat(row.lat) || null,
            lng: parseFloat(row.lng) || null,
            lcoe: parseFloat(row.lcoe) || null,
            temperature: parseFloat(row.temperature) || null,
            gradient: parseFloat(row.gradient) || null,
            depth: parseFloat(row.depth) || null,
            depthToBasement: parseFloat(row.depthToBasement) || null,
          };

          csvData.push(parsedRow);
        })
        .on('end', () => {
          resolve(csvData);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private compareLcoes(
    calculatedLcoes: GeothermalCostCalculationPointDto[],
    expectedLcoes: GeothermalCostCalculationPointDto[],
  ): validationResponse {
    const validationErrors: validationErrorRows[] = [];
    let rowNumber = 1;
    if (calculatedLcoes.length !== expectedLcoes.length) {
      return { isValid: false, errors: [] };
    }

    for (let i = 0; i < calculatedLcoes.length; i++) {
      const calculatedLcoe = calculatedLcoes[i];
      const expectedLcoe = expectedLcoes[i];
      rowNumber++;

      if (
        calculatedLcoe.lcoe !== expectedLcoe.lcoe ||
        calculatedLcoe.temperature !== expectedLcoe.temperature ||
        calculatedLcoe.gradient !== expectedLcoe.gradient ||
        calculatedLcoe.depth !== expectedLcoe.depth ||
        calculatedLcoe.depthToBasement !== expectedLcoe.depthToBasement
      ) {
        validationErrors.push({
          row: rowNumber,
          expected: expectedLcoe,
          actual: calculatedLcoe,
        });
      }
    }

    if (validationErrors.length > 0) {
      return { isValid: false, errors: validationErrors };
    }

    return { isValid: true, errors: [] };
  }
}
