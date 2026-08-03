'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle, AlertCircle, Loader2, Search,
  FlaskConical, TrendingUp, Unlock, Lock, Microscope, Plus, X,
  Download, RefreshCw, Bell, Settings, BarChart3, LineChart, FileText, Package,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useQcStats,
  useQcLots,
  useQcResults,
  useEnterQcResult,
  useUnlockQcResult,
  useRegisterQcLot,
  useLevyJenningsData,
} from '@/hooks/use-qc';
// import LeveyJenningsTab from '@/components/LeveyJenningsTab';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import QueryError from '@/components/common/QueryError';
import { PermissionDenied } from '@/components/PermissionGuard';

// ==================== Helper Functions ====================
const getWestgardBadge = (status, zScore) => {
  if (status === 'pass') {
    if (Math.abs(zScore) >= 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
          <AlertCircle className="w-3 h-3" /> 2s Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
        <CheckCircle className="w-3 h-3" /> In Control
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
      <AlertTriangle className="w-3 h-3" /> Out of Control
    </span>
  );
};

const getZScoreColor = (zScore) => {
  const abs = Math.abs(zScore);
  if (abs >= 3) return 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20';
  if (abs >= 2) return 'text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-50 dark:bg-yellow-900/20';
  return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
};

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ==================== Tab Components ====================

// Tab 1: QC Dashboard
function QcDashboardTab(props) {
  const {
    stats,
    activeLots,
    results,
    pagination,
    isLoading,
    selectedLotId,
    setSelectedLotId,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    setShowEnterModal,
    setShowLotModal,
    handleUnlockEvent,isError 
  } = props;

  const statCards = [
    { label: 'Total Tests', value: stats?.total_tests ?? 0, icon: FlaskConical, color: 'from-blue-500 to-blue-600' },
    { label: 'Passed', value: stats?.passed ?? 0, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Failed / Warning', value: stats?.failed ?? 0, icon: AlertTriangle, color: 'from-orange-500 to-orange-600' },
    { label: 'Pass Rate', value: `${stats?.pass_rate ?? 100}%`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Instruments Locked', value: stats?.locked ?? 0, icon: Lock, color: 'from-red-500 to-red-600', alert: (stats?.locked ?? 0) > 0 },
  ];

  // Filter results by search
  const filteredResults = results.filter((result) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      result.qc_lot?.lot_number?.toLowerCase().includes(searchLower) ||
      result.test_code?.toLowerCase().includes(searchLower) ||
      result.analyte_code?.toLowerCase().includes(searchLower) ||
      result.instrument_id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm ${card.alert ? 'ring-2 ring-red-300 dark:ring-red-800' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-inner`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      {isError && <QueryError error={error} onRetry={refetch} className="mb-4" />}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lot, test, instrument..."
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
              />
            </div>
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value="">All Lots</option>
              {activeLots?.map((lot) => (
                <option key={lot.id} value={lot.id}>{lot.lot_number} - {lot.material_name}</option>
              ))}
            </select>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {['all', 'pass', 'fail'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    statusFilter === s 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All Results' : s === 'pass' ? 'Passed Only' : 'Failed Only'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setShowLotModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" /> New Lot
            </button>
            <button
              onClick={() => setShowEnterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <FlaskConical className="w-4 h-4" /> Enter QC Result
            </button>
          </div>
        </div>
      </div>

      {/* Active Lots */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Microscope className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Control Materials</h3>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{activeLots?.length || 0} active lots</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeLots?.map((lot) => (
            <button
              key={lot.id}
              onClick={() => setSelectedLotId(selectedLotId === lot.id ? '' : lot.id)}
              className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedLotId === lot.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedLotId === lot.id ? 'bg-white' : 'bg-green-500'}`} />
              {lot.lot_number}
              <span className={`text-xs ${selectedLotId === lot.id ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                {lot.material_name}
              </span>
            </button>
          ))}
          {selectedLotId && (
            <button
              onClick={() => setSelectedLotId('')}
              className="px-3 py-2 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date/Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lot / Material</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test (Code)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instrument</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Z-Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{formatDateTime(result.performed_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{result.qc_lot?.lot_number}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{result.qc_lot?.material_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">{result.test_code}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{result.analyte_code}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{result.instrument_id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        result.level === 'Level1' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}>
                        {result.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 dark:text-white">{result.measured_value}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{result.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium ${getZScoreColor(result.z_score)}`}>
                        {result.z_score > 0 ? '+' : ''}
                        {/* {result.z_score?.toFixed(2)} */}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getWestgardBadge(result.westgard_status, result.z_score)}</td>
                    <td className="px-4 py-3">
                      {result.instrument_locked === true ? (
                        <button
                          onClick={() => handleUnlockEvent(result.id, result.instrument_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-800"
                        >
                          <Unlock className="w-3 h-3" /> Unlock
                        </button>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <FlaskConical className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No QC results found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Enter a QC result to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Tab 2: Levey-Jennings Chart
function LeveyJenningsTab() {
  const [selectedAnalyte, setSelectedAnalyte] = useState('GLU');
  const [selectedLot, setSelectedLot] = useState('');
  const { data: levyData, isLoading } = useLevyJenningsData(selectedAnalyte, selectedLot || undefined, 90);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LineChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Levey-Jennings Control Chart</h2>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedAnalyte}
            onChange={(e) => setSelectedAnalyte(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="GLU">Glucose (GLU)</option>
            <option value="CHOL">Cholesterol (CHOL)</option>
            <option value="HGB">Hemoglobin (HGB)</option>
          </select>
          <select
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Lots</option>
          </select>
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 p-8 min-h-[400px] flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        ) : (
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Levey-Jennings Chart Visualization</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">±1σ, ±2σ, ±3σ limits with run rules</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600 dark:text-gray-400">Mean ±1σ</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-gray-600 dark:text-gray-400">±2σ Warning</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-600 dark:text-gray-400">±3σ Action</span></div>
            </div>
          </div>
        )}
      </div>
      {levyData && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Level 1 Statistics</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Mean: {levyData.levels?.Level1?.data?.[0]?.mean || '-'}</span>
              <span className="text-gray-600 dark:text-gray-400">SD: {levyData.levels?.Level1?.data?.[0]?.sd || '-'}</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Level 2 Statistics</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Mean: {levyData.levels?.Level2?.data?.[0]?.mean || '-'}</span>
              <span className="text-gray-600 dark:text-gray-400">SD: {levyData.levels?.Level2?.data?.[0]?.sd || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab 3: Westgard Reports
function WestgardReportsTab() {
  const [reportType, setReportType] = useState('monthly');

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Westgard Reports</h2>
        </div>
        <div className="flex gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="quarterly">Quarterly Report</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
          <p className="text-xs text-green-600 dark:text-green-400">Pass Rate</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">95.3%</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400">Failed Runs</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">12</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Warnings</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">8</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
          <p className="text-xs text-purple-600 dark:text-purple-400">Most Violated Rule</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300">1₃s</p>
        </div>
      </div>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Test/Analyte</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">1₃s</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">2₂s</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">R₄s</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">4₁s</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">10ₓ</th>
              <th className="text-left px-4 py-2 text-gray-600 dark:text-gray-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">GLU - Glucose</td>
              <td className="px-4 py-2 text-red-600 dark:text-red-400">3</td>
              <td className="px-4 py-2 text-orange-600 dark:text-orange-400">2</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">0</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">0</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">1</td>
              <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">6</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">HGB - Hemoglobin</td>
              <td className="px-4 py-2 text-red-600 dark:text-red-400">5</td>
              <td className="px-4 py-2 text-orange-600 dark:text-orange-400">3</td>
              <td className="px-4 py-2 text-purple-600 dark:text-purple-400">1</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">0</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">0</td>
              <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">9</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Tab 4: Lot Management
function LotManagementTab(props) {
  const { lots, setShowLotModal } = props;
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lot Management</h2>
        </div>
        <button
          onClick={() => setShowLotModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add New Lot
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Lot Number</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Material Name</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Manufacturer</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Expiry Date</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Levels</th>
              <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {lots?.data?.map((lot) => (
              <tr key={lot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lot.lot_number}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lot.material_name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lot.manufacturer || '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(lot.expiry_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lot.levels}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    lot.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {lot.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== Main Component ====================
export default function QcDashboardPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to QC Management
  if (!canRead('QC Management')) {
    return <PermissionDenied resource="QC Management" action="read" />;
  }
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showEnterModal, setShowEnterModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // API Hooks
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQcStats(30);
  const { data: lotsData, isLoading: lotsLoading, refetch: refetchLots } = useQcLots('active');
  const { data: resultsData, isLoading: resultsLoading, refetch: refetchResults } = useQcResults({
    qc_lot_id: selectedLotId || undefined,
    westgard_status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: 15
  });

  const enterQcResult = useEnterQcResult();
  const unlockQc = useUnlockQcResult();
  const registerLot = useRegisterQcLot();

  // Extract data
  const stats = statsData?.stats;
  const activeLots = statsData?.active_lots;
  const lots = lotsData;
  const results = resultsData?.data || [];
  const pagination = resultsData?.pagination;

  const handleRefresh = () => {
    refetchResults();
    refetchStats();
    refetchLots();
    toast.success('Data refreshed');
  };

  const handleUnlockEvent = (id, instrument) => {
    setSelectedResultId(id);
    setSelectedInstrument(instrument);
    setShowUnlockModal(true);
  };

  const handleEnterResult = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
      await enterQcResult.mutateAsync({
        instrument_id: formData.get('instrument_id'),
        qc_lot_id: formData.get('lot_id'),
        test_code: formData.get('test_code'),
        analyte_code: formData.get('analyte_code'),
        level: formData.get('level'),
        measured_value: parseFloat(formData.get('measured_value')),
        unit: formData.get('unit'),
        target_mean: parseFloat(formData.get('target_mean')),
        target_sd: parseFloat(formData.get('target_sd')),
      });
      setShowEnterModal(false);
      refetchResults();
      refetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlock = async () => {
    if (!selectedResultId) return;
    try {
      await unlockQc.mutateAsync({ id: selectedResultId, corrective_action: correctiveAction });
      setShowUnlockModal(false);
      setSelectedResultId(null);
      setCorrectiveAction('');
      refetchResults();
      refetchStats();
      refetchLots();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterLot = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    try {
      await registerLot.mutateAsync({
        lot_number: formData.get('lot_number'),
        material_name: formData.get('material_name'),
        manufacturer: formData.get('manufacturer'),
        expiry_date: formData.get('expiry_date'),
        levels: parseInt(formData.get('levels')) || 2,
      });
      setShowLotModal(false);
      refetchLots();
      refetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { name: 'QC Dashboard', component: QcDashboardTab },
    { name: 'Levey-Jennings', component: LeveyJenningsTab },
    { name: 'Westgard Reports', component: WestgardReportsTab },
    { name: 'Lot Management', component: LotManagementTab },
  ];

  const CurrentComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Quality Control</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Westgard Rules | Multi-Rule QC</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-6">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === i
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 0 && (
          <QcDashboardTab
            stats={stats}
            activeLots={activeLots}
            results={results}
            pagination={pagination}
            isLoading={statsLoading || resultsLoading}
            selectedLotId={selectedLotId}
            setSelectedLotId={setSelectedLotId}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            page={page}
            setPage={setPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleRefresh={handleRefresh}
            setShowEnterModal={setShowEnterModal}
            setShowLotModal={setShowLotModal}
            handleUnlockEvent={handleUnlockEvent}
            isError={enterQcResult.isError || unlockQc.isError || registerLot.isError}
          />
        )}
        {activeTab === 1 && <LeveyJenningsTab />}
        {activeTab === 2 && <WestgardReportsTab />}
        {activeTab === 3 && <LotManagementTab lots={lots} setShowLotModal={setShowLotModal} />}
      </div>

      {/* Enter QC Result Modal */}
      {showEnterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record QC Result</h2>
              <button onClick={() => setShowEnterModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleEnterResult} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Control Lot *</label>
                  <select name="lot_id" required className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option value="">Select lot</option>
                    {activeLots?.map((lot) => (
                      <option key={lot.id} value={lot.id}>{lot.lot_number} - {lot.material_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instrument ID *</label>
                  <input name="instrument_id" required className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Code *</label>
                  <input name="test_code" required className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analyte Code *</label>
                  <input name="analyte_code" required className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select name="level" className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option>Level1</option>
                    <option>Level2</option>
                    <option>Level3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input name="unit" defaultValue="mg/dL" className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Measured Value *</label>
                  <input name="measured_value" type="number" step="any" required className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Mean</label>
                  <input name="target_mean" type="number" step="any" className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target SD</label>
                  <input name="target_sd" type="number" step="any" className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEnterModal(false)} className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Unlock Instrument</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Instrument: {selectedInstrument}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Failed QC requires corrective action before unlocking</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corrective Action *</label>
                <textarea
                  rows={3}
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  placeholder="e.g., Recalibrated instrument, replaced reagents..."
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUnlockModal(false)} className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button onClick={handleUnlock} disabled={!correctiveAction} className="flex-1 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition disabled:opacity-50">Unlock</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Lot Modal */}
      {showLotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Register QC Lot</h2>
            </div>
            <form onSubmit={handleRegisterLot} className="p-5 space-y-4">
              <input
                name="lot_number"
                placeholder="Lot Number *"
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <input
                name="material_name"
                placeholder="Material Name *"
                required
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <input
                name="manufacturer"
                placeholder="Manufacturer"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <input
                name="expiry_date"
                type="date"
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <input
                name="levels"
                type="number"
                placeholder="Number of Levels (2)"
                defaultValue={2}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLotModal(false)} className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}