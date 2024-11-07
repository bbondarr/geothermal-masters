export class DetailedGeothermalCostCalculationPointDto {
  constructor(value: Partial<DetailedGeothermalCostCalculationPointDto>) {
    Object.assign(this, value);
  }

  levelizedCostOfElectricity: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
}
