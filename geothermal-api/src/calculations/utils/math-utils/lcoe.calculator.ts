import { npv } from "./npv.calculator";

export function lcoe(
  electricity: number[],
  capEx: number[],
  opEx: number[],
  rate = 0.1
): number {
  return (npv(capEx, rate) + npv(opEx, rate)) / npv(electricity, rate);
}
