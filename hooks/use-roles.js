// ============================================================
// hooks/use-users.ts — User data hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {userRoleApi } from '@/lib/api';

export function useRoles(params) {
  return useQuery({
    queryKey: ["roles", params],
    queryFn: () => userRoleApi.list(params).then((r) => r.data),
    staleTime: 30_000,
  });
}


export function useRoleById(id , tenantId) {
  return useQuery({
    queryKey: ["role-permissions", id, tenantId],
    queryFn: async () => {
      const res = await userRoleApi.getById(id, tenantId);

      // ✅ Extract actual usable data
      return res?.data?.data;
    },
    enabled: !!id && !!tenantId,
  });
}




export function useCreateRole() {
    
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data) => userRoleApi.create(data).then(r => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
    });
}



export function useUpdateRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId, data }) =>
      userRoleApi.edit(id, tenantId, data).then((r) => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
}





export function useDeleteRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tenantId }) =>
      userRoleApi.delete(id, tenantId).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}