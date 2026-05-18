// components/AuditLogViewer.jsx (Enhanced Version - with Dark/Light Theme)

'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  FileText,
  Trash2,
  Edit,
  PlusCircle,
  LogIn,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  User,
  Server,
  Info,
  Activity,
  User2
} from 'lucide-react';

const getActionIcon = (action) => {
  const actionMap = {
    CREATE: { icon: PlusCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    UPDATE: { icon: Edit, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    DELETE: { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    LOGIN: { icon: LogIn, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    RESULT_SAVED: { icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    RESULT_VERIFIED: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    QC_RESULT_ENTERED: { icon: Activity, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    QC_UNLOCKED: { icon: Shield, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    QC_LOT_REGISTERED: { icon: Database, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30' },
    REPORT_GENERATED: { icon: FileText, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  };
  const config = actionMap[action] || { icon: Activity, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' };
  const Icon = config.icon;
  return { Icon, color: config.color, bg: config.bg };
};

const getEntityIcon = (entityType) => {
  const entityMap = {
    test_results: { icon: FileText, label: 'Test Result' },
    orders: { icon: FileText, label: 'Order' },
    patients: { icon: User, label: 'Patient' },
    users: { icon: User, label: 'User' },
    referring_physicians: { icon: User, label: 'Physician' },
    qc_results: { icon: Activity, label: 'QC Result' },
    qc_lots: { icon: Database, label: 'QC Lot' },
    reports: { icon: FileText, label: 'Report' },
  };
  return entityMap[entityType] || { icon: Database, label: entityType?.replace(/_/g, ' ') || entityType };
};

export default function AuditLogViewer({ logs = [], loading, pagination, onPageChange, onRefresh }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getWarningLevel = (action) => {
    const warningMap = {
      DELETE: { level: 'high', text: 'High Risk', color: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30' },
      QC_RESULT_ENTERED: { level: 'warning', text: 'QC Alert', color: 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30' },
      RESULT_SAVED: { level: 'info', text: 'Normal', color: 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30' },
      CREATE: { level: 'low', text: 'Low Risk', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30' },
      LOGIN: { level: 'info', text: 'Normal', color: 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30' },
      QC_UNLOCKED: { level: 'warning', text: 'QC Unlock', color: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30' },
      UPDATE: { level: 'low', text: 'Update', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30' },
    };
    return warningMap[action] || { level: 'info', text: 'Normal', color: 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800' };
  };

  const getUserDisplay = (log) => {
    if (log.user && log.user.full_name) {
      return log.user.full_name;
    }
    if (log.user && log.user.email) {
      return log.user.email.split('@')[0];
    }
    if (log.userId) {
      return log.userId.slice(0, 8) + '...';
    }
    return 'System';
  };

  // Helper to safely get state values (handles both camelCase and snake_case)
  const getBeforeState = (log) => log.beforeState || log.before_state;
  const getAfterState = (log) => log.afterState || log.after_state;
  const getChangedFields = (log) => log.changedFields || log.changed_fields;
  const getCreatedAt = (log) => log.createdAt || log.created_at;

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading audit logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No audit logs found</h3>
        <p className="text-gray-500 dark:text-gray-400">No activity records match your current filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 p-4">
        {logs.map((log) => {
          const { Icon, color, bg } = getActionIcon(log.action);
          const warning = getWarningLevel(log.action);
          const entityInfo = getEntityIcon(log.entityType || log.entity_type);
          const EntityIcon = entityInfo.icon;
          const isExpanded = expandedRows[log.id];
          const beforeState = getBeforeState(log);
          const afterState = getAfterState(log);
          const changedFields = getChangedFields(log);
          const createdAt = getCreatedAt(log);

          return (
            <div
              key={log.id}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleRow(log.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${bg} ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{formatDate(createdAt)}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <EntityIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{entityInfo.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{log.entityId?.slice(0, 8) || log.entity_id?.slice(0, 8)}...</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${bg} ${color}`}>
                    <Icon className="w-3 h-3" />
                    {log.action?.replace(/_/g, ' ')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${warning.color}`}>
                    {warning.text}
                  </span>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {getTimeAgo(createdAt)} • {getUserDisplay(log)}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {changedFields && changedFields.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Changed Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {changedFields.map((field, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[200px] overflow-y-auto">
                    {JSON.stringify(afterState || beforeState || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Entity ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const { Icon, color, bg } = getActionIcon(log.action);
              const warning = getWarningLevel(log.action);
              const entityInfo = getEntityIcon(log.entityType || log.entity_type);
              const EntityIcon = entityInfo.icon;
              const isExpanded = expandedRows[log.id];
              const beforeState = getBeforeState(log);
              const afterState = getAfterState(log);
              const changedFields = getChangedFields(log);
              const createdAt = getCreatedAt(log);

              return (
                <React.Fragment key={log.id}>
                  <tr
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
                    onClick={() => toggleRow(log.id)}
                  >
                    <td className="px-4 py-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(createdAt)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{getTimeAgo(createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${color}`}>
                        <Icon className="w-3 h-3" />
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <EntityIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        {entityInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {log.entityId?.slice(0, 12) || log.entity_id?.slice(0, 12)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{getUserDisplay(log)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${warning.color}`}>
                        {warning.text}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {beforeState && Object.keys(beforeState).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                Before State
                              </h4>
                              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[300px] overflow-y-auto">
                                {JSON.stringify(beforeState, null, 2)}
                              </pre>
                            </div>
                          )}

                          {afterState && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                After State
                              </h4>
                              {changedFields && changedFields.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Changed Fields:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {changedFields.map((field, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                        {field}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[300px] overflow-y-auto">
                                {JSON.stringify(afterState, null, 2)}
                              </pre>
                            </div>
                          )}

                          {(log.ipAddress || log.ip_address || log.userAgent || log.user_agent || log.apiEndpoint || log.api_endpoint) && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Server className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                Request Info
                              </h4>
                              <div className="space-y-2 text-sm">
                                {(log.apiEndpoint || log.api_endpoint) && (
                                  <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Endpoint</span>
                                    <code className="text-xs text-gray-700 dark:text-gray-300 break-all">{log.apiEndpoint || log.api_endpoint}</code>
                                  </div>
                                )}
                                {(log.httpMethod || log.http_method) && (
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Method</span>
                                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{log.httpMethod || log.http_method}</span>
                                  </div>
                                )}
                                {(log.ipAddress || log.ip_address) && (
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">IP Address</span>
                                    <code className="text-xs text-gray-700 dark:text-gray-300">{log.ipAddress || log.ip_address}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* UserInfo */}
                          {(log.userAgent || log.user_agent) && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <User2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                User Info
                              </h4>
                              <div className="space-y-2 text-sm">
                                {(log.userAgent || log.user_agent) && (
                                  <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">User Agent</span>
                                    <code className="text-xs text-gray-700 dark:text-gray-300 break-all">{log.userAgent || log.user_agent}</code>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}