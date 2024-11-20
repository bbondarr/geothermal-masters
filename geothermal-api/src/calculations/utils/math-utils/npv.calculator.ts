export function npv(cashFlows: number[], rate = 0.1): number {
  let npv = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i);
  }

  return npv;
}
