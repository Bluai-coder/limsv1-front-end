// ============================================================
// hooks/use-patients.ts — Patient data hooks
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';

export function usePatients(params) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientApi.search(params).then(r => r.data),
    staleTime: 30_000,
  });
}

export function usePatient(id) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientApi.getById(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => patientApi.create(data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      patientApi.update(id, data).then(r => r.data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['patients', variables.id] });
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function usePatientDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      patientApi.delete(id).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

