'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorklist, useWorklistStats } from '@/hooks/use-results';
import { calculateAge } from '@/lib/utils';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  Loader2,
  AlertTriangle,
  Zap,
  CheckCircle,
  Clock,
  PlusCircle
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function ResultEntryPage() {
  const { canRead } = usePermissions();

  // Check if user has read access
  if (!canRead('Worklist')) {
    return <PermissionDenied resource="Worklist" action="read" />;
  }

  const router = useRouter();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch worklist data with pending and in_progress status only
  const { data: worklistData, isLoading, refetch: refetchWorklist } = useWorklist({
    status: 'pending', // Only show pending and in progress
    q: debouncedSearch || undefined,
    page,
    limit
  });

  const { data: stats, refetch: refetchStats } = useWorklistStats();

  const items = worklistData?.data || [];
  const pagination = worklistData?.pagination;
  const displayStats = stats?.data;

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refetchWorklist();
      refetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchWorklist, refetchStats]);

  const getStatusBadge = (status, alerts) => {
    if (alerts?.has_critical) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> CRITICAL
        </span>
      );
    }
    if (alerts?.has_delta_failure) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
          <AlertTriangle className="w-3 h-3" /> Delta Fail
        </span>
      );
    }
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Pending</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">In Progress</span>;
      case 'resulted':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Results Ready</span>;
      case 'tech_verified':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300">Tech Verified</span>;
      case 'path_verified':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">Path Verified</span>;
      case 'auto_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
            <Zap className="w-3 h-3" /> Auto
          </span>
        );
      case 'reported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <CheckCircle className="w-3 h-3" /> Reported
          </span>
        );
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{status || 'Pending'}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'stat':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse">
            STAT
          </span>
        );
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
            Urgent
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Routine
          </span>
        );
    }
  };

  const getProgressColor = (hasCritical, hasDeltaFail) => {
    if (hasCritical) return 'bg-red-500';
    if (hasDeltaFail) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const handleEnterResult = (orderTestId) => {
    router.push(`/dashboard/results/${orderTestId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Result Entry</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {pagination?.total ?? 0} test(s) pending result entry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Total Pending</p>
                <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">
                  {(displayStats?.pending ?? 0) + (displayStats?.in_progress ?? 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-inner">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">{displayStats?.pending ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-inner">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">In Progress</p>
                <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">{displayStats?.in_progress ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-inner">
                <Loader2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">Results Ready</p>
                <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">{displayStats?.resulted ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div> */}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, patient name, or MRN..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>

        {/* Worklist Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Order / Test</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Dept</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length > 0 ? (
                  items.map((item, index) => {
                    const progress = item.progress || { entered: 0, total: 0 };
                    const percent = progress.total > 0 ? (progress.entered / progress.total) * 100 : 0;
                    const serialNumber = (page - 1) * limit + index + 1;
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {serialNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {item.order?.orderNumber}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.test?.name}</div>
                          {item.test?.code && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">Code: {item.test.code}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.order?.patient?.firstName} {item.order?.patient?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.order?.patient?.mrn}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {calculateAge(item.order?.patient?.dateOfBirth)} yrs • {item.order?.patient?.gender || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.test?.department || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {progress.entered}/{progress.total}
                          </div>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getProgressColor(item.alerts?.has_critical, item.alerts?.has_delta_failure)}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {item.alerts?.has_critical && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Critical Value
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">{getPriorityBadge(item.order?.priority)}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.status, item.alerts)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleEnterResult(item.id)}
                            className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            {progress.entered === 0 ? 'Enter Result' : 'Continue'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No tests pending result entry</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All caught up! Check back later.</p>
                      <Link
                        href="/dashboard/results"
                        className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all results →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} items
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
          {/* <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Tests</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{pagination?.total || 0}</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayStats?.pending || 0}</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayStats?.in_progress || 0}</p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Results Ready</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{displayStats?.resulted || 0}</p>
            </div>
          </div> */}
      </div>
    </div>
  );
}