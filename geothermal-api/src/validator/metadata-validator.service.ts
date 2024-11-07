import { Injectable } from '@nestjs/common';

@Injectable()
export class MetadataValidatorService {
  private invalidProperties: { [sheet: string]: string[] } = {};

  public validate(metadata: any): boolean {
    const inputSheetPattern = {
      name: this.regexPatternAnyCharacter(),
      gradient: this.regexPatternAlphabetsAndNumbers(),
      depth: this.regexPatternAlphabetsAndNumbers(),
      depthToBasement: this.regexPatternAlphabetsAndNumbers(),
      levelizedCostOfElectricity: this.regexPatternAlphabetsAndNumbers(),
      temperature: this.regexPatternAlphabetsAndNumbers(),
      netPresentValue10: this.regexPatternAlphabetsAndNumbers(),
      internalRateOfReturn: this.regexPatternAlphabetsAndNumbers(),
    };

    const outputSheetPattern = {
      name: this.regexPatternAnyCharacter(),
      levelizedCostOfElectricity: this.regexPatternAlphabetsAndNumbers(),
      temperature: this.regexPatternAlphabetsAndNumbers(),
      netPresentValue10: this.regexPatternAlphabetsAndNumbers(),
      internalRateOfReturn: this.regexPatternAlphabetsAndNumbers(),
      depthToBasement: this.regexPatternAlphabetsAndNumbers(),
    };

    const physicalModelSheetPattern = {
      name: this.regexPatternAnyCharacter(),
      gradient: this.regexPatternAlphabets(),
      depth: this.regexPatternAlphabets(),
      drawdown: this.regexPatternAlphabets(),
    };

    const financialModelSheetPattern = {
      name: this.regexPatternAnyCharacter(),
      capitalExpenditures: this.regexPatternAlphabetsAndNumbers(),
    };

    if (metadata.inputSheet) {
      this.invalidProperties.inputSheet = this.validateSheet(
        metadata.inputSheet,
        inputSheetPattern,
      );
    } else {
      this.invalidProperties.inputSheet = ['missing'];
    }

    if (metadata.outputSheet) {
      this.invalidProperties.outputSheet = this.validateSheet(
        metadata.outputSheet,
        outputSheetPattern,
      );
    } else {
      this.invalidProperties.outputSheet = ['missing'];
    }

    if (metadata.physicalModelSheet) {
      this.invalidProperties.physicalModelSheet = this.validateSheet(
        metadata.physicalModelSheet,
        physicalModelSheetPattern,
      );
    } else {
      this.invalidProperties.physicalModelSheet = ['missing'];
    }

    if (metadata.financialModelSheet) {
      this.invalidProperties.financialModelSheet = this.validateSheet(
        metadata.financialModelSheet,
        financialModelSheetPattern,
      );
    } else {
      this.invalidProperties.financialModelSheet = ['missing'];
    }

    return Object.values(this.invalidProperties).every(
      (arr) => arr.length === 0,
    );
  }

  public getInvalidProperties(): string {
    let result = '';
    for (const sheetName in this.invalidProperties) {
      if (
        this.invalidProperties.hasOwnProperty(sheetName) &&
        this.invalidProperties[sheetName].length > 0
      ) {
        const properties = this.invalidProperties[sheetName].join(', ');
        result += `${sheetName}.${properties}, `;
      }
    }

    result = result.slice(0, -2);
    return result;
  }

  private validateSheet(sheet: any, pattern: any): string[] {
    const invalidProps: string[] = [];
    for (const field in pattern) {
      if (!sheet[field] || !pattern[field].test(sheet[field])) {
        invalidProps.push(field);
      }
    }
    return invalidProps;
  }

  private regexPatternAnyCharacter(): RegExp {
    return /.+/;
  }

  private regexPatternAlphabetsAndNumbers(): RegExp {
    return /^[A-Z]+\d+$/;
  }

  private regexPatternAlphabets(): RegExp {
    return /^[A-Z]+$/;
  }
}
