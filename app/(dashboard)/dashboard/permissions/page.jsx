// ============================================================
// app/(dashboard)/dashboard/Permissions/page.tsx — Patient listing
// ============================================================


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Shield, Pencil, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDeleteRole, useRoles } from '@/hooks/use-roles';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal with Theme Support
const DeleteConfirmModal = ({ role, onConfirm, onCancel }) => {
  if (!role) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Role</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete role{' '}
          <span className="font-semibold">{role.displayName || role.name}</span>?
          This will permanently remove the role from the system.
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
            Delete Role
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 4 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </td>
    ))}
  </tr>
);

// Role Type Badge Component with Theme Support
const RoleTypeBadge = ({ isSystem }) => (
  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
    isSystem
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
  }`}>
    {isSystem ? "System Role" : "Custom Role"}
  </span>
);

export default function PermissionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();
  const { tenant } = useAuthStore();

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Roles
  if (!canRead('Permissions') && !isAdmin()) {
    return <PermissionDenied resource="Permissions" action="read" />;
  }

  const deleteRole = useDeleteRole();

  const RemoveRole = async (id) => {
    if (!tenant?.id) {
      toast.error("Tenant not found");
      return;
    }

    // Check permission before attempting delete
    if (!canDelete('Permissions') && !isAdmin()) {
      toast.error("You don't have permission to delete roles");
      return;
    }

    try {
      await deleteRole.mutateAsync({
        id,
        tenantId: tenant.id,
      });
      toast.success("Permissions deleted successfully");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete Permissions");
    }
  };

  const { data, isLoading, refetch } = useRoles({
    q: search || undefined,
    page,
    limit: 20,
    tenantId: tenant?.id,
  });

  const roles = data?.data || [];
  const pagination = data?.pagination;

  const handleViewDetails = (Permissions) => {
    // router.push(`/dashboard/roles/${role.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          role={deleteConfirm}
          onConfirm={() => RemoveRole(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} Permissions available
          </p>
        </div>

        {/* {canCreate('Roles') && (
          <Link
            href="/dashboard/roles/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> New Role
          </Link>
        )} */}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { 
              setSearch(e.target.value); 
              setPage(1); 
            }}
            placeholder="Search roles by name or description..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Role Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Description</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Type</th>
                {(canUpdate('Permissions') || canDelete('Permissions')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={4} />
                ))
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Role Name - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-left cursor-pointer"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition">
                          {role.displayName || role.name}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {role.name}
                        </div>
                      </button>
                    </td>

                    {/* Description - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-left cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition w-full"
                      >
                        {role.description || '—'}
                      </button>
                    </td>

                    {/* Type Badge - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-left cursor-pointer"
                      >
                        <RoleTypeBadge isSystem={role.isSystem} />
                      </button>
                    </td>

                    {/* Actions - View, Edit, Delete buttons */}
                    {(canUpdate('Permissions') || canDelete('Roles')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewDetails(role)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Role Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button - Disabled for system roles unless admin */}
                          {canUpdate('Roles') && (
                            <button
                              onClick={() => router.push(`/dashboard/roles/edit?id=${role.id}`)}
                              className={`p-2 rounded-lg transition-colors ${
                                role.isSystem && !isAdmin()
                                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                  : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              }`}
                              title={role.isSystem && !isAdmin() ? "System roles cannot be edited" : "Edit Role"}
                              disabled={role.isSystem && !isAdmin()}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button - Hidden for system roles unless admin */}
                          {canDelete('Roles') && !role.isSystem && (
                            <button
                              onClick={() => setDeleteConfirm(role)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Role"
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
                  <td colSpan={4} className="py-20 text-center">
                    <Shield className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No Permissions found</p>
                    {search && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Try adjusting your search terms
                      </p>
                    )}
                    {canCreate('Roles') && !search && (
                      <Link href="#" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Create your first Permission →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min((page - 1) * 20 + 1, pagination.total)}–{Math.min(page * 20, pagination.total)} of {pagination.total} roles
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
