// ============================================================
// hooks/use-instruments.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instrumentApi } from "@/lib/api";
import { toast } from "sonner";

// ============================================================
// 🔹 GET ALL INSTRUMENTS
// ============================================================
export function useInstruments(params) {
  return useQuery({
    queryKey: ["instruments", params],
    queryFn: () => instrumentApi.list(params).then((r) => r.data),
    staleTime: 15_000,
    keepPreviousData: true,
  });
}

// ============================================================
// 🔹 GET SINGLE INSTRUMENT
// ============================================================
export function useInstrument(id) {
  return useQuery({
    queryKey: ["instruments", id],
    queryFn: () => instrumentApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ============================================================
// 🔹 CREATE INSTRUMENT
// ============================================================
export function useCreateInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      instrumentApi.create(data).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["instruments"],
        exact: false,
      });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
}

// ============================================================
// 🔹 UPDATE INSTRUMENT
// ============================================================
export function useUpdateInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      instrumentApi.update(id, data).then((r) => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["instruments"], exact: false });
      qc.invalidateQueries({ queryKey: ["instruments", variables.id] });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
}

// ============================================================
// 🔹 DELETE INSTRUMENT (🔥 WITH OPTIMISTIC UPDATE)
// ============================================================
export function useDeleteInstrument() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      instrumentApi.delete(id).then((r) => r.data),

    // 🔥 INSTANT UI UPDATE
    onMutate: async (deletedId) => {
      await qc.cancelQueries({ queryKey: ["instruments"] });

      const previous = qc.getQueriesData({ queryKey: ["instruments"] });

      qc.setQueriesData(
        { queryKey: ["instruments"] },
        (old) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.filter((item) => item.id !== deletedId),
          };
        }
      );

      return { previous };
    },

    // 🔥 ROLLBACK IF ERROR
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      const msg = _err?.response?.data?.message || _err?.message || 'Operation failed';
      toast.error(msg);
    },

    // 🔥 FINAL SYNC
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["instruments"],
        exact: false,
      });
    },
  });
}

// ============================================================
// 🔹 OPTIONAL: STATS
// ============================================================
export function useInstrumentStats() {
  return useQuery({
    queryKey: ["instruments", "stats"],
    queryFn: () => instrumentApi.getStats().then((r) => r.data),
    refetchInterval: 30_000,
  });
}