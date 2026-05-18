import { roleUserApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUserToRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => roleUserApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles-permission"] });
    },
  });
}