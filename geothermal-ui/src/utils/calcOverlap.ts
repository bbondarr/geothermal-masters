import { ChartState } from "../types";

export function calcOverlapStatus(
  { data }: ChartState,
  state: ChartState[]
): boolean {
  // Якщо половина графіка функції перетинається то не відображаю
  const overlappingQuantity = 2;
  const maxLcoeValue = 200;
  const maxTemperatureValue = 500;

  for (let stateData of state) {
    let overlapCounter = 0;

    for (let arrIndex = 0; arrIndex < data.length; arrIndex++) {
      const newMarkerData = data[arrIndex];
      const stateItemData = stateData.data[arrIndex];

      const lcoeDifference = Math.abs(newMarkerData.lcoe - stateItemData.lcoe);
      const temperatureDifference = Math.abs(
        newMarkerData.temperature - stateItemData.temperature
      );

      if (
        lcoeDifference <= (1 / 100) * maxLcoeValue &&
        temperatureDifference <= (1 / 100) * maxTemperatureValue
      ) {
        overlapCounter += 1;
      }
    }

    if (overlapCounter >= overlappingQuantity) return true;
  }

  return false;
}
