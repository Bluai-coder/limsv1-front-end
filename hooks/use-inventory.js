import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, inventoryLotApi, purchaseRequestApi } from '@/lib/api';
import { toast } from 'sonner';

// =======================
// ALERTS & STATS
// =======================
export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: async () => {
      const response = await inventoryApi.getAlerts();
      return response.data;
    },
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await inventoryApi.getStats();
      return response.data;
    },
  });
};

// =======================
// LOTS
// =======================
export const useInventoryLots = (params) => {
  return useQuery({
    queryKey: ['inventory-lots', params],
    queryFn: async () => {
      const response = await inventoryLotApi.list(params);
      return response;
    },
  });
};

export const useCreateLot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await inventoryLotApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Lot added successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-lots'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add lot');
    },
  });
};

export const useUpdateLotStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await inventoryLotApi.updateStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Lot status updated');
      queryClient.invalidateQueries({ queryKey: ['inventory-lots'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lot status');
    },
  });
};

// =======================
// PURCHASE REQUESTS
// =======================
export const usePurchaseRequests = (params) => {
  return useQuery({
    queryKey: ['purchase-requests', params],
    queryFn: async () => {
      const response = await purchaseRequestApi.list(params);
      return response;
    },
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await purchaseRequestApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Purchase request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create purchase request');
    },
  });
};

export const useApprovePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await purchaseRequestApi.approve(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Purchase request approved');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    },
  });
};

export const useRejectPurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await purchaseRequestApi.reject(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Purchase request rejected');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    },
  });
};

export const useMarkOrdered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await purchaseRequestApi.markOrdered(id);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Marked as ordered');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useReceivePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await purchaseRequestApi.receive(id, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Items received and lot created successfully');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-lots'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to receive items');
    },
  });
};
