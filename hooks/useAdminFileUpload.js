


// hooks/useAdminFileUpload.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const adminFileUploadApi = {
    upload: (formData) => api.post('/admin-file-upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: (params) => api.get('/admin-file-upload', { params }),
    getById: (id) => api.get(`/admin-file-upload/${id}`),
    getData: (id) => api.get(`/admin-file-upload/${id}/data`),
    delete: (id) => api.delete(`/admin-file-upload/${id}`),
};

// Get all uploads
export const useAdminUploads = (filters = {}) => {
    return useQuery({
        queryKey: ['admin-file-uploads', filters],
        queryFn: () => adminFileUploadApi.getAll(filters).then(r => r.data),
        staleTime: 30000,
    });
};

// Get upload by ID
export const useAdminUpload = (id) => {
    return useQuery({
        queryKey: ['admin-file-upload', id],
        queryFn: () => adminFileUploadApi.getById(id).then(r => r.data),
        enabled: !!id,
    });
};

// Get upload data (JSON content)
export const useAdminUploadData = (id) => {
    return useQuery({
        queryKey: ['admin-file-upload-data', id],
        queryFn: () => adminFileUploadApi.getData(id).then(r => r.data),
        enabled: !!id,
    });
};

// Upload JSON file
export const useUploadAdminFile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (formData) => adminFileUploadApi.upload(formData).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-file-uploads'] });
            toast.success('File uploaded successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Upload failed');
        },
    });
};

// Delete upload
export const useDeleteAdminUpload = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id) => adminFileUploadApi.delete(id).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-file-uploads'] });
            toast.success('Upload deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Delete failed');
        },
    });
};