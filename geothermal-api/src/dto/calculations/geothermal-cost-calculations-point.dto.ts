export class GeothermalCostCalculationPointDto {
  constructor(value: Partial<GeothermalCostCalculationPointDto>) {
    Object.assign(this, value);
  }

  lcoe: number;
  npv10: number;
  irr: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
}
