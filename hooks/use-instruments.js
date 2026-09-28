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
// 🔹 STATS
// ============================================================
export function useInstrumentStats() {
  return useQuery({
    queryKey: ["instruments", "stats"],
    queryFn: () => instrumentApi.getStats().then((r) => r.data),
    refetchInterval: 30_000,
  });
}

// ============================================================
// 🔹 GET MAINTENANCE
// ============================================================
export function useInstrumentMaintenance(id) {
  return useQuery({
    queryKey: ["instruments", id, "maintenance"],
    queryFn: () => instrumentApi.getMaintenance(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ============================================================
// 🔹 GET QUALIFICATIONS
// ============================================================
export function useInstrumentQualifications(id) {
  return useQuery({
    queryKey: ["instruments", id, "qualifications"],
    queryFn: () => instrumentApi.getQualifications(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ============================================================
// 🔹 GET INTERFACES
// ============================================================
export function useInstrumentInterfaces(id) {
  return useQuery({
    queryKey: ["instruments", id, "interfaces"],
    queryFn: () => instrumentApi.getInterfaces(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ============================================================
// 🔹 GET LOGS
// ============================================================
export function useInstrumentLogs(id) {
  return useQuery({
    queryKey: ['instrument', id, 'logs'],
    queryFn: () => instrumentApi.getLogs(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ============================================================
// 🔹 GLOBAL QUERIES (ALL INSTRUMENTS)
// ============================================================

export function useAllMaintenance() {
  return useQuery({
    queryKey: ['instruments', 'all-maintenance'],
    queryFn: () => instrumentApi.getAllMaintenance().then((r) => r.data),
  });
}

export function useAllQualifications() {
  return useQuery({
    queryKey: ['instruments', 'all-qualifications'],
    queryFn: () => instrumentApi.getAllQualifications().then((r) => r.data),
  });
}

export function useAllInterfaces() {
  return useQuery({
    queryKey: ['instruments', 'all-interfaces'],
    queryFn: () => instrumentApi.getAllInterfaces().then((r) => r.data),
  });
}

export function useAllLogs() {
  return useQuery({
    queryKey: ['instruments', 'all-logs'],
    queryFn: () => instrumentApi.getAllLogs().then((r) => r.data),
  });
}

// ============================================================
// 🔹 CREATE MUTATIONS FOR RELATIONS
// ============================================================

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => instrumentApi.createMaintenance(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['instrument', variables.id, 'maintenance'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-maintenance'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-logs'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.message || 'Failed to log maintenance'),
  });
}

export function useCreateQualification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => instrumentApi.createQualification(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['instrument', variables.id, 'qualifications'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-qualifications'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-logs'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.message || 'Failed to log qualification'),
  });
}

export function useCreateInterface() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => instrumentApi.createInterface(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['instrument', variables.id, 'interfaces'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-interfaces'] });
      qc.invalidateQueries({ queryKey: ['instruments', 'all-logs'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || err?.message || 'Failed to create integration'),
  });
}