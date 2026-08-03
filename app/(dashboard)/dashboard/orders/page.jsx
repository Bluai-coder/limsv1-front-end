
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useOrderDelete, useOrders } from '@/hooks/use-orders';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pencil,
  Trash2,
  Eye,
  ListRestartIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import OrderDetailsPopup from '@/components/detail-popup/OrderDetailsPopup';
import QueryError from '@/components/common/QueryError';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// ================= STATUS FILTERS =================
const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Registered', value: 'registered' },
  { label: 'Specimen Collected', value: 'specimen_collected' },
  { label: 'Specimen Received', value: 'specimen_received' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Partial Complete', value: 'partial_complete' },
  { label: 'Completed', value: 'completed' },
  { label: 'Verified', value: 'verified' },
  { label: 'Reported', value: 'reported' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ================= STATUS COLOR with Theme Support =================
const STATUS_COLOR_MAP = {
  registered: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  specimen_collected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  specimen_received: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  partial_complete: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  verified: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  reported: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  on_hold: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

const getStatusColor = (status) =>
  STATUS_COLOR_MAP[status || ''] || 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400';

// ================= PRIORITY COLOR with Theme Support =================
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'stat': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'urgent': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'timed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'routine': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }
};

const formatLabel = (value) =>
  value?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

// Delete Confirmation Modal with Theme Support
const DeleteConfirmModal = ({ order, onConfirm, onCancel }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Order</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete order <span className="font-semibold">{order.order_number}</span>?
          This will permanently remove the order and all associated data.
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
            Delete Order
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 8 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </td>
    ))}
  </tr>
);

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const searchParams = useSearchParams();
  const mrnParam = searchParams.get("id"); // e.g., "123"

  const { tenant } = useAuthStore();
  const router = useRouter();

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Orders
  if (!canRead('Orders')) {
    return <PermissionDenied resource="Orders" action="read" />;
  }

  const { data, isLoading, isError, error, refetch } = useOrders({
    orderNumber: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 10,
    tenantId: tenant?.id,
  });

  // 1. Extract the raw data
  const allOrders = data?.data || [];
  const pagination = data?.pagination;

  // 2. ✅ CORRECT: Filter using useMemo (happens before render, no flickering)
  const orders = useMemo(() => {
    // If there is a URL parameter, filter the orders
    if (mrnParam) {
      // Ensure strict comparison (Number vs String if needed)
      return allOrders.filter((item) => String(item?.patient?.mrn) == String(mrnParam));
    }
    // Otherwise return all orders
    return allOrders;
  }, [allOrders, mrnParam]); // Re-run only when data or URL changes

  // 3. ✅ CORRECT: Reset handler
  const handleResetData = () => {
    router.replace("/dashboard/orders");
  };
  // State for order details popup
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handle order row click for viewing details
  const handleOrderClick = (order, e) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setIsPopupOpen(true);
  };

  const deleteOrder = useOrderDelete();

  const handleDelete = async (id) => {
    // Check permission before attempting delete
    if (!canDelete('Orders') && !isAdmin()) {
      toast.error("You don't have permission to delete orders");
      return;
    }

    try {
      await deleteOrder.mutateAsync(id);
      toast.success("Order deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete order");
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          order={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} total orders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8" >
          <div className="p-2 text-gray-600 cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ListRestartIcon onClick={handleResetData} />
          </div>

          {canCreate('Orders') && (
            <Link
              href="/dashboard/orders/new"
              className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" /> New Order
            </Link>
          )}

        </div>




      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order number..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === filter.value
                ? "bg-[#1b4dff] text-white shadow"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isError && <QueryError error={error} onRetry={refetch} className="mb-4" />}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Order #</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Physician</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Tests</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Priority</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Ordered At</th>
                {(canUpdate('Orders') || canDelete('Orders')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={8} />
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Order Number - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        // onClick={(e) => handleOrderClick(order, e)}
                        onClick={() => router.push(`/dashboard/specimens?id=${order.order_number}`)}
                        className="text-[#1b4dff] dark:text-[#1b4dff] font-semibold hover:underline cursor-pointer"
                      >
                        {order.order_number}
                      </button>
                    </td>

                    {/* Physician */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {order?.referringPhysician?.full_name || '—'}
                    </td>

                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {[order.patient?.firstName, order.patient?.middleName, order.patient?.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{order.patient?.mrn}</div>
                    </td>

                    {/* Tests */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {order.orderTests?.slice(0, 4).map((ot) => (
                          <span key={ot.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-300">
                            {ot.test?.code}
                          </span>
                        ))}
                        {order.orderTests?.length > 4 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">+{order.orderTests.length - 4}</span>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
                        {formatLabel(order.priority)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {formatLabel(order.status)}
                      </span>
                    </td>

                    {/* Ordered At */}
                    <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {order.ordered_at ? new Date(order.ordered_at).toLocaleString('en-IN') : '—'}
                    </td>

                    {/* Actions - Edit and Delete buttons */}
                    {(canUpdate('Orders') || canDelete('Orders')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={(e) => handleOrderClick(order, e)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Orders') && (
                            <button
                              onClick={() => router.push(`/dashboard/orders/edit?id=${order.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Order"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete('Orders') && (
                            <button
                              onClick={() => setDeleteConfirm(order)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Order"
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
                  <td colSpan={8} className="py-20 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No orders found</p>
                    {/* {canCreate('Orders') && (
                      <Link href="/dashboard/orders/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Create your first order →
                      </Link>
                    )} */}
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
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} orders
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

      {/* Order Details Popup */}
      <OrderDetailsPopup
        order={selectedOrder}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedOrder(null);
        }}
        onViewSpecimens={(orderId) => {
          router.push(`#`);
        }}
      />
    </div>
  );
}