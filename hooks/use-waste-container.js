import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================
// GET ALL CONTAINERS
// ============================================================
export const useWasteContainers = (filters = {}) => {
    const { page = 1, limit = 10, search = '', status = '' } = filters;

    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('q', search);
    if (status && status !== 'all') params.append('status', status);

    return useQuery({
        queryKey: ['waste-containers', filters],
        queryFn: () => api.get(`/waste/containers?${params}`).then(r => r.data),
        staleTime: 30000,
    });
};

// ============================================================
// GET CONTAINER BY ID
// ============================================================
export const useWasteContainer = (id) => {
    return useQuery({
        queryKey: ['waste-container', id],
        queryFn: () => api.get(`/waste/containers/${id}`).then(r => r.data),
        enabled: !!id,
    });
};

// ============================================================
// CREATE CONTAINER
// ============================================================
export const useCreateWasteContainer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.post('/waste/containers', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-containers'] });
            toast.success('Container created successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create container');
        },
    });
};

// ============================================================
// UPDATE CONTAINER
// ============================================================
export const useUpdateWasteContainer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/waste/containers/${id}`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-containers'] });
            queryClient.invalidateQueries({ queryKey: ['waste-container', variables.id] });
            toast.success('Container updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update container');
        },
    });
};

// ============================================================
// DELETE CONTAINER
// ============================================================
export const useDeleteWasteContainer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/waste/containers/${id}`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-containers'] });
            toast.success('Container deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete container');
        },
    });
};