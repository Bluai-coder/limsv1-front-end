
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, ClipboardList, Pencil, Trash2, Eye, X } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDeleteTestCatalog, useTestCatalog } from '@/hooks/use-test-catalog';
import PackagesPage from '../packages/page';
import TestDetailsModal from '@/components/detail-popup/TestDetailsModal';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal Component with Theme Support
const DeleteConfirmModal = ({ test, onConfirm, onCancel }) => {
  if (!test) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Test</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete test{' '}
          <span className="font-semibold">{test?.name}</span>?
          This will permanently remove the test from the catalog.
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
            Delete Test
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 7 }) => (
  <tr className="animate-pulse">
    {Array?.from({ length: columns })?.map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </td>
    ))}
   </tr>
);

// Status Badge Component with Theme Support
const StatusBadge = ({ isActive }) => (
  <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
    isActive
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  }`}>
    {isActive ? "Active" : "Inactive"}
  </span>
);

export default function TestPricePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { tenant } = useAuthStore();

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Tests & Prices
  if (!canRead('Tests & Prices') && !isAdmin()) {
    return <PermissionDenied resource="Tests & Prices" action="read" />;
  }

  const { data, isLoading, refetch } = useTestCatalog({
    q: search || undefined,
    page,
    limit: 10,
    tenantId: tenant?.id,
  });

  const tests = data?.data?.data || [];
  console.log("teststests",tests)
  const pagination = data?.data?.pagination;

  const deleteTest = useDeleteTestCatalog();

  const RemoveTest = async (id) => {
    if (!tenant?.id) return toast.error("Tenant not found");

    // Check permission before attempting delete
    if (!canDelete('Tests & Prices') && !isAdmin()) {
      toast.error("You don't have permission to delete tests");
      return;
    }

    try {
      await deleteTest.mutateAsync({ id, tenantId: tenant.id });
      toast.success("Test deleted successfully");
      setDeleteConfirm(null);
      refetch(); // Refresh the list
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete test");
    }
  };

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          test={deleteConfirm}
          onConfirm={() => RemoveTest(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Test & Prices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} tests available
          </p>
        </div>

        {canCreate('Tests & Prices') && (
          <Link
            href="/dashboard/test-price/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> New Test
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
            placeholder="Search tests by name or code..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Code</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Test Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Department</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Specimen</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                {(canUpdate('Tests & Prices') || canDelete('Tests & Prices')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={7} />
                ))
              ) : tests.length > 0 ? (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* CODE - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(test)}
                        className="text-left"
                      >
                        <div className="font-semibold text-[#1b4dff] dark:text-[#1b4dff] hover:underline">
                          {test.code}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {test.display_name}
                        </div>
                      </button>
                    </td>

                    {/* NAME - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(test)}
                        className="text-left font-medium text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition"
                      >
                        {test.name}
                      </button>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {test.department || '—'}
                     </td>

                    {/* SPECIMEN */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {test.specimen_type || '—'}
                      {test.container_type && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                          ({test.container_type})
                        </span>
                      )}
                     </td>

                    {/* PRICE */}
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      ₹{test.price?.toLocaleString() || '0'}
                     </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge isActive={test.is_active} />
                     </td>

                    {/* ACTIONS - View, Edit, Delete buttons */}
                    {(canUpdate('Tests & Prices') || canDelete('Tests & Prices')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewDetails(test)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Test Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Tests & Prices') && (
                            <button
                              onClick={() => router.push(`test-price/edit?id=${test.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Test"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canDelete('Tests & Prices') && (
                            <button
                              onClick={() => setDeleteConfirm(test)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Test"
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
                  <td colSpan={7} className="py-20 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No tests found</p>
                    {canCreate('Tests & Prices') && (
                      <Link href="/dashboard/test-price/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Add your first test →
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
              Showing {Math.min((page - 1) * 5 + 1, pagination.total)}–{Math.min(page * 5, pagination.total)} of {pagination.total} tests
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

      {/* Packages Section */}
      <PackagesPage />

      {/* Test Details Modal */}
      <TestDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTest(null);
        }}
        test={selectedTest}
      />
    </div>
  );
}
