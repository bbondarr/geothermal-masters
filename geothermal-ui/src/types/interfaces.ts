import { VersionValidationStatus } from "./enums";

export interface Location {
  lat: number;
  lng: number;
}
export interface CostsMarker {
  lcoe: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
  lowestPoint: boolean;
  capitalExpenditures?: number;
  npv10?: number;
  irr?: number;
}

export interface LowestPointResponse {
  levelizedCostOfElectricity: number;
  temperature: number;
  gradient: number;
  depth: number;
  depthToBasement: number;
  capitalExpenditures: number;
  npv10: number;
  irr: number;
}

export interface CostsResponse {
  points: CostsMarker[];
  lowestPoint: LowestPointResponse;
}

export interface ChartState {
  data: CostsMarker[];
  chartColor: string;
  tableColor: string;
}

export interface ValidateState {
  errors: any[];
  isValid: boolean;
}

export interface VersionResponse {
  version: number;
  testStatus: VersionValidationStatus;
  isPublished: boolean;
  publishDate: string;
  lastUploadDate: string;
}

export interface UploadRequest {
  TestData?: File;
  Map?: File;
  FinancialModel?: File;
  Metadata?: File;
}

export interface PolygonsResponse {
  type: string;
  features: {
    type: string;
    geometry: unknown;
    properties: unknown;
  }[];
}
