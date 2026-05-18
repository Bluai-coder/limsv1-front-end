// ============================================================
// hooks/use-users.ts — User data hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi, userApi } from '@/lib/api';

export function useUsers(params) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useUserById(id, tenantId) {
  return useQuery({
    queryKey: ["users", id, tenantId],
    queryFn: () => userApi.getById(id, tenantId).then((r) => r.data),
    enabled: !!id && !!tenantId,
  });
}

export function useCreateUser() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data) => userApi.create(data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId, data }) =>
      userApi.edit(id, tenantId, data).then((r) => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }) =>
      userApi.delete(id, tenantId).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}