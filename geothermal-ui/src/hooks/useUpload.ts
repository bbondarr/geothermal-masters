import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadRequest } from "../types";
import { useAxios } from "../context/axios";

interface UploadPayload {
  files: UploadRequest;
  versionToUpdate?: number;
}

export function useUpload() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upload"],
    mutationFn: async ({ files, versionToUpdate }: UploadPayload) => {
      const formData = new FormData();

      Object.entries(files).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const params = {
        params: {},
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      let requestUrl = `${process.env.REACT_APP_API}/settings/files/`;

      if (versionToUpdate) {
        requestUrl += "update";
        params.params = { version: versionToUpdate };
      } else {
        requestUrl += "upload";
      }

      await axios.post<void>(requestUrl, formData, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions"] });
    },
  });
}
