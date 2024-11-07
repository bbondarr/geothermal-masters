import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../context/axios";
import { VersionResponse } from "../types";

export function useVersions() {
  const axios = useAxios();

  return useQuery({
    queryKey: ["versions"],
    queryFn: async () => {
      const { data } = await axios.get<VersionResponse[]>(
        `${process.env.REACT_APP_API}/settings/versions`
      );
      return data;
    },
  });
}
