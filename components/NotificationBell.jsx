// components/NotificationBell.jsx
'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

import Link from 'next/link';

import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  CheckCheck,
  ExternalLink,
  Loader2
} from 'lucide-react';

import { createPortal } from 'react-dom';
import {
  useNotifications,
  useNotificationCounts,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useMarkAllAsSeen
} from '@/hooks/useNotifications';
import { useAuthStore } from '@/lib/auth-store';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [dropdownStyle, setDropdownStyle] = useState({});

  const { user } = useAuthStore();

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const hasMarkedSeen = useRef(false);



  // API Hooks
  const { data: notificationsData, isLoading, refetch } = useNotifications({
    limit: 50,
    userId: user.id,
    offset: 0,
    unreadOnly: activeTab === 'unread'
  });

  const { data: countsData, refetch: refetchCounts } = useNotificationCounts(user.id);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const markAllAsSeenMutation = useMarkAllAsSeen(user.id);

  const notifications = notificationsData?.data || [];
  const total = notificationsData?.total || 0;
  const unseenCount = countsData?.unseenCount || 0;
  const unreadCount = countsData?.unreadCount || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mark as seen when dropdown opens (only once per open)
  useEffect(() => {
    if (isOpen && !hasMarkedSeen.current && unseenCount > 0) {
      hasMarkedSeen.current = true;
      markAllAsSeenMutation.mutate();
      refetchCounts();
    }

    if (!isOpen) {
      hasMarkedSeen.current = false;
    }
  }, [isOpen, unseenCount, markAllAsSeenMutation, refetchCounts]);

  // Refetch when tab changes or dropdown opens
  useEffect(() => {
    if (isOpen) {
      refetch();
      refetchCounts();
    }
  }, [activeTab, isOpen, refetch, refetchCounts]);

  // responsive dropdown positioning
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;

      if (isMobile) {
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 10,
          left: 12,
          right: 12,
          width: 'auto',
          zIndex: 999999
        });
      } else {
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 10,
          right: window.innerWidth - rect.right,
          width: 420,
          zIndex: 999999
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isOpen]);

  // outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // mark single read
  // mark single read - receives object with id and userId
  const handleMarkAsRead = useCallback(async ({ id, userId }) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId: id, userId });
      refetch();
      refetchCounts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [markAsReadMutation, refetch, refetchCounts]);

  // mark all read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync(user.id);
      refetch();
      refetchCounts();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [markAllAsReadMutation, refetch, refetchCounts]);

  // delete notification
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      refetch();
      refetchCounts();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [deleteNotificationMutation, refetch, refetchCounts]);

  // format time
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return 'Just now';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }, []);

  // icon
  const getNotificationIcon = useCallback((type) => {
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

  // background
  const getBgColor = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'warning':
      case 'alert':
        return 'bg-amber-100 dark:bg-amber-900/20';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20';
    }
  }, []);

  // priority badge
  const getPriorityBadge = useCallback((priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-medium">URGENT</span>;
      case 'high':
        return <span className="ml-2 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-medium">HIGH</span>;
      default:
        return null;
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

  return (
    <>
      {/* bell button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />

        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold animate-pulse">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {/* dropdown */}
      {mounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {unreadCount} unread · {total} total
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                  title="Mark all as read"
                >
                  {markAllAsReadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              All
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* body */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 px-4">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Bell className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${isUnseen(notification)
                    ? 'bg-blue-50/40 dark:bg-blue-900/10'
                    : isSeenButUnread(notification)
                      ? 'opacity-75'
                      : ''
                    }`}
                >
                  {/* Blue dot indicator for unseen notifications */}
                  {isUnseen(notification) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                  )}

                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-1">
                              <h4 className={`text-sm font-semibold truncate ${isUnseen(notification)
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>

                            <p className={`text-xs sm:text-sm mt-1 break-words ${isUnseen(notification)
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-500 dark:text-gray-500'
                              }`}>
                              {notification.message}
                            </p>

                            <p className="text-[11px] text-gray-400 mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>

                          {/* actions */}
                          <div className="flex gap-1 flex-shrink-0">
                            {notification.status !== 'read' && (
                              <button
                                onClick={() => handleMarkAsRead({
                                  id: notification.id,
                                  userId: user.id
                                })} disabled={markAsReadMutation.isPending}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                title="Mark as read"
                              >
                                {markAsReadMutation.isPending && markAsReadMutation.variables === notification.id ? (
                                  <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                              title="Delete"
                            >
                              {deleteNotificationMutation.isPending && deleteNotificationMutation.variables === notification.id ? (
                                <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* link */}
                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            onClick={() => {
                              if (notification.status !== 'read') {
                                handleMarkAsRead(notification.id);
                              }
                              setIsOpen(false);
                            }}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            View details
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* footer */}
          {total > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full text-center block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>,
        document.body
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}</style>
    </>
  );
}