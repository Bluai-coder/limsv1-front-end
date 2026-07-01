

// app/admin/tenants/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, ChevronLeft, ChevronRight, Building, Shield,
  Pencil, Trash2, Eye, CheckCircle, XCircle, Mail, Phone,
  MapPin, Calendar, Users, X, Loader2,
  Server,
  TrendingUp
} from 'lucide-react';
import { useTenants, useDeleteTenant, useTenantById } from '@/hooks/use-tenants';
import { toast } from 'sonner';
import EditTenantModal from '../../../components/EditTenantModal';

// ==================== DELETE CONFIRMATION MODAL ====================
const DeleteConfirmModal = ({ tenant, onConfirm, onCancel }) => {
  if (!tenant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Tenant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold">{tenant.name}</span>?
          This will permanently remove the tenant and all associated data from the system.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition">Delete Tenant</button>
        </div>
      </div>
    </div>
  );
};

// ==================== VIEW DETAILS MODAL ====================
const ViewDetailsModal = ({ isOpen, onClose, tenantId }) => {
  const { data, isLoading } = useTenantById(tenantId);
  const tenant = data?.data;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Tenant Details</h2>
              <p className="text-blue-100 text-sm">Complete information about the tenant</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : tenant ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Tenant Name</label><p className="font-medium text-gray-900 dark:text-white">{tenant.name}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Subdomain</label><p className="font-mono text-sm text-gray-900 dark:text-white">{tenant.subdomain}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Email</label><p className="text-gray-900 dark:text-white">{tenant.email}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Phone</label><p className="text-gray-900 dark:text-white">{tenant.phone || '—'}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Status</label>{tenant.status === 'active' ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Active</span> : <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Inactive</span>}</div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Plan</label><span className={`px-2 py-1 text-xs rounded-full ${tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' : tenant.plan === 'professional' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{tenant.plan || 'Basic'}</span></div>
                </div>
              </div>

              {/* Address Information */}
              {(tenant.address || tenant.city || tenant.state || tenant.country || tenant.pincode) && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" /> Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><label className="text-xs text-gray-500 dark:text-gray-400">Street Address</label><p className="text-gray-900 dark:text-white">{tenant.address || '—'}</p></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400">City</label><p className="text-gray-900 dark:text-white">{tenant.city || '—'}</p></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400">State</label><p className="text-gray-900 dark:text-white">{tenant.state || '—'}</p></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400">Country</label><p className="text-gray-900 dark:text-white">{tenant.country || '—'}</p></div>
                    <div><label className="text-xs text-gray-500 dark:text-gray-400">Pincode</label><p className="text-gray-900 dark:text-white">{tenant.pincode || '—'}</p></div>
                  </div>
                </div>
              )}

              {/* Technical Information (Non-editable) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-purple-600" /> Technical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Schema Name</label><p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">{tenant.schemaName || '—'}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Database Schema</label><p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">{tenant.subdomain || 'unknown'}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Created At</label><p className="text-gray-900 dark:text-white">{new Date(tenant.createdAt).toLocaleString()}</p></div>
                  <div><label className="text-xs text-gray-500 dark:text-gray-400">Last Updated</label><p className="text-gray-900 dark:text-white">{new Date(tenant.updatedAt).toLocaleString()}</p></div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-600" /> Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenant.userCount || 0}</p><p className="text-xs text-gray-500">Total Users</p></div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenant.orderCount || 0}</p><p className="text-xs text-gray-500">Total Orders</p></div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenant.testCount || 0}</p><p className="text-xs text-gray-500">Test Catalog</p></div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenant.specimenCount || 0}</p><p className="text-xs text-gray-500">Specimens</p></div>
                </div>
              </div>
            </div>
          ) : <div className="text-center py-12 text-gray-500">Tenant not found</div>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Close</button>
        </div>
      </div>
    </div>
  );
};


// ==================== MAIN TENANTS PAGE ====================
export default function TenantsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const { data, isLoading, refetch } = useTenants({ search: search || undefined, page, limit: 10 });
  const deleteTenant = useDeleteTenant();

  const RemoveTenant = async (id) => {
    try {
      toast.warning("You are not authorized to delete tenants!");
      setDeleteConfirm(null);
      refetch();
    } catch (error) { toast.error(error?.response?.data?.message || "Failed to delete tenant"); }
  };

  const handleViewDetails = (tenantId) => {
    setSelectedTenantId(tenantId); setViewModalOpen(true);
  };
  const handleEditTenant = (tenantId) => {
    setSelectedTenantId(tenantId); setEditModalOpen(true);
  };
  const handleUpdateComplete = () => { refetch(); };

  const tenants = data?.data || [];
  const pagination = data?.pagination;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {deleteConfirm && <DeleteConfirmModal tenant={deleteConfirm} onConfirm={() => RemoveTenant(deleteConfirm.id)} onCancel={() => setDeleteConfirm(null)} />}
      <ViewDetailsModal isOpen={viewModalOpen} onClose={() => { setViewModalOpen(false); setSelectedTenantId(null); }} tenantId={selectedTenantId} />
      {/* // Modal component */}
      <EditTenantModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTenantId(null);
        }}
        tenantId={selectedTenantId}
        onUpdate={() => refetch()}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Tenants</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tenants.length || 0} tenants registered</p></div>
        <Link href="/admin/tenants/new" className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"><Plus className="w-4 h-4" /> New Tenant</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Tenants</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenants.length || 0}</p></div><Building className="w-10 h-10 text-blue-500 opacity-50" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Active Tenants</p><p className="text-2xl font-bold text-green-600">{activeTenants}</p></div><CheckCircle className="w-10 h-10 text-green-500 opacity-50" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Inactive Tenants</p><p className="text-2xl font-bold text-red-600">{inactiveTenants}</p></div><XCircle className="w-10 h-10 text-red-500 opacity-50" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{tenants.reduce((acc, t) => acc + (t.userCount || 0), 0)}</p></div><Users className="w-10 h-10 text-purple-500 opacity-50" /></div></div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"><div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by tenant name, subdomain or email..." className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" /></div></div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700"><tr><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Tenant</th><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Subdomain</th><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Contact</th><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Plan</th><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Status</th><th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400">Created</th><th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (<TableSkeleton key={i} columns={7} />)) : tenants.length > 0 ? tenants.map((tenant) => (<tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">{tenant.name?.[0] || 'T'}</div><div><div className="font-medium text-gray-900 dark:text-white truncate">{tenant.name}</div><div className="text-xs text-gray-400 dark:text-gray-500 truncate">{tenant.email}</div></div></div></td>
                <td className="px-6 py-4"><code className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">{tenant.subdomain}</code></td>
                <td className="px-6 py-4"><div className="space-y-1">{tenant.email && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Mail className="w-3 h-3" />{tenant.email}</div>}{tenant.phone && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Phone className="w-3 h-3" />{tenant.phone}</div>}{tenant.city && <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><MapPin className="w-3 h-3" />{tenant.city}, {tenant.state}</div>}</div></td>
                <td className="px-6 py-4"><PlanBadge plan={tenant.plan} /></td>
                <td className="px-6 py-4"><StatusBadge status={tenant.status} /></td>
                <td className="px-6 py-4"><div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(tenant.createdAt).toLocaleDateString()}</div></td>
                <td className="px-6 py-4"><div className="flex items-center justify-center gap-2"><button onClick={() => handleViewDetails(tenant.id)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details"><Eye className="w-4 h-4" /></button><button onClick={() => handleEditTenant(tenant.id)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" title="Edit Tenant"><Pencil className="w-4 h-4" /></button><button onClick={() => setDeleteConfirm(tenant)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="Delete Tenant"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>)) : (<tr><td colSpan="7" className="py-20 text-center"><Building className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" /><p className="text-gray-400 dark:text-gray-500 font-medium">No tenants found</p><Link href="/admin/tenants/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">Create your first tenant →</Link></td></tr>)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (<div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"><p className="text-sm text-gray-500 dark:text-gray-400">Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} tenants</p><div className="flex items-center gap-2 mt-3 sm:mt-0"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Page {page} of {pagination.totalPages}</span><button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {/* Admin Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"><div className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /><p className="text-sm text-blue-800 dark:text-blue-300">Super Admin: You have full access to manage all tenants across the platform</p></div></div>
    </div>
  );
}

// Loading Skeleton Component
const TableSkeleton = ({ columns = 7 }) => (<tr className="animate-pulse">{Array.from({ length: columns }).map((_, j) => (<td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>))}</tr>);

// Status Badge Component
const StatusBadge = ({ status }) => (status === 'active' ? <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Active</span> : <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium"><XCircle className="w-3 h-3" /> Inactive</span>);

// Plan Badge Component
const PlanBadge = ({ plan }) => { const plans = { basic: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', professional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }; return <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${plans[plan] || plans.basic}`}>{plan || 'Basic'}</span>; };