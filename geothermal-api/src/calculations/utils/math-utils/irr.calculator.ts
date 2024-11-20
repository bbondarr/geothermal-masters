export function irr(cashFlows: number[]): number {
    const epsilon = 0.0001;
    const maxIterations = 1000;
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