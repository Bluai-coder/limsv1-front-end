'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Plus, ChevronLeft, ChevronRight, Activity, Pencil, Trash2, Eye, X,
  LayoutDashboard, List, Wrench, Link2, FileText, Settings, ShieldAlert, CheckCircle, Database
} from 'lucide-react';

import { 
  useInstruments, 
  useDeleteInstrument, 
  useCreateInstrument,
  useUpdateInstrument,
  useInstrumentStats,
  useInstrumentMaintenance,
  useInstrumentQualifications,
  useInstrumentInterfaces,
  useInstrumentLogs,
  useAllMaintenance,
  useAllQualifications,
  useAllInterfaces,
  useAllLogs
} from '@/hooks/use-instruments';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QueryError from '@/components/common/QueryError';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

import InstrumentModal from '@/components/instruments/InstrumentModal';
import MaintenanceModal from '@/components/instruments/MaintenanceModal';
import QualificationModal from '@/components/instruments/QualificationModal';
import IntegrationConfigModal from '@/components/instruments/IntegrationConfigModal';

// --- Reusable Components ---

const DeleteConfirmModal = ({ instrument, onConfirm, onCancel }) => {
  if (!instrument) return null;
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Instrument</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete instrument <span className="font-semibold">{instrument.name}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
          >
            Delete Instrument
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    maintenance: { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-700' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600' },
    retired: { label: 'Retired', className: 'bg-red-100 text-red-600' },
  };
  const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;
  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

