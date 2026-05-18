import { rolePermissionApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRolesPermission(params) {
  return useQuery({
    queryKey: ["roles-permission", params],
    queryFn: () => rolePermissionApi.list(params).then((r) => r.data),
    staleTime: 30000,
  });
}

export function useRolesPermissionToRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => rolePermissionApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles-permission"] });
    },
  });
}