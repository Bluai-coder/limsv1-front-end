
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Users, Shield, Pencil, Trash2, Eye } from 'lucide-react';
import { useDeleteUser, useUsers } from '@/hooks/use-users';
import { PermissionDenied } from '@/components/PermissionGuard';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal with Theme Support
const DeleteConfirmModal = ({ user, onConfirm, onCancel }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold">{user.fullName}</span>?
          This will permanently remove the user from the system.
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
            Delete User
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

// Role Badge Component with Theme Support
const RoleBadge = ({ roleName }) => (
  <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
    {roleName}
  </span>
);

// Status Badge Component with Theme Support
const StatusBadge = ({ status }) => (
  <span className="px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
    {status || "Active"}
  </span>
);

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { tenant } = useAuthStore();
  const router = useRouter();

  // Use the permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin,
  } = usePermissions();

  // Check if user has read access to Users
  if (!canRead('Users') && !isAdmin()) {
    return <PermissionDenied resource="Users" action="read" />;
  }

  const { data, isLoading, refetch } = useUsers({
    q: search || undefined,
    page,
    limit: 10,
    tenantId: tenant?.id,
  });

  const deleteUser = useDeleteUser();

  const RemoveUser = async (id) => {
    if (!tenant?.id) return toast.error("Tenant not found");

    // Check permission before attempting delete
    if (!canDelete('Users') && !isAdmin()) {
      toast.error("You don't have permission to delete users");
      return;
    }

    try {
      await deleteUser.mutateAsync({ id, tenantId: tenant.id });
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          user={deleteConfirm}
          onConfirm={() => RemoveUser(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} users registered
          </p>
        </div>

        {/* Create button */}
        {canCreate('Users') && (
          <Link
            href="/dashboard/users/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> New User
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or phone..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">User</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Department</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Roles</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                {(canUpdate('Users') || canDelete('Users')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={6} />
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1b4dff] dark:bg-[#1b4dff] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {u.fullName?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">{u.fullName}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {u.department || '—'} {u.designation && `/ ${u.designation}`}
                    </td>

                    {/* Roles */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.assignRoles?.map((r) => (
                          <RoleBadge key={r.id} roleName={r.role?.name} />
                        ))}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {u.phone || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>

                    {/* Actions - Edit and Delete buttons */}
                    {(canUpdate('Users') || canDelete('Users')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          {canUpdate('Users') && (
                            <button
                              onClick={() => router.push(`/dashboard/users/edit?id=${u.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete('Users') && (
                            <button
                              onClick={() => setDeleteConfirm(u)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete User"
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
                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No users found</p>
                    {canCreate('Users') && (
                      <Link href="/dashboard/users/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Add your first user →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} users
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

      {/* Admin Only Section with Theme Support */}
      {isAdmin() && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Admin Mode: You have full access to all user management features
            </p>
          </div>
        </div>
      )}
    </div>
  );
}