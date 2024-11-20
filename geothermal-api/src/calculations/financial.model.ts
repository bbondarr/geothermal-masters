import { OnModuleInit } from "@nestjs/common";
import { irr as calculateIrr } from "./utils/math-utils/irr.calculator";
import { lcoe as calculateLcoe } from "./utils/math-utils/lcoe.calculator";
import { npv as calculateNpv } from "./utils/math-utils/npv.calculator";
import { SettingsRepository } from "../repositories/settings.repository";
import { GeothermalPointDto } from "../dto/calculations/geothermal-point.dto";
import { numberToFixed } from "../helpers/helpers";

export interface IFinancialModel {
  calculateFinancialStatistics(
    depth: number,
    depthToBasement: number,
    gradient: number
  ): GeothermalPointDto;
}

export class FinancialModel implements OnModuleInit {
  lifetimeYears: number;
  generatorGrossCapacity: number;
  capacityFactor: number;
  parasiticLoad: number;
  initialReservoirCapacity: number;
  drillingPerKm: number;
  powerPlant: number;
  gatheringSystem: number;
  stimulationSystem: number;
  plantOM: number;
  fieldOM: number;

  constructor(private readonly settingsRepository: SettingsRepository) {}

  async onModuleInit() {
    const settingsFileBuffer =
      await this.settingsRepository.getSettingsByVersion(1);
    const settings = JSON.parse(settingsFileBuffer.toString());

    this.lifetimeYears = settings.lifetime;
    this.generatorGrossCapacity = settings.generatorGrossCapacity;
    this.capacityFactor = settings.capacityFactor;
    this.parasiticLoad = settings.parasiticLoad;
    this.initialReservoirCapacity = settings.initialReservoirCapacity;
    this.drillingPerKm = settings.drillingPerKm;
    this.powerPlant = settings.powerPlant;
    this.gatheringSystem = settings.gatheringSystem;
    this.stimulationSystem = settings.stimulationSystem;
    this.plantOM = settings.plantOM;
    this.fieldOM = settings.fieldOM;
  }

  public calculateFinancialStatistics(
    depth: number,
    depthToBasement: number,
    gradient: number
  ): GeothermalPointDto {
    const capExYearly = this.calculateCapExYearly(depth, gradient);
    const opExYearly = this.calculateOpExYearly();
    const electricityYearly = this.calculateElectricityYearly();

    const cashFlows = capExYearly.concat(opExYearly);

    const lcoe = calculateLcoe(electricityYearly, capExYearly, opExYearly);
    const irr = calculateIrr(cashFlows);
    const npv10 = calculateNpv(cashFlows, 10);
    const temperature = gradient * depth;

    return new GeothermalPointDto({
      levelizedCostOfElectricity: lcoe !== null ? numberToFixed(lcoe, 2) : lcoe,
      npv10: npv10 !== null ? numberToFixed(npv10, 2) : npv10,
      irr: irr !== null ? numberToFixed(irr, 2) : irr,
      temperature,
      gradient,
      depth,
      depthToBasement,
    });
  }

  private calculateElectricityYearly(): number[] {
    let electricityYearly: number[] = [];
    let previousReservoirCapacity = -Infinity;

    for (let year = 0; year < this.lifetimeYears; year++) {
      const desiredCapacity = this.generatorGrossCapacity * this.capacityFactor;
      const reservoirCapacity = year === 0 ? this.initialReservoirCapacity : previousReservoirCapacity * 0.99;
      electricityYearly.push(
        Math.min(desiredCapacity, reservoirCapacity) * (1 - this.parasiticLoad)
      );
      previousReservoirCapacity = reservoirCapacity;
    }

    return electricityYearly;
  }

  private calculateCapExYearly(depth: number, gradient: number): number[] {
    const capEx = this.calculateCapEx(depth);
    const buildYears = 3;
    const capExYearly = new Array(buildYears).fill(capEx / buildYears);

    return capExYearly;
  }

  private calculateOpExYearly(): number[] {
    let opExYearly: number[] = [];
    for (let index = 0; index < this.lifetimeYears; index++) {
      opExYearly.push(this.calculateOpExForYear());
    }

    return opExYearly;
  }

  calculateCapEx(depth: number): number {
    const wellsCount =
      2 * this.generatorGrossCapacity / this.initialReservoirCapacity;
    const drillingOne = this.drillingPerKm * depth;

    const drilling = drillingOne * wellsCount;
    
    return drilling + this.gatheringSystem + this.stimulationSystem + this.powerPlant;
  }

  calculateOpExForYear(): number {
    return this.plantOM + this.fieldOM;
  }
}
