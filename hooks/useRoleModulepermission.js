// ============================================================
// hooks/use-users.ts — User data hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi, userApi, useRoleModulepermission, userRoleApi } from '@/lib/api';
export function useCreateRolesModulesPermissions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      useRoleModulepermission.create(data).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function useRoleModulesPermissionsById(id, tenantId) {
  
  return useQuery({
    queryKey: ["role-permissions", id, tenantId],
    queryFn: async () => {
      const res = await useRoleModulepermission.getById(id, tenantId);

      // ✅ Extract actual usable data
      return res?.data?.data;
    },
    enabled: !!id && !!tenantId,
  });
}