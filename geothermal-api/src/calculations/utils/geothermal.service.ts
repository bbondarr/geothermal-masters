export class GeothermalService {
  public calculateGeothermalGradient({ depth500Iso, depth300Iso }): number {
    // (500C - 300C)/(500iso - 300iso)
    return Math.round(200 / (depth500Iso - depth300Iso));
  }
}
