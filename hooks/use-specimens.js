// ============================================================
// hooks/use-specimens.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, specimenApi } from '@/lib/api';

export function useSpecimens(params) {
  return useQuery({
    queryKey: ['specimens', params],
    queryFn: () => specimenApi.search(params).then(r => r.data),
    staleTime: 15_000,
  });
}




export function useScanSpecimen() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (barcode) =>
      specimenApi.scan(barcode).then((r) => r.data),

    onSuccess: () => {
      qc.invalidateQueries(["specimens"]);
    },
  });
}

export function useCollectSpecimen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => specimenApi.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['specimens'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}





export function useReceiveSpecimen() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }) => {
      const res = await specimenApi.receive(id, data);
      return res.data;
    },

    onSuccess: () => {
      // 🔄 Refresh UI
      qc.invalidateQueries({ queryKey: ['specimens'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },

    onError: (error) => {
      console.error("Receive Specimen Error:", error);
    },
  });
}


// aliquots scan

export function useScanAliquot() {
  return useMutation({
    mutationFn: (barcode) =>
      api.post("/specimens/aliquots/scan", { barcode }),
  });
}


