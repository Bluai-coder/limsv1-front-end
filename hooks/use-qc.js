

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";


// =============================
// QC LOT HOOKS
// =============================

export const useQcLots = (status) => {
  return useQuery({
    queryKey: ["qc-lots", status],
    queryFn: async () => {
      const url = status && status !== 'all' ? `/qc/lots?status=${status}` : '/qc/lots';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useRegisterQcLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/qc/lots", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-lots"] });
      queryClient.invalidateQueries({ queryKey: ["qc-stats"] });
      toast.success("QC Lot registered successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to register QC lot");
    },
  });
};

// =============================
// QC RESULT HOOKS
// =============================

export const useQcResults = (filters) => {
  return useQuery({
    queryKey: ["qc-results", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.qc_lot_id) params.append("qc_lot_id", filters.qc_lot_id);
      if (filters.westgard_status) params.append("westgard_status", filters.westgard_status);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await api.get(`/qc/results?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000,
  });
};

export const useEnterQcResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/qc/results", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qc-results"] });
      queryClient.invalidateQueries({ queryKey: ["qc-stats"] });
      queryClient.invalidateQueries({ queryKey: ["qc-lots"] });
      
      if (data.evaluation?.westgard_status === 'pass') {
        toast.success(data.message || "QC result passed");
      } else {
        toast.warning(data.message || "QC result failed - instrument locked");
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to enter QC result");
    },
  });
};

export const useUnlockQcResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, corrective_action }) => {
      const response = await api.post(`/qc/results/${id}/unlock`, { corrective_action });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-results"] });
      queryClient.invalidateQueries({ queryKey: ["qc-stats"] });
      queryClient.invalidateQueries({ queryKey: ["qc-lots"] });
      toast.success("Instrument unlocked successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to unlock instrument");
    },
  });
};

// =============================
// DASHBOARD & STATS HOOKS
// =============================

export const useQcStats = (days = 30) => {
  return useQuery({
    queryKey: ["qc-stats", days],
    queryFn: async () => {
      const response = await api.get(`/qc/stats?days=${days}`);
      // ✅ Return the nested data object directly for easy access
      return response.data?.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

export const useLevyJenningsData = (
  analyte_code,
  qc_lot_id,
  days = 90
) => {
  return useQuery({
    queryKey: ["levy-jennings", analyte_code, qc_lot_id, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("analyte_code", analyte_code);
      params.append("days", days.toString());
      if (qc_lot_id) params.append("qc_lot_id", qc_lot_id);
      
      const response = await api.get(`/qc/levy-jennings?${params.toString()}`);
      return response.data;
    },
    enabled: !!analyte_code,
    staleTime: 60000,
  });
};

export const useQcResult = (id) => {
  return useQuery({
    queryKey: ["qc-result", id],
    queryFn: async () => {
      const response = await api.get(`/qc/results/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useQcLot = (id) => {
  return useQuery({
    queryKey: ["qc-lot", id],
    queryFn: async () => {
      const response = await api.get(`/qc/lots/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};