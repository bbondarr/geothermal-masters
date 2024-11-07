import {
  FunctionPlugin,
  FunctionArgumentType,
  HyperFormula,
  ArraySize,
} from 'hyperformula';
import { InterpreterState } from 'hyperformula/typings/interpreter/InterpreterState';
import { Ast } from 'hyperformula/typings/parser';
export class InternalRateOfReturnPlugin extends FunctionPlugin {
  irr(ast: Ast, state: InterpreterState) {
    const astArgs = 'args' in ast ? ast.args : undefined;
    return this.runFunction(
      astArgs as Ast[],
      state,
      this.metadata('IRR'),
      (range) => {
        const rangeData = range.data;
        const dataAsNumbers = rangeData.map((row) =>
          row.map((val) => this.internalScalarValueToNumber(val)),
        );

        return this.calculateIRR(dataAsNumbers[0]);
      },
    );
  }
  internalScalarValueToNumber(value) {
    const rawValue = value.val ?? value;
    return typeof rawValue === 'number' ? rawValue : undefined;
  }
  irrResultArraySize(ast) {
    const arg = ast?.args?.[0];

    if (arg?.start == null || arg?.end == null) {
      return ArraySize.scalar();
    }

    const width = arg.end.col - arg.start.col + 1;
    const height = arg.end.row - arg.start.row + 1;

    return new ArraySize(width, height);
  }

  private calculateIRR(cashFlows: number[]): number {
    const epsilon = 0.0001; // tolerance level
    const maxIterations = 1000; // maximum number of iterations
    let guess = 0.1;

    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;

      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + guess, j);
        dnpv -= (j * cashFlows[j]) / Math.pow(1 + guess, j + 1);
      }

      const newGuess = guess - npv / dnpv;

      if (Math.abs(newGuess - guess) < epsilon) {
        return newGuess;
      }

      guess = newGuess;
    }

    return NaN;
  }
}

InternalRateOfReturnPlugin.implementedFunctions = {
  IRR: {
    method: 'irr',
    arraySizeMethod: 'irrResultArraySize',
    parameters: [{ argumentType: FunctionArgumentType.RANGE }],
  },
};

export const InternalRateOfReturnPluginTranslations = {
  enGB: {
    IRR: 'IRR',
  },
  enUS: {
    IRR: 'IRR',
  },
};

HyperFormula.registerFunctionPlugin(
  InternalRateOfReturnPlugin,
  InternalRateOfReturnPluginTranslations,
);
