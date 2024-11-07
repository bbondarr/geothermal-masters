import { DetailedGeothermalCostCalculationPointDto } from './detailed-geothermal-cost-calculation-point.dto';
import { GeothermalCostCalculationPointDto } from './geothermal-cost-calculations-point.dto';

export class GeothermalCostCalculationsDto {
  constructor(value: Partial<GeothermalCostCalculationsDto>) {
    Object.assign(this, value);
  }

  lowestPoint: DetailedGeothermalCostCalculationPointDto;
  points: GeothermalCostCalculationPointDto[];
}
