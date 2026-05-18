// hooks/use-reports.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Generate report for order
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await api.post(`/reports/order/${orderId}/generate`, {}, {
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: (data, orderId) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report generated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to generate report");
    },
  });
};

// Get report by order ID
export const useReportByOrderId = (orderId) => {
  return useQuery({
    queryKey: ["report", "order", orderId],
    queryFn: async () => {
      const response = await api.get(`/reports/order/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

// Sign report
export const useSignReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, password }) => {
      const response = await api.post(`/reports/${reportId}/sign`, { password });
      return response.data;
    },
    onSuccess: (data, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ["report", "order"] });
      toast.success("Report signed successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to sign report");
    },
  });
};



export const usePathReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderTestId, password }) => {
      const response = await api.post(`/order-tests/${orderTestId}/path-review`, { password });
      return response.data;
    },
    onSuccess: (data, { orderTestId }) => {
      queryClient.invalidateQueries({ queryKey: ["worklist"] });
      queryClient.invalidateQueries({ queryKey: ["worklist-stats"] });
      toast.success("Pathologist review completed successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Pathologist review failed");
    },
  });
};