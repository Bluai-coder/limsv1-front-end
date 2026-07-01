// hooks/useAdminTemplates.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================
// GET ALL TEMPLATES
// ============================================================
export const useAdminTemplates = (filters = {}) => {
    const { search, type } = filters;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);

    return useQuery({
        queryKey: ['admin-templates', filters],
        queryFn: () => api.get(`/admin/templates?${params}`).then(r => r.data),
        staleTime: 30000,
    });
};

// ============================================================
// GET SINGLE TEMPLATE
// ============================================================
export const useAdminTemplate = (id) => {
    return useQuery({
        queryKey: ['admin-template', id],
        queryFn: () => api.get(`/admin/templates/${id}`).then(r => r.data),
        enabled: !!id,
    });
};

// ============================================================
// GET STATISTICS
// ============================================================
export const useAdminTemplateStatistics = () => {
    return useQuery({
        queryKey: ['admin-template-statistics'],
        queryFn: () => api.get('/admin/templates/statistics').then(r => r.data),
        staleTime: 60000,
    });
};

// ============================================================
// CREATE TEMPLATE
// ============================================================
export const useCreateAdminTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.post('/admin/templates', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success('Template created successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create template');
        },
    });
};

// ============================================================
// UPDATE TEMPLATE
// ============================================================
export const useUpdateAdminTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/templates/${id}`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success('Template updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update template');
        },
    });
};

// ============================================================
// DELETE TEMPLATE
// ============================================================
export const useDeleteAdminTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/admin/templates/${id}`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success('Template deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete template');
        },
    });
};

// ============================================================
// SET DEFAULT TEMPLATE
// ============================================================
export const useSetDefaultAdminTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.post(`/admin/templates/${id}/default`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success('Default template set');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to set default');
        },
    });
};

// ============================================================
// DUPLICATE TEMPLATE
// ============================================================
export const useDuplicateAdminTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }) => api.post(`/admin/templates/${id}/duplicate`, { name }).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success('Template duplicated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to duplicate template');
        },
    });
};

// ============================================================
// TOGGLE ACTIVE STATUS
// ============================================================
export const useToggleAdminTemplateActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.patch(`/admin/templates/${id}/toggle`).then(r => r.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
            queryClient.invalidateQueries({ queryKey: ['admin-template-statistics'] });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to toggle status');
        },
    });
};

// ============================================================
// PREVIEW TEMPLATE
// ============================================================
export const usePreviewAdminTemplate = () => {
    return useMutation({
        mutationFn: (id) => api.get(`/admin/templates/${id}/preview`, { responseType: 'blob' }).then(r => r.data),
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to preview template');
        },
    });
};