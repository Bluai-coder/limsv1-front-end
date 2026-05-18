
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Package, Pencil, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTestCatalogPackages } from '@/hooks/use-test-catalog';
import { useDeleteTestPackage } from '@/hooks/use-test-packages-catalog';
import TestPackageModal from '@/components/detail-popup/TestPackageModal';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal Component with Theme Support
const DeleteConfirmModal = ({ packageData, onConfirm, onCancel }) => {
  if (!packageData) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Test Package</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete package{' '}
          <span className="font-semibold">{packageData.name}</span>?
          This will permanently remove the package from the catalog.
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
            Delete Package
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
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

// Included Tests Badge Component
const IncludedTestsBadge = ({ test }) => (
  <span className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md">
    {test.display_name || test.name || test.code}
  </span>
);

export default function TestPackagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
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

  // Check if user has read access to Tests & Prices (packages are part of tests)
  if (!canRead('Tests & Prices') && !isAdmin()) {
    return <PermissionDenied resource="Tests & Prices" action="read" />;
  }

  const { data, isLoading, refetch } = useTestCatalogPackages({
    q: search || undefined,
    page,
    limit: 10,
    tenantId: tenant?.id,
  });

  const tests = data?.data || [];
  const pagination = data?.pagination;

  const deleteTestPackage = useDeleteTestPackage();

  const RemovePackage = async (id) => {
    if (!tenant?.id) return toast.error("Tenant not found");

    // Check permission before attempting delete
    if (!canDelete('Tests & Prices') && !isAdmin()) {
      toast.error("You don't have permission to delete test packages");
      return;
    }

    try {
      await deleteTestPackage.mutateAsync({ id, tenantId: tenant.id });
      toast.success("Test package deleted successfully");
      setDeleteConfirm(null);
      refetch(); // Refresh the list
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete package");
    }
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          packageData={deleteConfirm}
          onConfirm={() => RemovePackage(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Test Packages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} test packages available
          </p>
        </div>

        {canCreate('Tests & Prices') && (
          <Link
            href="/dashboard/packages/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> New Test Package
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
            placeholder="Search packages by name or code..."
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
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Package Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Included Tests</th>
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
                  <TableSkeleton key={i} columns={6} />
                ))
              ) : tests.length > 0 ? (
                tests.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* CODE - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(pkg)}
                        className="text-left"
                      >
                        <div className="font-semibold text-[#1b4dff] dark:text-[#1b4dff] hover:underline">
                          {pkg.code}
                        </div>
                      </button>
                    </td>

                    {/* PACKAGE NAME - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(pkg)}
                        className="text-left font-medium text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition"
                      >
                        {pkg.name}
                      </button>
                    </td>

                    {/* INCLUDED TESTS */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {pkg.tests?.length > 0 ? (
                          <>
                            {pkg.tests.slice(0, 3).map((t) => (
                              <IncludedTestsBadge key={t.id} test={t} />
                            ))}
                            {pkg.tests.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
                                +{pkg.tests.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">No tests included</span>
                        )}
                      </div>
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      ₹{(pkg.price || 0).toLocaleString()}
                     </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge isActive={pkg.is_active} />
                     </td>

                    {/* ACTIONS - View, Edit, Delete buttons */}
                    {(canUpdate('Tests & Prices') || canDelete('Tests & Prices')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewDetails(pkg)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Package Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Tests & Prices') && (
                            <button
                              onClick={() => router.push(`packages/edit?id=${pkg.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Package"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canDelete('Tests & Prices') && (
                            <button
                              onClick={() => setDeleteConfirm(pkg)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Package"
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
                  <td colSpan={6} className="py-20 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No test packages found</p>
                    {canCreate('Tests & Prices') && (
                      <Link href="/dashboard/packages/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Create your first test package →
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
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} packages
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

      {/* Test Package Modal */}
      <TestPackageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPackage(null);
        }}
        packageData={selectedPackage}
      />
    </div>
  );
}