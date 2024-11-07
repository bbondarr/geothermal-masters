import { FinancialModelSheetDto } from './financial-model-sheet.dto';
import { InputSheetDto } from './input-sheet.dto';
import { OutputSheetDto } from './output-sheet.dto';
import { PhysicalModelSheetDto } from './power-output-sheet.dto';

export class SpreadsheetMetadataDto {
  constructor(value: Partial<SpreadsheetMetadataDto>) {
    Object.assign(this, value);
  }
  inputSheet: InputSheetDto;
  outputSheet: OutputSheetDto;
  physicalModelSheet: PhysicalModelSheetDto;
  financialModelSheet: FinancialModelSheetDto;
}
