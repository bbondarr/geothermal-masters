import { GeothermalCostCalculationPointDto } from 'src/dto/calculations/geothermal-cost-calculations-point.dto';

export interface UploadFiles {
  TestData?: Express.Multer.File[];
  Map?: Express.Multer.File[];
  FinancialModel?: Express.Multer.File[];
  PhysicalModel?: Express.Multer.File[];
  Metadata?: Express.Multer.File[];
}

export interface Input {
  gradient: number;
  depth: number;
  depthToBasement: number;
}
export interface GeothermalPoint {
  lcoe: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
}

export interface GeothermalPointCalculationResponse {
  points: GeothermalPoint[];
  optimalPoint: GeothermalPoint;
}

export interface validationErrorRows {
  row: number;
  expected: GeothermalCostCalculationPointDto;
  actual: GeothermalCostCalculationPointDto;
}

export interface validationResponse {
  isValid: boolean;
  errors: validationErrorRows[];
}

export interface GetOutputValueParams {
  sheetName: string;
  addressString: string;
}
export interface SetInputValueParams {
  sheetName: string;
  addressString: string;
  value: number;
}
