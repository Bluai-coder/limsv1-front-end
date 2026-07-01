import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================
// GET ALL PACKAGES
// ============================================================
export const useWastePackages = (filters = {}) => {
    const { page = 1, limit = 10, search = '', status = '' } = filters;

    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('q', search);
    if (status && status !== 'all') params.append('status', status);

    return useQuery({
        queryKey: ['waste-packages', filters],
        queryFn: () => api.get(`/waste/packages?${params}`).then(r => r.data),
        staleTime: 30000,
    });
};

// ============================================================
// GET PACKAGE BY ID
// ============================================================
export const useWastePackage = (id) => {
    return useQuery({
        queryKey: ['waste-package', id],
        queryFn: () => api.get(`/waste/packages/${id}`).then(r => r.data),
        enabled: !!id,
    });
};

// ============================================================
// CREATE PACKAGE
// ============================================================
export const useCreateWastePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.post('/waste/packages', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-packages'] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Package created successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create package');
        },
    });
};

// ============================================================
// UPDATE PACKAGE
// ============================================================
export const useUpdateWastePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/waste/packages/${id}`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-packages'] });
            queryClient.invalidateQueries({ queryKey: ['waste-package', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Package updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update package');
        },
    });
};

// ============================================================
// DELETE PACKAGE
// ============================================================
export const useDeleteWastePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/waste/packages/${id}`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-packages'] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Package deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete package');
        },
    });
};