
// hooks/use-results.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";


// =============================
// GET ORDER TEST RESULTS
// =============================
export const useOrderTestResults = (orderTestId) => {
  return useQuery({
    queryKey: ["order-test-results", orderTestId],
    queryFn: async () => {
      if (!orderTestId) return null;
      const response = await api.get(`/worklist/order-tests/${orderTestId}/results`);
      return response.data;
    },
    enabled: !!orderTestId,
    staleTime: 30000,
  });
};

// =============================
// GET ORDER TEST WITH RESULTS
// =============================
export const useOrderTestWithResults = (orderTestId) => {
  return useQuery({
    queryKey: ["order-test-with-results", orderTestId],
    queryFn: async () => {
      if (!orderTestId) return null;
      const response = await api.get(`/worklist/order-tests/${orderTestId}`);
      return response.data;
    },
    enabled: !!orderTestId,
  });
};

// =============================
// ENTER RESULTS (BATCH)
// =============================
export const useEnterResults = (orderTestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/worklist/results/batch/${orderTestId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-test-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-by-test-id"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      toast.success("Results saved successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to save results");
    },
  });
};

// =============================
// UPDATE SINGLE RESULT
// =============================
export const useUpdateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, value, numeric_value, comment }) => {
      const response = await api.put(`/worklist/results/${id}`, { value, numeric_value, comment });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order-test-results"] });
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      toast.success("Result updated successfully");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// AUTO VERIFY
// =============================
export const useAutoVerify = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderTestId) => {
      const response = await api.post(`/worklist/results/auto-verify/${orderTestId}`);
      return response.data;
    },
    onSuccess: (data, orderTestId) => {
      queryClient.invalidateQueries({ queryKey: ["order-test-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-by-test-id"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      queryClient.invalidateQueries({ queryKey: ["worklist-stats"] });
      
      if (data.verified) {
        toast.success(data.reason || "Auto-verification passed");
      } else {
        toast.warning(data.reason || "Auto-verification failed - review required");
      }
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// PATH REVIEW with E-Signature
// =============================
export const usePathReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderTestId, password, notes, userId }) => {
      const response = await api.post(`/worklist/results/path-review/${orderTestId}`, { 
        password, 
        notes,
        userId 
      });
      return response.data;
    },
    onSuccess: (data, { orderTestId }) => {
      queryClient.invalidateQueries({ queryKey: ["order-test-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["order-by-test-id"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      queryClient.invalidateQueries({ queryKey: ["worklist-stats"] });
      toast.success("Pathologist review completed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Pathologist review failed");
    },
  });
};

// =============================
// VERIFY SINGLE RESULT
// =============================


// =============================
// BATCH VERIFY
// =============================
export const useBatchVerify = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderTestIds) => {
      const response = await api.post("/worklist/results/batch-verify", { order_test_ids: orderTestIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      queryClient.invalidateQueries({ queryKey: ["worklist-stats"] });
      queryClient.invalidateQueries({ queryKey: ["order-test-results"] });
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results"] });
      toast.success("Batch verification completed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Batch verification failed");
    },
  });
};

