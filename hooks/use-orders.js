
// ===========================================================
// hooks/use-orders.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, orderApi } from '@/lib/api';

export function useOrders(params) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.search(params).then(r => r.data),
    staleTime: 15_000,
  });
}

export function useOrdersByPatientId(params) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApi.getOrdersByPatientId(params).then(r => r.data),
    staleTime: 15_000,
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id], // ✅ Changed from 'orders' to 'order'
    queryFn: () => orderApi.getById(id).then(r => r.data),
    enabled: !!id,
  });
}

// ✅ Fixed: Different query key to avoid cache conflicts
// hooks/use-orders.ts


export function useOrderGetByTestId(orderTestId) {
  return useQuery({
    queryKey: ['order-by-test-id', orderTestId],
    queryFn: () => {
      if (!orderTestId) return null;
      return orderApi.getByTestId(orderTestId).then(r => r.data);
    },
    enabled: !!orderTestId,  //  Only run when orderTestId exists
    staleTime: 5 * 60 * 1000, //  Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   //  Garbage collection time
    retry: 1,                  //  Only retry once
    refetchOnMount: false,     //  Don't refetch on mount
    refetchOnWindowFocus: false, //  Don't refetch on window focus
    refetchOnReconnect: false,   //  Don't refetch on reconnect
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useCreateOrderForBluHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.createForBluHealth(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
  });
}


export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => orderApi.getStats().then(r => r.data),
    refetchInterval: 30_000,
  });
}


// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id , data }) => {
      const response = await api.put(`/orders/edit/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};














export function useUpdateOrderStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      orderApi.updateStatus(id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', 'stats'] });
      qc.invalidateQueries({ queryKey: ['order-by-test-id'] });
    },
  });
}

export function useOrderDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => orderApi.delete(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order"] });
    },
  });
}