
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Activity,
  Pencil,
  Trash2,
  Eye,
  X
} from 'lucide-react';

import { useInstruments, useDeleteInstrument } from '@/hooks/use-instruments';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal Component with Theme Support
const DeleteConfirmModal = ({ instrument, onConfirm, onCancel }) => {
  if (!instrument) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
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
          Are you sure you want to delete instrument{' '}
          <span className="font-semibold">{instrument.name}</span>?
          This will permanently remove the instrument from the system.
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

// Loading Skeleton Component
const TableSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </td>
    ))}
  </tr>
);

// Status badge component with theme support
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    maintenance: { label: 'Maintenance', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' },
    retired: { label: 'Retired', className: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  };
  
  const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;
  
  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// View Details Modal Component
const ViewInstrumentModal = ({ instrument, onClose }) => {
  if (!instrument) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{instrument.department || '—'}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <StatusBadge status={instrument.status} />
            </div>
            {instrument.description && (
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-sm text-gray-900 dark:text-white">{instrument.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AllInstrumentPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewInstrument, setViewInstrument] = useState(null);

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Instruments
  if (!canRead('Instruments') && !isAdmin()) {
    return <PermissionDenied resource="Instruments" action="read" />;
  }

  const { data, isLoading, refetch } = useInstruments({
    q: search || undefined,
    page,
    limit: 10,
  });
                                   
  const instruments = data?.data || [];
  const pagination = data?.pagination;

  const deleteInstrument = useDeleteInstrument();

  const handleDelete = async (id) => {
    // Check permission before attempting delete
    if (!canDelete('Instruments') && !isAdmin()) {
      toast.error("You don't have permission to delete instruments");
      return;
    }

    try {
      await deleteInstrument.mutateAsync(id);
      toast.success("Instrument deleted successfully");
      setDeleteConfirm(null);
      refetch(); // Refresh the list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleViewDetails = (instrument) => {
    setViewInstrument(instrument);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          instrument={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* View Instrument Modal */}
      {viewInstrument && (
        <ViewInstrumentModal
          instrument={viewInstrument}
          onClose={() => setViewInstrument(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Instruments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total || 0} instruments registered
          </p>
        </div>

        {canCreate('Instruments') && (
          <Link
            href="/dashboard/instruments/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Instrument
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search instruments by name, model or department..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Model</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Department</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                {(canUpdate('Instruments') || canDelete('Instruments')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={5} />
                ))
              ) : instruments.length > 0 ? (
                instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* NAME - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(inst)}
                        className="font-medium text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition text-left"
                      >
                        {inst.name}
                      </button>
                    </td>

                    {/* MODEL */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {inst.model || '—'}
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {inst.department || '—'}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge status={inst.status} />
                    </td>

                    {/* ACTIONS - View, Edit, Delete buttons */}
                    {(canUpdate('Instruments') || canDelete('Instruments')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewDetails(inst)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Instrument Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Instruments') && (
                            <button
                              onClick={() => router.push(`/dashboard/instruments/edit?id=${inst.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Instrument"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canDelete('Instruments') && (
                            <button
                              onClick={() => setDeleteConfirm(inst)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Instrument"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No instruments found</p>
                    {canCreate('Instruments') && (
                      <Link href="/dashboard/instruments/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Add your first instrument →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION - Consistent styling with theme support */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} instruments
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}