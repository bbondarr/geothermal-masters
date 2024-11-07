import {
  DetailedCellError,
  ExportedCellChange,
  HyperFormula,
  NoErrorCellValue,
  SimpleCellAddress,
} from 'hyperformula';
import * as XLSX from 'xlsx';
import { excelCompatibleConfig as config } from './hf-config';
import {
  InternalRateOfReturnPlugin,
  InternalRateOfReturnPluginTranslations,
} from './hyperformula-plugins/internal-rate-of-return.plugin';
import {
  GetOutputValueParams,
  SetInputValueParams,
} from 'src/types/interfaces';

export class SpreadsheetService {
  private hyperFormula: HyperFormula;

  constructor(fileBuffer: Buffer) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    this.hyperFormula = this.createFromWorkbookAndConfigure(workbook);
  }

  private createFromWorkbookAndConfigure(
    workbook: XLSX.WorkBook,
  ): HyperFormula {
    HyperFormula.registerFunctionPlugin(
      InternalRateOfReturnPlugin,
      InternalRateOfReturnPluginTranslations,
    );
    // Clear existing state
    const hyperFormula = HyperFormula.buildEmpty(config);

    // Excel compatibility
    hyperFormula.addNamedExpression('FALSE', '=FALSE()');
    hyperFormula.addNamedExpression('TRUE', '=TRUE()');

    hyperFormula.suspendEvaluation();

    for (const workbookSheetName of workbook.SheetNames) {
      const workSheet = workbook.Sheets[workbookSheetName];

      const hfSheet = hyperFormula.addSheet(workbookSheetName);
      const hfSheetId = hyperFormula.getSheetId(hfSheet)!;

      for (const [key, cell] of Object.entries(workSheet)) {
        if (key.startsWith('!')) continue; // skip meta data

        const address = hyperFormula.simpleCellAddressFromString(
          key,
          hfSheetId,
        )!;

        const shouldUseFormula = cell.f;

        let value = null;
        value = shouldUseFormula ? `=${cell.f}` : cell.v;

        hyperFormula.setCellContents(address, value);
      }
    }

    hyperFormula.resumeEvaluation();

    // Without it, dependencies are not tracked completely!
    hyperFormula.rebuildAndRecalculate();

    return hyperFormula;
  }

  setValue({
    sheetName,
    addressString,
    value,
  }: SetInputValueParams): ExportedCellChange[] {
    const cellAddress = this.getCellSimpleAddressFromString(
      sheetName,
      addressString,
    );

    return this.hyperFormula.setCellContents(
      cellAddress,
      value,
    ) as ExportedCellChange[];
  }

  getValue<T extends NoErrorCellValue>({
    sheetName,
    addressString,
  }: GetOutputValueParams): T {
    const cellAddress = this.getCellSimpleAddressFromString(
      sheetName,
      addressString,
    );
    const rawValue = this.hyperFormula.getCellValue(cellAddress);

    if (rawValue instanceof DetailedCellError) {
      console.log(rawValue);
      throw new Error(
        `Invalid value in sheet ${sheetName}, address: ${addressString}, ${rawValue}`,
      );
    }

    return rawValue as T;
  }

  private getCellSimpleAddressFromString(
    sheetName: string,
    addressString: string,
  ): SimpleCellAddress {
    const sheetId = this.hyperFormula.getSheetId(sheetName)!;

    return this.hyperFormula.simpleCellAddressFromString(
      addressString,
      sheetId,
    )!;
  }
}
