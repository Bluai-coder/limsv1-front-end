
// -------------------------------------------------------------------------------------------------------------------------------------------------

'use client';

import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useOrderStats, useOrders } from '@/hooks/use-orders';
import { useAuthStore } from '@/lib/auth-store';
import {
  ClipboardList, TestTubes, AlertTriangle, Clock,
  TrendingUp, Users, ArrowRight, Activity
} from 'lucide-react';
import Link from 'next/link';

const STATUS_COLOR_MAP = {
  registered: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  specimen_collected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  specimen_received: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  partial_complete: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  verified: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  reported: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  on_hold: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

const getStatusColor = (status) =>
  STATUS_COLOR_MAP[status || ''] || 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'stat': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    case 'urgent': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'timed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'routine': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
};

const formatLabel = (value) =>
  value?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

export default function DashboardPage() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Dashboard
  if (!canRead('Dashboard')) {
    return <PermissionDenied resource="Dashboard" action="read" />;
  }
  
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useOrderStats();
  const { data: recentOrders } = useOrders({ limit: 8 });

  const getInitials = (first, last) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  // Calculate total pending work (tech verification + path verification)
  const totalPendingWork = (stats?.data?.pendingTechVerification ?? 0) + (stats?.data?.pendingPathVerification ?? 0);

  // Calculate completed today
  const completedToday = recentOrders?.data?.filter((order) =>
    order.status === 'reported' &&
    new Date(order.ordered_at).toDateString() === new Date().toDateString()
  ).length ?? 0;

  const statCards = [
    {
      label: "Today's Orders",
      value: stats?.data?.todayOrders ?? '—',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Pending Work',
      value: totalPendingWork,
      icon: Clock,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      label: 'STAT Orders',
      value: stats?.data?.pendingStatOrders ?? '—',
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-600'
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-[#1b4dff] dark:text-[#1b4dff]">{user?.fullName?.split(' ')[0] || 'User'}</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Operational overview of today's lab activity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow transition-all duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium">{card.label}</p>
                <p className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mt-3">
                  {isLoading ? '—' : card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-inner`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Recent Orders Table */}
        <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-[#1b4dff] dark:text-[#1b4dff]" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            </div>
            {(canRead('Orders')) && (
              <Link href="/dashboard/orders" className="text-[#1b4dff] dark:text-[#1b4dff] text-sm font-medium flex items-center gap-1 hover:underline transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Table with both horizontal + vertical scroll */}
          {(canRead('Orders')) && (
            <div className="flex-1 overflow-auto" style={{ minHeight: '420px' }}>
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Order #</th>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Tests</th>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Priority</th>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                    <th className="px-5 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentOrders?.data?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <Link href={`#`} className="text-[#1b4dff] dark:text-[#1b4dff] font-semibold hover:underline transition-colors">
                          {order.order_number}
                        </Link>
                       </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1b4dff] to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(order.patient?.firstName, order.patient?.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {[order.patient?.firstName, order.patient?.middleName, order.patient?.lastName]
                                .filter(Boolean)
                                .join(' ')}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{order.patient?.mrn}</div>
                          </div>
                        </div>
                       </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {order.orderTests?.slice(0, 3).map((ot) => (
                            <span key={ot.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md whitespace-nowrap text-gray-700 dark:text-gray-300">
                              {ot.test?.code || ot.test?.name?.substring(0, 10)}
                            </span>
                          ))}
                          {order.orderTests?.length > 3 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">+{order.orderTests.length - 3}</span>
                          )}
                        </div>
                       </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
                          {formatLabel(order.priority)}
                        </span>
                       </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {formatLabel(order.status)}
                        </span>
                       </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {order.ordered_at ? new Date(order.ordered_at).toLocaleString() : '—'}
                       </td>
                    </tr>
                  ))}
                  {(!recentOrders?.data || recentOrders.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
               </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="w-full xl:w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm h-fit xl:sticky xl:top-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Quick Actions</h2>
          </div>

          {canCreate('Patients') && (
            <div className="p-4 space-y-3">
              <Link
                key={"Register Patient"}
                href={"/dashboard/patients/new"}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Register Patient</span>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </Link>
            </div>
          )}
          
          {canCreate('Orders') && (
            <div className="p-4 space-y-3">
              <Link
                key={"New Order"}
                href={"/dashboard/orders/new"}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                  <ClipboardList className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">New Order</span>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </Link>
            </div>
          )}

          {canRead('Specimens') && (
            <div className="p-4 space-y-3">
              <Link
                key={"Receive Specimen"}
                href={"/dashboard/specimens"}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
              >
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                  <TestTubes className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Receive Specimen</span>
                <ArrowRight className="ml-auto w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}