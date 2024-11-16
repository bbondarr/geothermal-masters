export class DetailedGeothermalCostCalculationPointDto {
  constructor(value: Partial<DetailedGeothermalCostCalculationPointDto>) {
    Object.assign(this, value);
  }

  levelizedCostOfElectricity: number;
  npv10: number;
  irr: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
}
