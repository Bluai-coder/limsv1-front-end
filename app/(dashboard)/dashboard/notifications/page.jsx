// app/notifications/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import {
  useNotifications,
  useNotificationCounts,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification
} from '@/hooks/use-notifications';
import { useAuthStore } from '@/lib/auth-store';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

    const { user } = useAuthStore();
  
  // Fetch notifications with filters
  const { 
    data: notificationsData, 
    isLoading, 
    refetch: refetchNotifications 
  } = useNotifications({
    limit,
    offset: (page - 1) * limit,
    unreadOnly: filter === 'unread'
  });

  // Fetch counts for header
  const { 
    data: countsData, 
    refetch: refetchCounts 
  } = useNotificationCounts();

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.data || [];
  const total = notificationsData?.total || 0;
  const unreadCount = countsData?.unreadCount || 0;
  const totalPages = Math.ceil(total / limit);

  // Refetch when filter or page changes
  useEffect(() => {
    refetchNotifications();
    refetchCounts();
  }, [filter, page, refetchNotifications, refetchCounts]);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead.mutateAsync(id);
      refetchNotifications();
      refetchCounts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [markAsRead, refetchNotifications, refetchCounts]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead.mutateAsync(user.id);
      refetchNotifications();
      refetchCounts();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } 
  }, [markAllAsRead, refetchNotifications, refetchCounts]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification.mutateAsync(id);
      refetchNotifications();
      refetchCounts();
    } catch (error) {  
      console.error('Failed to delete notification:', error);
    }
  }, [deleteNotification, refetchNotifications, refetchCounts]);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }, []);

  const getIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'success': 
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': 
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: 
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  }, []);

  // Check if notification is unseen (has blue dot)
  const isUnseen = useCallback((notification) => {
    return !notification.seen_at && notification.status !== 'read';
  }, []);

  // Check if notification is unread but seen (faded)
  const isSeenButUnread = useCallback((notification) => {
    return notification.seen_at && notification.status !== 'read';
  }, []);

  const handleRefresh = useCallback(() => {
    refetchNotifications();
    refetchCounts();
  }, [refetchNotifications, refetchCounts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread · {total} total · Stay updated with your latest activities
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All ({total})
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No notifications
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border transition-all hover:shadow-md ${
                  isUnseen(notif)
                    ? 'border-l-4 border-l-blue-600 dark:border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                    : isSeenButUnread(notif)
                    ? 'border-gray-200 dark:border-gray-800 opacity-75'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold ${
                              isUnseen(notif)
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {notif.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(notif.priority)}`}>
                              {notif.priority || 'normal'}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            isUnseen(notif)
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-1">
                          {notif.status !== 'read' && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              disabled={markAsRead.isPending}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                              title="Mark as read"
                            >
                              {markAsRead.isPending && markAsRead.variables === notif.id ? (
                                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                              ) : (
                                <CheckCheck className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            disabled={deleteNotification.isPending}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            title="Delete"
                          >
                            {deleteNotification.isPending && deleteNotification.variables === notif.id ? (
                              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Link */}
                      {notif.action_url && (
                        <Link
                          href={notif.action_url}
                          onClick={() => {
                            if (notif.status !== 'read') {
                              handleMarkAsRead(notif.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition"
                        >
                          View details
                          <ArrowLeft className="w-3 h-3 rotate-180" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      page === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
