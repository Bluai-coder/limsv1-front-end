// ============================================================
// hooks/use-test-packages.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testPackageCatalogApi } from "@/lib/api";

// ============================================================
// LIST PACKAGES
// ============================================================
export function useTestPackages(params) {
  return useQuery({
    queryKey: ["test-packages", params],
    queryFn: () =>
      testPackageCatalogApi.list(params).then((r) => r.data),

    keepPreviousData: true,
    staleTime: 30_000,
  });
}

// ============================================================
// GET PACKAGE BY ID
// ============================================================
export function useTestPackageById(id, tenantId) {
  return useQuery({
    queryKey: ["test-package", id, tenantId],
    queryFn: () =>
      testPackageCatalogApi.getById(id, tenantId).then((r) => r.data),

    enabled: !!id && !!tenantId,
  });
}

// ============================================================
// CREATE PACKAGE
// ============================================================
export function useCreateTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      testPackageCatalogApi.create(data).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-packages"] });
    },
  });
}

// ============================================================
// UPDATE PACKAGE
// ============================================================
export function useUpdateTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tenantId,
      data,
    }) =>
      testPackageCatalogApi.edit(id, tenantId, data).then((r) => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["test-packages"] });

      qc.invalidateQueries({
        queryKey: ["test-package", variables.id, variables.tenantId],
      });
    },
  });
}

// ============================================================
// DELETE PACKAGE
// ============================================================
export function useDeleteTestPackage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tenantId,
    }) =>
      testPackageCatalogApi.delete(id, tenantId).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-packages"] });
    },
  });
}