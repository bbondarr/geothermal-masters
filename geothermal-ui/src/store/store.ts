import { DefaultValue, atom, selector } from "recoil";
import {
  ChartState as ChartInterface,
  SnackbarStateProps,
  ValidateState as ValidateInterface,
} from "../types";
import { Colors } from "../constants";

const colorsArray = Object.values(Colors);

const ColorIndex = atom<number>({
  key: "colorIndex",
  default: 0,
});

export const ColorState = atom<{
  chartColor: string;
  tableColor: string;
}>({
  key: "color",
  default: {
    chartColor: colorsArray[0].chartColor,
    tableColor: colorsArray[0].tableColor,
  },
});

const ChartState = atom<ChartInterface[]>({
  key: "chartState",
  default: [],
});

export const DatasetSelector = selector({
  key: "datasetState",
  get: ({ get }) => get(ChartState),
  set: ({ set, get }, newValue) => {
    let index = get(ColorIndex);

    if (!(newValue instanceof DefaultValue)) {
      index += 1;

      if (index > colorsArray.length - 1) {
        index = 0;
      }
    }

    set(ColorIndex, index);
    set(ColorState, {
      chartColor: colorsArray[index].chartColor,
      tableColor: colorsArray[index].tableColor,
    });
    set(ChartState, newValue);
  },
});

export const LoadingState = atom<boolean>({
  key: "loading",
  default: false,
});

export const ValidateState = atom<ValidateInterface>({
  key: "validation",
  default: {
    isValid: true,
    errors: [],
  },
});

export const SnackbarState = atom<SnackbarStateProps>({
  key: "snackBar",
  default: {
    open: false,
    severity: "info",
  },
});
