// hooks/use-tenants.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '@/lib/api';

export function useTenants(params) {
  return useQuery({
    queryKey: ["tenants", params],
    queryFn: () => tenantApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useTenantById(id) {
  return useQuery({
    queryKey: ["tenants", id],
    queryFn: () => tenantApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => tenantApi.create(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tenantApi.edit(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      qc.invalidateQueries({ queryKey: ["tenants", variables.id] });
    },
  });
}

export function useDeleteTenant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => tenantApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}