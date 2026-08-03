
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Users, Eye, Pencil, Trash2, Shield, X } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useRoles, useDeleteRole } from '@/hooks/use-roles';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import SearchInput from '@/components/common/SearchInput';
import TableSkeleton from '@/components/common/TableSkeleton';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import Pagination from '@/components/common/Pagination';

// View Details Modal Component with Theme Support
const ViewRoleModal = ({ role, onClose }) => {
  if (!role) return null;

  const permissions = Array.isArray(role.permissions) ? role.permissions : [];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{role.displayName || role.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{role.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {role.description && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">{role.description}</p>
          </div>
        )}

        <div className="mb-4">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            role.isSystem 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}>
            {role.isSystem ? "System Role" : "Custom Role"}
          </span>
        </div>

        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Permissions</h4>
        {permissions.length === 0 ? (
          <p className="text-sm text-gray-500">No permissions assigned.</p>
        ) : (
          <div className="space-y-3">
            {permissions.map((permGroup, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{permGroup.module}</h5>
                <div className="flex flex-wrap gap-2">
                  {permGroup.actions?.map((action) => (
                    <span
                      key={action}
                      className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 capitalize"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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

export default function RolesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewRole, setViewRole] = useState(null);
  const limit = 10;

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
  if (!canRead('Roles') && !isAdmin()) {
    return <PermissionDenied resource="Roles" action="read" />;
  }

  const { data, isLoading, refetch } = useRoles({
    q: search || undefined,
    page,
    limit,
    tenantId: tenant?.id,
  });

  const roles = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const deleteRole = useDeleteRole();

  const RemoveRole = async (id) => {
    if (!tenant?.id) return toast.error("Tenant not found");

    if (!canDelete('Roles') && !isAdmin()) {
      toast.error("You don't have permission to delete roles");
      return;
    }

    try {
      await deleteRole.mutateAsync({ id, tenantId: tenant.id });
      toast.success("Role deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    }
  };

  const handleViewDetails = (role) => {
    setViewRole(role);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => RemoveRole(deleteConfirm?.id)}
        title="Delete Role"
        message={
          <>
            Are you sure you want to delete role{' '}
            <span className="font-semibold">{deleteConfirm?.displayName || deleteConfirm?.name}</span>?
            This will permanently remove the role from the system.
          </>
        }
      />

      {/* View Role Modal */}
      {viewRole && (
        <ViewRoleModal
          role={viewRole}
          onClose={() => setViewRole(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Roles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} roles available
          </p>
        </div>

        {canCreate('Roles') && (
          <Link
            href="/dashboard/roles/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> New Role
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search roles by name or description..."
        />
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Role Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Description</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Type</th>
                {(canUpdate('Roles') || canDelete('Roles')) && (
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
                    {/* NAME - Clickable */}
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

                    {/* DESCRIPTION - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-left cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition w-full"
                      >
                        {role.description || '—'}
                      </button>
                    </td>

                    {/* TYPE BADGE - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-left cursor-pointer"
                      >
                        {role.isSystem ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            System
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Custom
                          </span>
                        )}
                      </button>
                    </td>

                    {/* ACTIONS - View, Edit, Delete buttons */}
                    {(canUpdate('Roles') || canDelete('Roles')) && (
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
                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No roles found</p>
                    {search && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Try adjusting your search terms
                      </p>
                    )}
                    {canCreate('Roles') && !search && (
                      <Link href="/dashboard/roles/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Create your first role →
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
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            pageSize={limit}
          />
        )}
      </div>
    </div>
  );
}
