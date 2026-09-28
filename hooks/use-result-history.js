import { useQuery } from "@tanstack/react-query";
import { resultHistoryApi } from "@/lib/api";

export function usePatientResultHistory(patientId, params = {}) {
  return useQuery({
    queryKey: ["result-history", patientId, params],
    queryFn: async () => {
      const res = await resultHistoryApi.getPatientHistory(patientId, params);
      return res.data;
    },
    enabled: !!patientId,
    staleTime: 60_000,
  });
}

export function usePatientAnalyteHistory(patientId, analyteCode, params = {}) {
  return useQuery({
    queryKey: ["result-history", patientId, analyteCode, params],
    queryFn: async () => {
      const res = await resultHistoryApi.getPatientAnalyteHistory(patientId, analyteCode, params);
      return res.data;
    },
    enabled: !!patientId && !!analyteCode,
  });
}

export function useResultHistoryDetails(resultId) {
  return useQuery({
    queryKey: ["result-version-history", resultId],
    queryFn: async () => {
      const res = await resultHistoryApi.getResultHistory(resultId);
      return res.data;
    },
    enabled: !!resultId,
  });
}

export function useDeltaComparison(resultId) {
  return useQuery({
    queryKey: ["result-delta-comparison", resultId],
    queryFn: async () => {
      const res = await resultHistoryApi.getDeltaComparison(resultId);
      return res.data;
    },
    enabled: !!resultId,
  });
}
