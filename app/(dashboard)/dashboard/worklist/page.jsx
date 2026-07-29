
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorklist, useWorklistStats, useBatchVerify, useCriticalNotifications, usePathReview } from '@/hooks/use-results';
import { useGenerateReport } from '@/hooks/use-reports';
import { calculateAge } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ShieldCheck, AlertTriangle, Clock, ClipboardCheck,
  Filter, ChevronLeft, ChevronRight, Zap,
  CheckCircle, Phone, AlertCircle, Loader2, Search,
  FileText, FileSignature
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

const DEPARTMENTS = ['All', 'Hematology', 'Biochemistry', 'Immunology', 'Clinical Pathology', 'Microbiology'];
const PRIORITY_OPTIONS = ['All', 'stat', 'urgent', 'routine'];
const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  // { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resulted', label: 'Results Ready' },
  { value: 'tech_verified', label: 'Tech Verified' },
  { value: 'path_verified', label: 'Path Verified' },
  { value: 'auto_verified', label: 'Auto Verified' },
  { value: 'reported', label: 'Reported' },
];

export default function WorklistPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Orders
  if (!canRead('Worklist')) {
    return <PermissionDenied resource="Worklist" action="read" />;
  }

  const router = useRouter();
  const { user } = useAuthStore();
  const [department, setDepartment] = useState('All');
  const [priority, setPriority] = useState('All');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal States
  const [showPathModal, setShowPathModal] = useState(false);
  const [selectedOrderTestId, setSelectedOrderTestId] = useState(null);
  const [password, setPassword] = useState('');
  const [isPathReviewing, setIsPathReviewing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOrderId, setReportOrderId] = useState(null);

  // Hooks
  const generateReport = useGenerateReport();
  const pathReview = usePathReview();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: stats, refetch: refetchStats } = useWorklistStats();
  const { data: criticalNotifications, refetch: refetchCritical } = useCriticalNotifications('pending');
  const { data: worklistData, isLoading, refetch: refetchWorklist } = useWorklist({
    department: department === 'All' ? undefined : department,
    priority: priority === 'All' ? undefined : priority,
    status: statusFilter || undefined,
    q: debouncedSearch || undefined,
    page,
    limit
  });
  const batchVerify = useBatchVerify();

  const items = worklistData?.data || [];
  const pagination = worklistData?.pagination;
  const worklistStats = worklistData?.stats;
  const criticalCount = criticalNotifications?.data?.length || 0;
  const criticalFromWorklist = items.filter((item) => item.alerts?.has_critical).length;
  const displayStats = worklistStats || stats?.data;

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refetchWorklist();
      refetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetchWorklist, refetchStats]);

  const statCards = [
    { label: 'Pending', value: displayStats?.pending ?? 0, icon: Clock, color: 'from-amber-500 to-yellow-600' },
    { label: 'In Progress', value: displayStats?.in_progress ?? 0, icon: ShieldCheck, color: 'from-blue-500 to-blue-600' },
    { label: 'Results Ready', value: displayStats?.resulted ?? 0, icon: ClipboardCheck, color: 'from-green-500 to-green-600' },
    { label: 'Critical Values', value: criticalCount > 0 ? criticalCount : criticalFromWorklist, icon: AlertTriangle, color: 'from-red-500 to-red-600', alert: criticalCount > 0 || criticalFromWorklist > 0 },
    { label: 'Auto-Verify Rate', value: `${displayStats?.auto_verified_rate ?? 0}%`, icon: Zap, color: 'from-purple-500 to-purple-600' },
  ];

  const handleBatchVerify = async () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    try {
      const result = await batchVerify.mutateAsync(selectedItems);
      toast.success(`${result.verified_count} test(s) verified successfully`);
      setSelectedItems([]);
      refetchWorklist();
      refetchStats();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Batch verification failed');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) setSelectedItems([]);
    else setSelectedItems(items.map((item) => item.id));
  };

  // ✅ Pathologist Review Handler
  const handlePathReview = (orderTestId) => {
    setSelectedOrderTestId(orderTestId);
    setShowPathModal(true);
    setPassword('');
  };

  const confirmPathReview = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    if (!selectedOrderTestId) return;

    setIsPathReviewing(true);
    try {
      await pathReview.mutateAsync({
        orderTestId: selectedOrderTestId,
        password: password,
        notes: `Reviewed by ${user?.fullName || 'Pathologist'}`,
        userId: user?.id
      });
      
      toast.success('Pathologist review completed successfully');
      setShowPathModal(false);
      setPassword('');
      setSelectedOrderTestId(null);
      refetchWorklist();
      refetchStats();
      refetchCritical();
    } catch (error) {
      console.error('Path review error:', error);
      toast.error(error?.response?.data?.message || 'Pathologist review failed');
    } finally {
      setIsPathReviewing(false);
    }
  };

  // ✅ Report Generation Handler
  const handleGenerateReport = (orderId) => {
    setReportOrderId(orderId);
    setShowReportModal(true);
  };

  const confirmGenerateReport = async () => {
    if (!reportOrderId) return;

    try {
      await generateReport.mutateAsync(reportOrderId);
      setShowReportModal(false);
      setReportOrderId(null);
      refetchWorklist();
      refetchStats();
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error?.response?.data?.message || 'Failed to generate report');
    }
  };

  const getStatusBadge = (status, alerts) => {
    if (alerts?.has_critical) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse"><AlertTriangle className="w-3 h-3" /> CRITICAL</span>;
    }
    if (alerts?.has_delta_failure) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"><AlertCircle className="w-3 h-3" /> Delta Fail</span>;
    }
    switch (status) {
      case 'pending': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Pending</span>;
      case 'in_progress': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">In Progress</span>;
      case 'resulted': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Results Ready</span>;
      case 'tech_verified': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300">Tech Verified</span>;
      case 'path_verified': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">Path Verified</span>;
      case 'auto_verified': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"><Zap className="w-3 h-3" /> Auto</span>;
      case 'reported': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Reported</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{status || 'Pending'}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'stat': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse">STAT</span>;
      case 'urgent': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">Urgent</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">Routine</span>;
    }
  };

  const getProgressColor = (hasCritical, hasDeltaFail) => {
    if (hasCritical) return 'bg-red-500';
    if (hasDeltaFail) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const getActionButton = (item) => {
    const status = item.status;
    const progress = item.progress || { entered: 0, total: 0 };
    const alerts = item.alerts || {};

    if (alerts.has_critical && status !== 'reported') {
      return (
        <button
          onClick={() => handlePathReview(item.id)}
          disabled={pathReview.isPending}
          className="text-xs bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
        >
          {pathReview.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
          Path Review
        </button>
      );
    }

    if (status === 'tech_verified' || status === 'path_verified') {
      return (
        <button
          onClick={() => handleGenerateReport(item.order?.id)}
          disabled={generateReport.isPending}
          className="text-xs bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
        >
          {generateReport.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
          Generate Report
        </button>
      );
    }

    if (status === 'resulted') {
      return (
        <Link href={`/dashboard/results/${item.id}`} className="text-xs bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded-lg transition">
          Verify
        </Link>
      );
    }

    return (
      <Link href={`/dashboard/results/${item.id}`} className="text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition">
        {progress.entered === 0 ? 'Enter Results' : 'Continue'}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Worklist</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Results awaiting verification, review, and confirmation</p>
          </div>
          {selectedItems.length > 0 && (
            <button 
              onClick={handleBatchVerify} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              <CheckCircle className="w-4 h-4" /> Verify Selected ({selectedItems.length})
            </button>
          )}
        </div>

        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {criticalCount} critical value(s) require read-back confirmation
                </p>
              </div>
              <Link href="/dashboard/critical-values" className="text-sm text-red-700 dark:text-red-400 font-medium hover:underline sm:ml-auto">
                View All →
              </Link>
            </div>
          </div>
        )}

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
          {statCards.map((card, i) => (
            <div key={i} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow transition-all duration-200 ${card.alert ? 'ring-2 ring-red-300 dark:ring-red-800' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                  <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-inner`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 mb-6 overflow-x-auto">
          <div className="flex flex-wrap gap-4 items-center min-w-max">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Dept:</span>
              <div className="flex gap-1">
                {DEPARTMENTS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDepartment(d); setPage(1); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      department === d 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Priority:</span>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => { setPriority(p); setPage(1); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      priority === p 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p === 'All' ? 'All' : p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      statusFilter === opt.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {(department !== 'All' || priority !== 'All' || statusFilter || searchQuery) && (
              <button
                onClick={() => {
                  setDepartment('All');
                  setPriority('All');
                  setStatusFilter('');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Worklist Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length && items.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </th>
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
                  items.map((item) => {
                    const progress = item.progress || { entered: 0, total: 0 };
                    const percent = progress.total > 0 ? (progress.entered / progress.total) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedItems([...selectedItems, item.id]);
                              else setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            disabled={item.alerts?.has_critical}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/results/${item.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            {item.order?.orderNumber}
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.test?.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.order?.patient?.firstName} {item.order?.patient?.lastName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.order?.patient?.mrn}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{calculateAge(item.order?.patient?.dateOfBirth)} yrs</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.test?.department || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{progress.entered}/{progress.total}</div>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getProgressColor(item.alerts?.has_critical, item.alerts?.has_delta_failure)}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">{getPriorityBadge(item.order?.priority)}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.status, item.alerts)}</td>
                        <td className="px-4 py-3">{getActionButton(item)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <ClipboardCheck className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Worklist is empty</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All caught up!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} items
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

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

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Critical Value</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /><span>Delta Check Failed</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Reflex Test</span></div>
          <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-blue-500" /><span>Auto-Verified</span></div>
        </div>
      </div>

      {/* Pathologist Review Modal */}
      {showPathModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSignature className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pathologist Review</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Electronic signature required for critical values</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">21 CFR Part 11 compliant</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter your password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && confirmPathReview()}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPathModal(false);
                    setPassword('');
                    setSelectedOrderTestId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPathReview}
                  disabled={isPathReviewing || !password}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isPathReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                  Sign & Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate Report</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download PDF report for this order</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Includes all verified results</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportOrderId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmGenerateReport}
                disabled={generateReport.isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {generateReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}