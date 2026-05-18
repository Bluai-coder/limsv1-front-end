'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AuditLogViewer from '@/components/AuditLogViewer';
import { 
  Activity, 
  RefreshCw, 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle,
  Database,
  Users,
  FileText,
  BarChart3,
  Zap,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function AuditLogPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Audit Logs
  if (!canRead('Audit Logs')) {
    return <PermissionDenied resource="Audit Logs" action="read" />;
  }
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [search, setSearch] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit: 10,
        ...(filterAction && { action: filterAction }),
        ...(filterEntity && { entityType: filterEntity }),
        ...(search && { search }),
        ...(dateRange.start && { fromDate: dateRange.start }),
        ...(dateRange.end && { toDate: dateRange.end }),
      };
      const response = await api.get('/audit-logs', { params });
      
      // Handle the response structure from your API
      if (response.data && response.data.success) {
        setLogs(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else if (response.data && response.data.data) {
        setLogs(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.get('/audit-logs/summary/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      } else if (response.data && response.data.data) {
        setStats(response.data.data);
      } else {
        // Use the summary from the logs response if stats endpoint is not available
        setStats(response.data?.summary || null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Try to get stats from the main endpoint if stats endpoint fails
      try {
        const logsResponse = await api.get('/audit-logs', { params: { limit: 1 } });
        if (logsResponse.data && logsResponse.data.summary) {
          setStats(logsResponse.data.summary);
        }
      } catch (e) {
        console.error('Could not fetch stats:', e);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const applyFilters = () => {
    fetchLogs(1);
  };

  const clearFilters = () => {
    setFilterAction('');
    setFilterEntity('');
    setDateRange({ start: '', end: '' });
    setSearch('');
    setTimeout(() => fetchLogs(1), 0);
  };

  const handlePageChange = (newPage) => {
    fetchLogs(newPage);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/audit-logs', {
        params: { 
          limit: 1000,
          ...(filterAction && { action: filterAction }),
          ...(filterEntity && { entityType: filterEntity }),
          ...(search && { search }),
          ...(dateRange.start && { fromDate: dateRange.start }),
          ...(dateRange.end && { toDate: dateRange.end }),
        }
      });
      
      const exportData = response.data.data || response.data;
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export logs');
    }
  };

  // Calculate stats from the summary if available
  const getStatsValue = (key) => {
    if (!stats) return null;
    if (typeof stats === 'object') {
      if (key === 'total') return stats.total || stats.totalEvents || 0;
      if (key === 'today') return stats.today || 0;
      if (key === 'uniqueActions') return Object.keys(stats.byAction || {}).length;
      if (key === 'uniqueEntities') return Object.keys(stats.byEntity || {}).length;
      if (key === 'activeUsers') return stats.activeUsers?.length || 0;
    }
    return 0;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          {statsLoading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value || 0}</p>
          )}
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-inner`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Get available actions and entities for filters from the summary
  const availableActions = stats?.byAction ? Object.keys(stats.byAction) : [];
  const availableEntities = stats?.byEntity ? Object.keys(stats.byEntity) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete system activity and change history</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchLogs(pagination.page)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Events"
              value={getStatsValue('total')}
              icon={Database}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              subtitle={`${stats?.today || 0} today`}
            />
            <StatCard 
              title="Active Users"
              value={getStatsValue('activeUsers')}
              icon={Users}
              color="bg-gradient-to-r from-emerald-500 to-teal-600"
              subtitle="unique users"
            />
            <StatCard 
              title="Action Types"
              value={getStatsValue('uniqueActions')}
              icon={Activity}
              color="bg-gradient-to-r from-purple-500 to-pink-600"
              subtitle="different actions"
            />
            <StatCard 
              title="Entities Tracked"
              value={getStatsValue('uniqueEntities')}
              icon={FileText}
              color="bg-gradient-to-r from-orange-500 to-red-600"
              subtitle="monitored resources"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</span>
              {(filterAction || filterEntity || dateRange.start || dateRange.end || search) && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 transition-colors duration-200"
                />
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              
              {/* Entity Filter Dropdown */}
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              >
                <option value="">All Entities</option>
                {availableEntities.map(entity => (
                  <option key={entity} value={entity}>{entity.replace(/_/g, ' ')}</option>
                ))}
              </select>

              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              />

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
              />

              <button
                onClick={applyFilters}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-sm col-span-full sm:col-span-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Viewer */}
        <AuditLogViewer
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={() => fetchLogs(pagination.page)}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Audit logs are retained for 90 days. All actions are immutable and cannot be modified.
          </p>
        </div>
      </div>
    </div>
  );
}