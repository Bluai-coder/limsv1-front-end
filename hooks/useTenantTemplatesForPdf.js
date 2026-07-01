// hooks/usetenantTemplates.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================
// GET ALL TEMPLATES
// ============================================================
export const usetenantTemplates = (filters = {}) => {
    const { search, type } = filters;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);

    return useQuery({
        queryKey: ['tenant-templates', filters],
        queryFn: () => api.get(`/tenant/templates?${params}`).then(r => r.data),
        staleTime: 30000,
    });
};

// ============================================================
// GET SINGLE TEMPLATE
// ============================================================
export const usetenantTemplate = (id) => {
    return useQuery({
        queryKey: ['tenant-template', id],
        queryFn: () => api.get(`/tenant/templates/${id}`).then(r => r.data),
        enabled: !!id,
    });
};

// ============================================================
// GET STATISTICS
// ============================================================
export const usetenantTemplateStatistics = () => {
    return useQuery({
        queryKey: ['tenant-template-statistics'],
        queryFn: () => api.get('/tenant/templates/statistics').then(r => r.data),
        staleTime: 60000,
    });
};

// ============================================================
// CREATE TEMPLATE
// ============================================================
export const useCreatetenantTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.post('/tenant/templates', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const useUpdatetenantTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/tenant/templates/${id}`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const useDeletetenantTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/tenant/templates/${id}`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const useSetDefaulttenantTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.post(`/tenant/templates/${id}/default`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const useDuplicatetenantTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, name }) => api.post(`/tenant/templates/${id}/duplicate`, { name }).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const useToggletenantTemplateActive = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.patch(`/tenant/templates/${id}/toggle`).then(r => r.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tenant-templates'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-template-statistics'] });
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
export const usePreviewtenantTemplate = () => {
    return useMutation({
        mutationFn: (id) => api.get(`/tenant/templates/${id}/preview`, { responseType: 'blob' }).then(r => r.data),
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to preview template');
        },
    });
};