const ViewInstrumentModal = ({ instrument, onClose }) => {
  if (!instrument) return null;
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{instrument.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{instrument.model || 'No model'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500">Department</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{instrument.department || '—'}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-500">Status</p>
            <StatusBadge status={instrument.status} />
          </div>
          {instrument.description && (
            <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm text-gray-900 dark:text-white">{instrument.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TableSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-[100px]" />
      </td>
    ))}
  </tr>
);



// --- Main Page ---

export default function InstrumentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for modals
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewInstrument, setViewInstrument] = useState(null);
  
  const [instrumentModal, setInstrumentModal] = useState({ open: false, data: null });
  const [maintenanceModal, setMaintenanceModal] = useState({ open: false, id: null });
  const [qualificationModal, setQualificationModal] = useState({ open: false, id: null });
  const [integrationModal, setIntegrationModal] = useState({ open: false, id: null });

  const { canCreate, canRead, canUpdate, canDelete, isAdmin } = usePermissions();

  if (!canRead('Instruments') && !isAdmin()) {
    return <PermissionDenied resource="Instruments" action="read" />;
  }

  // Fetch Instruments Directory
  const { data: instrumentsData, isLoading: isLoadingInstruments, refetch: refetchInstruments } = useInstruments({
    q: search || undefined,
    page,
    limit: 10,
  });
  const instruments = instrumentsData?.data || [];
  const pagination = instrumentsData?.pagination;
  const deleteInstrument = useDeleteInstrument();
  const createInstrument = useCreateInstrument();
  const updateInstrument = useUpdateInstrument();

  // Fetch Stats (mock implementation assuming missing endpoint for now)
  const { data: statsData } = useInstrumentStats();
  
  // Fetch global records for tabs
  const { data: allMaintenance } = useAllMaintenance();
  const { data: allQualifications } = useAllQualifications();
  const { data: allInterfaces } = useAllInterfaces();
  const { data: allLogs } = useAllLogs();

  const maintenanceRecords = allMaintenance?.data || [];
  const qualificationRecords = allQualifications?.data || [];
  const interfaceRecords = allInterfaces?.data || [];
  const logRecords = allLogs?.data || [];

  const handleDelete = async (id) => {
    if (!canDelete('Instruments') && !isAdmin()) return toast.error("Permission denied");
    try {
      await deleteInstrument.mutateAsync(id);
      toast.success("Instrument deleted");
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: List },
    { id: 'maintenance', label: 'Maintenance & QC', icon: Wrench },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'logs', label: 'Activity Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Instrument Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage lab instruments, interfaces, and maintenance</p>
        </div>
        {canCreate('Instruments') && (
          <button
            onClick={() => setInstrumentModal({ open: true, data: null })}
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Instrument
          </button>
        )}
      </div>

      {/* ================= TABS ================= */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'bg-blue-50/50 text-[#1b4dff] border-[#1b4dff] dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1b4dff] dark:text-blue-400' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Database className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Instruments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statsData?.total_instruments || instruments.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active & Ready</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statsData?.active_count || instruments.filter(i=>i.status==='active').length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Wrench className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Maintenance Due</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statsData?.maintenance_due_soon || 0}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Integration Errors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statsData?.recent_errors || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search instruments..."
                className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Model</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Department</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {isLoadingInstruments ? (
                    Array.from({ length: 5 }).map((_, i) => <TableSkeleton key={i} />)
                  ) : instruments.length > 0 ? (
                    instruments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inst.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{inst.model || '—'}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{inst.department || '—'}</td>
                        <td className="px-6 py-4"><StatusBadge status={inst.status} /></td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => setViewInstrument(inst)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            {canUpdate('Instruments') && (
                              <button onClick={() => setInstrumentModal({ open: true, data: inst })} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete('Instruments') && (
                              <button onClick={() => setDeleteConfirm(inst)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">No instruments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination block */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAINTENANCE TAB */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white px-2">Maintenance & Qualifications</h2>
            <div className="flex gap-2">
              <button onClick={() => setMaintenanceModal({ open: true, id: null })} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50">
                Log Maintenance
              </button>
              <button onClick={() => setQualificationModal({ open: true, id: null })} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50">
                Log Qualification (IQ/OQ/PQ)
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Maintenance</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Instrument</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {maintenanceRecords.length > 0 ? maintenanceRecords.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{m.instrument?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.maintenance_type}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(m.scheduled_date || m.performed_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={m.status || 'Active'} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">No maintenance records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">Recent Qualifications</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Instrument</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {qualificationRecords.length > 0 ? qualificationRecords.map(q => (
                      <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{q.instrument?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{q.qualification_type}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(q.date_performed).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={q.status || 'Active'} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">No qualification records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
            <h2 className="font-semibold text-gray-900 dark:text-white px-2">Configured Interfaces</h2>
            <button onClick={() => setIntegrationModal({ open: true, id: null })} className="px-4 py-2 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-xl text-sm font-medium shadow-md transition-all">
              New Integration
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Instrument</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Protocol</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Settings</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {interfaceRecords.length > 0 ? interfaceRecords.map(i => (
                    <tr key={i.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{i.instrument?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">{i.interface_type}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">{JSON.stringify(i.connection_settings, null, 2)}</pre>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={i.status || 'inactive'} /></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">
                        <Link2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p>No active integrations found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Timestamp</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Instrument</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Event</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {logRecords.length > 0 ? logRecords.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{log.instrument?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{log.message}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p>No activity logs recorded yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Render Modals conditionally */}
      {instrumentModal.open && (
        <InstrumentModal
          instrument={instrumentModal.data}
          onClose={() => setInstrumentModal({ open: false, data: null })}
          onSave={async (formData) => {
            if (instrumentModal.data) {
              await updateInstrument.mutateAsync({ id: instrumentModal.data.id, data: formData });
            } else {
              await createInstrument.mutateAsync(formData);
            }
          }}
        />
      )}
      
      {maintenanceModal.open && (
        <MaintenanceModal
          instrumentId={maintenanceModal.id}
          onClose={() => setMaintenanceModal({ open: false, id: null })}
        />
      )}
      
      {qualificationModal.open && (
        <QualificationModal
          instrumentId={qualificationModal.id}
          onClose={() => setQualificationModal({ open: false, id: null })}
        />
      )}

      {integrationModal.open && (
        <IntegrationConfigModal
          instrumentId={integrationModal.id}
          onClose={() => setIntegrationModal({ open: false, id: null })}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          instrument={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {viewInstrument && (
        <ViewInstrumentModal
          instrument={viewInstrument}
          onClose={() => setViewInstrument(null)}
        />
      )}

    </div>
  );
}