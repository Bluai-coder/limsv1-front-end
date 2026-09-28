import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packageApi } from '@/lib/api';

export function usePackages(params) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => packageApi.search(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function usePackage(id) {
  return useQuery({
    queryKey: ['packages', id],
    queryFn: () => packageApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => packageApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => packageApi.update(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['packages'] });
      qc.invalidateQueries({ queryKey: ['packages', variables.id] });
    },
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => packageApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });
}
