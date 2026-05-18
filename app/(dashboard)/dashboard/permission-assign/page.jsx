// ============================================================
// app/(dashboard)/dashboard/patients/page.tsx — Patient listing
// ============================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import ActionDropdown from '@/components/ActionDropdown';
import { useDeleteRole } from '@/hooks/use-roles';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useRolesPermission } from '@/hooks/use-role-permission';

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const [page, setPage] = useState(1);
  const { isAuthenticated, user, tenant, } = useAuthStore();
  // const { data, isLoading, isFetching } = useUsers({ q: search || undefined, page, limit: 20 });


  const deleteRole = useDeleteRole();


  const RemoveUser = async (id) => {

    console.log("TTTTTTTTTTTT", id)
    if (!tenant?.id) {
      toast.error("Tenant not found");
      return;
    }

    try {
      await deleteRole.mutateAsync({
        id,
        tenantId: tenant.id,
      });

      toast.success("Role deleted successfully");

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete role");
    }
  };


  // console.log("datadatadata",data)

  const { data, isLoading, isFetching } = useRolesPermission({
    q: search || undefined,
    page,
    limit: 20,
    tenantId: tenant?.id, // Pass tenant ID for multi-tenancy
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Permission Assigned</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.data?.length ?? 0} Permission Assigned
          </p>
        </div>
        <Link
          href="/dashboard/permission-assign/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#1b4dff] text-white rounded-lg text-sm font-medium hover:bg-brand-700 focus-ring transition-colors"
        >
          <Plus className="w-4 h-4" /> New Permission Assign
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by MRN, name, phone, or email..."
              className="input-lab pl-9"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
         <table className="w-full bg-blue-50">
            <thead>
              <tr className="table-header">
                {/* <th className="text-left px-5 py-3">MRN</th> */}
                <th className="text-left px-5 py-3">Role Name</th>
                <th className="text-left px-5 py-3">Description</th>
                {/* <th className="text-left px-5 py-3"></th>
                <th className="text-left px-5 py-3">Status</th> */}
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="table-row cursor-pointer" onClick={() => { }}>
                    {/* <td className="px-5 py-3">
                      <Link href={`/dashboard/users/${user.id}`} className="text-sm font-mono font-medium text-brand-600 hover:underline">
                        {user.mrn}
                      </Link>
                    </td> */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/*
                        <div className="w-8 h-8 bg-[#1b4dff] rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {user.fullName?.[0]?.toUpperCase()}
                            {user.fullName?.[1]?.toUpperCase()}
                          </span>
                        </div> */}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName}
                            {/* {user.isVip && <span className="ml-1.5 text-2xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">VIP</span>} */}
                          </div>
                          {/* {user.email && <div className="text-xs text-gray-400">{user.email}</div>} */}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {user.description}
                    </td>
                    {/* <td className="px-5 py-3 text-sm text-gray-600 font-mono">{user.phone}</td> */}
                    {/* <td className="px-5 py-3 text-sm text-gray-500">{user.status || '—'}</td> */}
                    <td className="px-8 py-3 text-xs text-gray-400 ">
                      {/* <ActionDropdown onView={() => { }} onEdit={() => { }} onDelete={() => { }} /> */}
                      <ActionDropdown
                        onView={() => { }}
                        onEdit={() => router.push(`roles/edit?id=${user.id}`)}
                        onDelete={() => RemoveUser(user.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {search ? 'Try adjusting your search' : 'Register your first user to get started'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 px-3">Page {page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
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
