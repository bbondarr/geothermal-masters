import { GeothermalPointDto } from "../../dto/calculations/geothermal-point.dto";
import { numberToFixed } from "../../helpers/helpers";
import { SpreadsheetService } from "./spreadsheet.service";
import { SpreadsheetMetadataDto } from "../../dto/metadata/spreadsheet-metadata.dto";
import { Input } from "../../types/interfaces";

export class FinancialModel {
  constructor(
    private readonly metadata: SpreadsheetMetadataDto,
    private readonly spreadsheetService: SpreadsheetService
  ) {}

  public calculateFinancialStatistics(
    depth: number,
    depthToBasement: number,
    gradient: number
  ): GeothermalPointDto {
    this.setInputValuesAndRecalculate({
      gradient,
      depth: depth,
      depthToBasement: depthToBasement,
    });

    let lcoe: number | null = null;
    let npv10: number | null = null;
    let irr: number | null = null;
    let recalculatedDepthToBasement: number | null = null;

    try {
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
      lcoe: lcoe !== null ? numberToFixed(lcoe, 2) : lcoe,
      npv10: npv10 !== null ? numberToFixed(npv10, 2) : npv10,
      irr: irr !== null ? numberToFixed(irr, 2) : irr,
      temperature: numberToFixed(gradient * depth, 2),
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
}
