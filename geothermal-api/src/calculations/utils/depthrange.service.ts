import { NoErrorCellValue } from 'hyperformula';
import { SpreadsheetService } from './spreadsheet.service';
import { SpreadsheetMetadataDto } from 'src/dto/metadata/spreadsheet-metadata.dto';
import { isNotNaNFiniteNumber } from '../../helpers/helpers';

export class DepthRangeService {
  private depthsByGradient: Map<number, number[]>;

  constructor(
    private readonly spreadsheetService: SpreadsheetService,
    private readonly metadata: SpreadsheetMetadataDto,
  ) {
    this.depthsByGradient = this.extractValidDepthsByGradientFromSheet();
  }

  public getWorthyDepthRangeForGradient(
    gradient: number,
    numberOfDepths: number,
  ): number[] {
    const depthsForGradient = this.depthsByGradient.get(gradient);

    if (!depthsForGradient) {
      throw new Error(`Could not found depths for gradient: ${gradient}`);
    }

    const { minDepth, maxDepth } =
      this.calculateMinMaxDepths(depthsForGradient);
    return this.selectDepths(minDepth, maxDepth, numberOfDepths);
  }

  private extractValidDepthsByGradientFromSheet(): Map<number, number[]> {
    const sheetName = this.metadata.physicalModelSheet.name;
    const depthsByGradient: Map<number, number[]> = new Map();

    let row = 0;
    let drawdown: NoErrorCellValue;

    do {
      row++;
      drawdown = this.spreadsheetService.getValue({
        sheetName,
        addressString: `${this.metadata.physicalModelSheet.drawdown}${row}`,
      });
    } while (typeof drawdown !== 'number');

    while (drawdown !== null) {
      if (isNotNaNFiniteNumber(drawdown) && drawdown !== 0) {
        const gradient = this.spreadsheetService.getValue<number>({
          sheetName,
          addressString: `${this.metadata.physicalModelSheet.gradient}${row}`,
        });

        const depth = this.spreadsheetService.getValue<number>({
          sheetName,
          addressString: `${this.metadata.physicalModelSheet.depth}${row}`,
        });

        if (!depthsByGradient.has(gradient)) {
          depthsByGradient.set(gradient, []);
        }

        const depths = depthsByGradient.get(gradient);
        depths.push(depth);
      }

      row++;

      drawdown = this.spreadsheetService.getValue<number>({
        sheetName,
        addressString: `${this.metadata.physicalModelSheet.drawdown}${row}`,
      });
    }

    return depthsByGradient;
  }

  private calculateMinMaxDepths(depths: number[]): {
    minDepth: number;
    maxDepth: number;
  } {
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);

    return { minDepth, maxDepth };
  }

  private selectDepths(
    minDepth: number,
    maxDepth: number,
    count: number,
  ): number[] {
    const step = (maxDepth - minDepth) / Math.max(1, count - 1);

    const selectedDepths = Array.from(
      { length: count },
      (_, index) => minDepth + index * step,
    );

    const roundedDepths = selectedDepths.map((depth) => {
      const roundedDepth = Math.round(depth / 100) * 100;
      return Math.max(minDepth, Math.min(maxDepth, roundedDepth)) / 1000;
    });

    return roundedDepths;
  }
}
