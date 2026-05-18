// ============================================================
// hooks/use-test-catalog.ts — Test Catalog hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testCatalogApi } from "@/lib/api";

// ============================================================
// GET ALL TESTS (with filters / pagination)
// ============================================================
export function useTestCatalog(params) {
  return useQuery({
    queryKey: ["test-catalog", params],
    queryFn: () => testCatalogApi.list(params).then((r) => r.data),
    staleTime: 30_000,
    keepPreviousData: true, // important for pagination UX
  });
}
export function useTestCatalogPackages(params) {
  return useQuery({
    queryKey: ["test-packages", params],
    queryFn: () => testCatalogApi.listPackages(params).then((r) => r.data),
    staleTime: 30_000,
    keepPreviousData: true, // important for pagination UX
  });
}

// ============================================================
// GET SINGLE TEST
// ============================================================
export function useTestCatalogById(id, tenantId) {
  return useQuery({
    queryKey: ["test-catalog", id, tenantId],
    queryFn: async () => {
      const res = await testCatalogApi.getById(id, tenantId);
      return res.data;
    },
    enabled: !!id && !!tenantId,
  });
}

// ============================================================
// CREATE TEST
// ============================================================
export function useCreateTestCatalog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      testCatalogApi.create(data).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-catalog"] });
    },
  });
}

// ============================================================
// UPDATE TEST
// ============================================================
export function useUpdateTestCatalog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tenantId,
      data,
    }) =>
      testCatalogApi.edit(id, tenantId, data).then((r) => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["test-catalog"] });

      qc.invalidateQueries({
        queryKey: ["test-catalog", variables.id, variables.tenantId],
      });
    },
  });
}

// ============================================================
// DELETE TEST
// ============================================================
export function useDeleteTestCatalog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tenantId,
    }) =>
      testCatalogApi.delete(id, tenantId).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["test-catalog"] });
    },
  });
}