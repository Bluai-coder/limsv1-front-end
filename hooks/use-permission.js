import { permissionApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";



export function usePermission(params) {
  return useQuery({
    queryKey: ["permission", params],
    queryFn: () => permissionApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}