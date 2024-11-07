import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxios } from "../context/axios";

export function usePublish() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["publish"],
    mutationFn: async (versionNumber: number) =>
      axios.post<void>(
        `${process.env.REACT_APP_API}/settings/versions/publish`,
        null,
        {
          params: {
            version: versionNumber,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}
