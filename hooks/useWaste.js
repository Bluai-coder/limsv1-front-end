import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================
// GET ALL WASTE RECORDS
// ============================================================
export const useWasteRecords = (filters = {}) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '', 
        waste_type = '',
        from_date = '',
        to_date = ''
    } = filters;

    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('q', search);
    if (status && status !== 'all') params.append('status', status);
    if (waste_type && waste_type !== 'all') params.append('waste_type', waste_type);
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);

    return useQuery({
        queryKey: ['waste-records', filters],
        queryFn: () => api.get(`/waste?${params}`).then(r => r.data),
        staleTime: 30000,
    });
};

// ============================================================
// GET WASTE RECORD BY ID
// ============================================================
export const useWasteRecord = (id) => {
    return useQuery({
        queryKey: ['waste-record', id],
        queryFn: () => api.get(`/waste/${id}`).then(r => r.data),
        enabled: !!id,
    });
};

// ============================================================
// GET WASTE RECORD BY BARCODE
// ============================================================
export const useWasteRecordByBarcode = (barcode) => {
    return useQuery({
        queryKey: ['waste-record-barcode', barcode],
        queryFn: () => api.get(`/waste/barcode/${barcode}`).then(r => r.data),
        enabled: !!barcode,
    });
};

// ============================================================
// GET WASTE SUMMARY
// ============================================================
export const useWasteSummary = () => {
    return useQuery({
        queryKey: ['waste-summary'],
        queryFn: () => api.get('/waste/summary').then(r => r.data),
        staleTime: 60000,
    });
};

// ============================================================
// CREATE WASTE RECORD
// ============================================================
export const useCreateWaste = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => api.post('/waste', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Waste record created successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create waste record');
        },
    });
};

// ============================================================
// UPDATE WASTE STATUS
// ============================================================
export const useUpdateWasteStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/waste/${id}/status`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Waste status updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update status');
        },
    });
};

// ============================================================
// TREAT WASTE
// ============================================================
export const useTreatWaste = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/waste/${id}/treat`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Waste treated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to treat waste');
        },
    });
};

// ============================================================
// DISPOSE WASTE
// ============================================================
export const useDisposeWaste = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/waste/${id}/dispose`, data).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Waste disposed successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to dispose waste');
        },
    });
};

// ============================================================
// DELETE WASTE
// ============================================================
export const useDeleteWaste = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/waste/${id}`).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            queryClient.invalidateQueries({ queryKey: ['waste-summary'] });
            toast.success('Waste record deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete waste record');
        },
    });
};

// ============================================================
// SCAN WASTE BY BARCODE
// ============================================================
export const useScanWaste = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (barcode) => api.get(`/waste/scan/${barcode}`).then(r => r.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['waste-records'] });
            toast.success('Waste record found!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Waste record not found');
        },
    });
};

// ============================================================
// GENERATE BARCODE
// ============================================================
export const useGenerateBarcode = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.post(`/waste/${id}/generate-barcode`).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables] });
            toast.success('Barcode generated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to generate barcode');
        },
    });
};

// ============================================================
// GENERATE QR CODE
// ============================================================
export const useGenerateQR = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.post(`/waste/${id}/generate-qr`).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables] });
            toast.success('QR code generated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to generate QR code');
        },
    });
};

// ============================================================
// GENERATE FULL LABEL
// ============================================================
export const useGenerateLabel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.post(`/waste/${id}/generate-label`).then(r => r.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['waste-record', variables] });
            toast.success('Label generated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to generate label');
        },
    });
};