// =============================
// GET WORKLIST
// =============================
export const useWorklist = (filters) => {
  return useQuery({
    queryKey: ["worklist", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.department) params.append("department", filters.department);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.q) params.append("q", filters.q);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.days) params.append("days", filters.days.toString());

      const response = await api.get(`/worklist?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// =============================
// GET WORKLIST STATS (for dashboard)
// =============================
export const useWorklistStats = () => {
  return useQuery({
    queryKey: ["worklist-stats"],
    queryFn: async () => {
      const response = await api.get("/worklist/stats");
      return response.data;
    },
    staleTime: 30000,
    refetchInterval: 60000, // Refresh every minute
  });
};

// =============================
// GET CRITICAL NOTIFICATIONS
// =============================
export const useCriticalNotifications = (status = "pending") => {
  return useQuery({
    queryKey: ["critical-notifications", status],
    queryFn: async () => {
      const response = await api.get(`/notifications?type=critical_value&status=${status}`);
      return response.data;
    },
    staleTime: 30000,
  });
};

// =============================
// CONFIRM CRITICAL VALUE
// =============================
export const useConfirmCriticalValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, confirmedBy, contactMethod, contactValue }) => {
      const response = await api.post(`/critical-values/confirm/${id}`, {
        confirmed_by: confirmedBy,
        contact_method: contactMethod,
        contact_value: contactValue,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["critical-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      queryClient.invalidateQueries({ queryKey: ["worklist-stats"] });
      toast.success("Critical value confirmed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to confirm critical value");
    },
  });
};

// =============================
// GET DELTA CHECK RULES
// =============================
export const useDeltaRules = () => {
  return useQuery({
    queryKey: ["delta-rules"],
    queryFn: async () => {
      const response = await api.get("/delta-rules");
      return response.data;
    },
  });
};

// =============================
// CREATE DELTA CHECK RULE
// =============================
export const useCreateDeltaRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/delta-rules", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delta-rules"] });
      toast.success("Delta rule created");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// UPDATE DELTA CHECK RULE
// =============================
export const useUpdateDeltaRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/delta-rules/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delta-rules"] });
      toast.success("Delta rule updated");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// DELETE DELTA CHECK RULE
// =============================
export const useDeleteDeltaRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/delta-rules/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delta-rules"] });
      toast.success("Delta rule deleted");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// GET AUTO VERIFICATION RULES
// =============================
export const useAutoVerifyRules = () => {
  return useQuery({
    queryKey: ["auto-verify-rules"],
    queryFn: async () => {
      const response = await api.get("/auto-verify-rules");
      return response.data;
    },
  });
};

// =============================
// CREATE AUTO VERIFICATION RULE
// =============================
export const useCreateAutoVerifyRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auto-verify-rules", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-verify-rules"] });
      toast.success("Auto-verify rule created");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// GET REFLEX TEST RULES
// =============================
export const useReflexRules = () => {
  return useQuery({
    queryKey: ["reflex-rules"],
    queryFn: async () => {
      const response = await api.get("/reflex-rules");
      return response.data;
    },
  });
};

// =============================
// CREATE REFLEX TEST RULE
// =============================
export const useCreateReflexRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/reflex-rules", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflex-rules"] });
      toast.success("Reflex rule created");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// GET REPORT TEMPLATES
// =============================
export const useReportTemplates = () => {
  return useQuery({
    queryKey: ["report-templates"],
    queryFn: async () => {
      const response = await api.get("/report-templates");
      return response.data;
    },
  });
};

// =============================
// GENERATE REPORT
// =============================
export const useGenerateReport = (orderId) => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/reports/order/${orderId}/generate`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Report generated successfully");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// SIGN REPORT
// =============================
export const useReport = (reportId) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const response = await api.get(`/reports/${reportId}`);
      return response.data.data || response.data;
    },
    enabled: !!reportId,
  });
};

export const useSignReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, password }) => {
      const response = await api.post(`/reports/${reportId}/sign`, { password });
      return response.data;
    },
    onSuccess: (data, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      toast.success("Report signed successfully");
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};

// =============================
// DELIVER REPORT
// =============================
export const useDeliverReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, channel, recipient }) => {
      const response = await api.post(`/reports/${reportId}/deliver`, { channel, recipient });
      return response.data;
    },
    onSuccess: (data, { reportId, channel }) => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      toast.success(`Report sent via ${channel}`);
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error?.message || 'Operation failed';
      toast.error(msg);
    },
  });
};





// hooks/use-results.ts

// Save results (draft)
export const useSaveResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderTestId, results }) => {
      const response = await api.post(`/worklist/order-tests/${orderTestId}/results`, { results });
      return response.data;
    },
    onSuccess: (data, { orderTestId }) => {
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results", orderTestId] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      toast.success(data.message || "Results saved successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to save results");
    },
  });
};

// Verify single result
export const useVerifyResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resultId) => {
      const response = await api.post(`/worklist/results/${resultId}/verify`);
      return response.data;
    },
    onSuccess: (data, resultId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["order-test-with-results"] });
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      toast.success(data.message || "Result verified successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to verify result");
    },
  });
};