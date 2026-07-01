// hooks/useNotifications.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

// =============================
// NOTIFICATION HOOKS
// =============================

/**
 * Get user notifications with filters
 */
export const useNotifications = (filters = {}) => {
    return useQuery({
        queryKey: ["notifications", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.type) params.append("type", filters.type);
            if (filters.unreadOnly) params.append("unreadOnly", "true");
            if (filters.page) params.append("page", filters.page.toString());
            if (filters.limit) params.append("limit", filters.limit.toString());
            if (filters.userId) params.append("userId", filters.userId);

            if (filters.offset) params.append("offset", filters.offset.toString());

            const response = await api.get(`/notifications?${params.toString()}`);
            return response.data;
        },
        staleTime: 30000,
        refetchInterval: 60000, // Auto-refetch every 60 seconds
    });
};

/**
 * Get notification counts (unseen, unread, total)
 */
export const useNotificationCounts = (userId) => {
    return useQuery({
        queryKey: ["notifications", "counts"],
        queryFn: async () => {
            const response = await api.get(`/notifications/counts?userId=${userId}`);
            return response.data;
        },
        staleTime: 10000,
        refetchInterval: 30000, // Refetch every 30 seconds to update badge
    });
};

/**
 * Get unread notification count (for backward compatibility)
 */
export const useUnreadNotificationCount = () => {
    const { data, ...rest } = useNotificationCounts();
    return {
        data: { unreadCount: data?.unreadCount || 0 },
        ...rest,
    };
};

/**
 * Get single notification by ID
 */
export const useNotification = (notificationId) => {
    return useQuery({
        queryKey: ["notification", notificationId],
        queryFn: async () => {
            const response = await api.get(`/notifications/${notificationId}`);
            return response.data;
        },
        enabled: !!notificationId,
    });
};

/**
 * Create a new notification
 */
export const useCreateNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/notifications", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            toast.success("Notification created successfully");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to create notification");
        },
    });
};

/**
 * Mark all notifications as seen (when user opens dropdown)
 */
export const useMarkAllAsSeen = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.put(`/notifications/seen?userId=${userId}`);
            return response.data;
        },
        onSuccess: (data) => {
            // Update cache immediately for better UX
            queryClient.setQueryData(["notifications", "counts"], (old) => {
                if (old) {
                    return {
                        ...old,
                        unseenCount: 0,
                    };
                }
                return old;
            });

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
        },
        onError: (error) => {
            console.error("Failed to mark as seen:", error);
        },
    });
};

/**
 * Mark a single notification as seen
 */
export const useMarkSingleAsSeen = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId) => {
            const response = await api.put(`/notifications/${notificationId}/seen?userId=${userId}`);
            return response.data;
        },
        onSuccess: (data, notificationId) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            queryClient.invalidateQueries({ queryKey: ["notification", notificationId] });
        },
        onError: (error) => {
            console.error("Failed to mark as seen:", error);
        },
    });
};

/**
 * Mark a single notification as read
 */
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ notificationId, userId }) => {  // Changed to object parameter
            console.log("userId:", userId);
            const response = await api.put(`/notifications/${notificationId}/read?userId=${userId}`);
            return response.data;
        },
        onSuccess: (data, variables) => {  // variables contains the passed object
            // Update cache immediately
            queryClient.setQueryData(["notifications", "counts"], (old) => {
                if (old) {
                    return {
                        ...old,
                        unreadCount: Math.max(0, (old.unreadCount || 0) - 1),
                    };
                }
                return old;
            });

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            queryClient.invalidateQueries({ queryKey: ["notification", variables.notificationId] });
            toast.success("Marked as read");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to mark as read");
        },
    });
};
/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId) => {
            const response = await api.put(`/notifications/read-all?userId=${userId}`);
            return response.data;
        },
        onSuccess: (data) => {
            // Update cache immediately
            queryClient.setQueryData(["notifications", "counts"], (old) => {
                if (old) {
                    return {
                        ...old,
                        unreadCount: 0,
                    };
                }
                return old;
            });

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            toast.success("All notifications marked as read");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to mark all as read");
        },
    });
};

/**
 * Delete a notification
 */
export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId) => {
            const response = await api.delete(`/notifications/${notificationId}`);
            return response.data;
        },
        onSuccess: (data, notificationId) => {
            // Update counts cache
            queryClient.setQueryData(["notifications", "counts"], (old) => {
                if (old) {
                    return {
                        ...old,
                        totalCount: Math.max(0, (old.totalCount || 0) - 1),
                    };
                }
                return old;
            });

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            queryClient.invalidateQueries({ queryKey: ["notification", notificationId] });
            toast.success("Notification deleted");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete notification");
        },
    });
};

/**
 * Bulk delete notifications
 */
export const useBulkDeleteNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationIds) => {
            const response = await api.post("/notifications/bulk-delete", { ids: notificationIds });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            toast.success("Notifications deleted");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to delete notifications");
        },
    });
};

/**
 * Send system notification to multiple users
 */
export const useSendSystemNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/notifications/system", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
            toast.success("System notification sent");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to send system notification");
        },
    });
};

/**
 * Refresh notifications manually (polling)
 */
export const useRefreshNotifications = () => {
    const queryClient = useQueryClient();

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["notifications", "counts"] });
    };

    return { refresh };
};