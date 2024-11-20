import { useMutation } from "@tanstack/react-query";
import { useAxios } from "../context/axios";
import { ChartState, CostsMarker, CostsResponse, Location } from "../types";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  ColorState,
  DatasetSelector,
  LoadingState,
  SnackbarState,
} from "../store/store";
import { calcOverlapStatus } from "../utils/calcOverlap";

interface MutationArgs {
  location: Location;
}

export function useMarker() {
  const setSnackBar = useSetRecoilState(SnackbarState);
  const setDatasets = useSetRecoilState(DatasetSelector);
  const setLoading = useSetRecoilState(LoadingState);
  const colors = useRecoilValue(ColorState);
  const axios = useAxios();

  return useMutation({
    mutationKey: ["add-marker"],
    mutationFn: async ({ location }: MutationArgs) => {
      setLoading(true);
      const res = await axios.get<CostsResponse>(
        `${process.env.REACT_APP_API}/map/costs`,
        {
          params: {
            lat: location.lat,
            lng: location.lng,
          },
        }
      );

      const {
        data: { lowestPoint, points },
      } = res;
      console.log(lowestPoint);
      const result: CostsMarker[] = points.map((point) => {
        if (point.lcoe === lowestPoint.levelizedCostOfElectricity) {
          const { levelizedCostOfElectricity, ...obj } = lowestPoint;

          if (levelizedCostOfElectricity > 200) {
            setSnackBar({
              open: true,
              title: "Warning",
              severity: "warning",
              message: "Графік не відображається тому що значення LCOE перевищує 200",
            });
          }

          return {
            lcoe: levelizedCostOfElectricity,
            lowestPoint: true,
            ...obj,
          };
        }
        return {
          ...point,
          lowestPoint: false,
        };
      });

      let warningStatus = false;

      setDatasets((state) => {
        const charts = [...state];

        // // Максиму ліній на графіку === 3
        if (charts.length === 3) {
          charts.shift();
        }

        const newMarker: ChartState = {
          data: result,
          tableColor: colors.tableColor,
          chartColor: colors.chartColor,
        };

        const isOverlapping = calcOverlapStatus(newMarker, charts);

        if (isOverlapping) {
          warningStatus = true;
        }

        const newState = [...charts, newMarker];

        return newState;
      });

      if (warningStatus) {
        setSnackBar({
          open: true,
          title: "Warning",
          severity: "warning",
          message: "Нова лінія на графі може бути надто близько до іншої лінії.",
        });
      }
    },
    onSettled() {
      setLoading(false);
    },
  });
}
