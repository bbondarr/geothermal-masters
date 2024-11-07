import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../context/axios";
import { PolygonsResponse } from "../types";

export function usePolygons() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["polygons"],
    queryFn: async () => {
      const { data } = await axios.get<PolygonsResponse>(
        `${process.env.REACT_APP_API}/map/polygons`
      );
      return data;
    },
  });
}
