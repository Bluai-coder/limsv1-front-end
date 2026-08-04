// hooks/use-admin-dashboard.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useAdminDashboardStats = (options = {}) => {
    return useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/admin/dashboard-stats');
            return response.data?.data || response.data;
        },
        staleTime: 60000,
        ...options
    });
};
