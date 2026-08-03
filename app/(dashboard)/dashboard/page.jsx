'use client';

// ============================================================
// app/(dashboard)/dashboard/page.jsx — Enhanced LIMS Dashboard
// Features: KPI cards, TAT tracking, critical alerts panel,
// department breakdown, recent orders table, quick actions
// Fully dark-mode aware using Tailwind dark: variants
// ============================================================

import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useOrderStats, useOrders } from '@/hooks/use-orders';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import {
  ClipboardList, TestTubes, AlertTriangle, Clock,
  TrendingUp, Users, ArrowRight, Activity, Bell,
  FlaskConical, Zap, CheckCircle, Timer, BarChart2,
  RefreshCw, ChevronRight, Beaker
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// ── Status color map for order status badges ──────────────────
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

/** Returns a Tailwind class string for a given order status */
const getStatusColor = (status) =>
  STATUS_COLOR_MAP[status || ''] || 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400';

/** Returns a Tailwind class string for a given priority level */
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'stat': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold';
    case 'urgent': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    case 'timed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'routine': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
};

/** Formats a snake_case value to Title Case */
const formatLabel = (value) =>
  value?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

/** Returns initials from first and last name */
const getInitials = (first, last) =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

// ── Department color configuration for breakdown panel ──────
const DEPT_COLORS = {
  hematology: { bg: 'bg-red-500', light: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  biochemistry: { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  immunology: { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  microbiology: { bg: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  pathology: { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  clinical: { bg: 'bg-teal-500', light: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
};

export default function DashboardPage() {
  // ── Permissions ─────────────────────────────────────────────
  const { canCreate, canRead, isAdmin } = usePermissions();

  if (!canRead('Dashboard')) {
    return <PermissionDenied resource="Dashboard" action="read" />;
  }

  const { user } = useAuthStore();

  // ── Data hooks ───────────────────────────────────────────────
  const { data: stats, isLoading, refetch } = useOrderStats();
  const { data: recentOrders } = useOrders({ limit: 8 });

  // ── Local state for extra panels ────────────────────────────
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);
  const [tatData, setTatData] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /**
   * Fetches critical value notifications from the backend.
   * These are test results that exceeded critical thresholds.
   */
  const fetchCriticalAlerts = async () => {
    try {
      const res = await api.get('/critical-values/notifications?status=pending&limit=5');
      setCriticalAlerts(res.data?.data || []);
    } catch {
      // Silently fail — critical alerts are supplementary
    }
  };

  /**
   * Fetches worklist stats to build the department breakdown panel.
   * Groups pending tests by department.
   */
  const fetchDeptBreakdown = async () => {
    try {
      const res = await api.get('/worklist/stats');
      const byDept = res.data?.data?.byDepartment || [];
      setDeptBreakdown(byDept);
      setTatData(res.data?.data?.tat || null);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchCriticalAlerts();
    fetchDeptBreakdown();
  }, []);

  /**
   * Handles a manual dashboard refresh — refetches all data.
   */
  const handleRefresh = () => {
    refetch();
    fetchCriticalAlerts();
    fetchDeptBreakdown();
    setLastRefresh(new Date());
  };

  // ── Greeting based on time of day ───────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Calculate derived stats ──────────────────────────────────
  const totalPendingWork = (stats?.data?.pendingTechVerification ?? 0) + (stats?.data?.pendingPathVerification ?? 0);
  const completedToday = recentOrders?.data?.filter((order) =>
    order.status === 'reported' &&
    new Date(order.ordered_at).toDateString() === new Date().toDateString()
  ).length ?? 0;

  // ── KPI stat card configuration ─────────────────────────────
  const statCards = [
    {
      label: "Today's Orders",
      value: stats?.data?.todayOrders ?? '—',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
      href: '/dashboard/orders',
      description: 'Total lab orders received today'
    },
    {
      label: 'Pending Work',
      value: totalPendingWork,
      icon: Clock,
      color: 'from-amber-500 to-yellow-600',
      href: '/dashboard/worklist',
      description: 'Tests awaiting verification'
    },
    {
      label: 'STAT Orders',
      value: stats?.data?.pendingStatOrders ?? '—',
      icon: Zap,
      color: 'from-red-500 to-rose-600',
      href: '/dashboard/orders',
      description: 'Urgent priority tests in queue'
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      href: '/dashboard/orders',
      description: 'Orders reported today'
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            {greeting},{' '}
            <span className="text-blue-600 dark:text-blue-400">
              {user?.fullName?.split(' ')[0] || 'User'}
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Operational overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh dashboard data"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href || '#'}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium truncate">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : card.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{card.description}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm flex-shrink-0 ml-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content: Orders + Side Panels ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders Table (takes 2/3 width on XL) */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            </div>
            {canRead('Orders') && (
              <Link
                href="/dashboard/orders"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {canRead('Orders') ? (
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/60 sticky top-0 z-10">
                  <tr>
                    {['Order #', 'Patient', 'Tests', 'Priority', 'Status', 'Time'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {isLoading ? (
                    // Skeleton rows while loading
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    recentOrders?.data?.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/orders`}
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-xs font-mono"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(order.patient?.firstName, order.patient?.lastName)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                {[order.patient?.firstName, order.patient?.lastName].filter(Boolean).join(' ')}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">{order.patient?.mrn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {order.orderTests?.slice(0, 2).map((ot) => (
                              <span key={ot.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-mono">
                                {ot.test?.code || ot.test?.name?.substring(0, 8)}
                              </span>
                            ))}
                            {order.orderTests?.length > 2 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">+{order.orderTests.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
                            {order.priority === 'stat' && <Zap className="w-3 h-3 mr-1" />}
                            {formatLabel(order.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                            {formatLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {order.ordered_at ? new Date(order.ordered_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                  {!isLoading && (!recentOrders?.data || recentOrders.data.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No orders today</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-gray-400 dark:text-gray-600 text-sm">
              You don't have permission to view orders.
            </div>
          )}
        </div>

        {/* Right Side Panels (1/3 width on XL) */}
        <div className="flex flex-col gap-4">

          {/* Critical Alerts Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-red-800 dark:text-red-300 text-sm">Critical Alerts</h3>
              </div>
              {criticalAlerts.length > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {criticalAlerts.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {criticalAlerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 dark:text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">No critical values pending</p>
                </div>
              ) : (
                criticalAlerts.slice(0, 4).map((alert, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {alert.analyte || alert.test_name || 'Critical Value'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {alert.patient_name || 'Patient'} · {alert.value}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        {alert.status === 'pending' ? 'Awaiting acknowledgment' : alert.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Breakdown Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">By Department</h3>
            </div>
            <div className="p-4 space-y-3">
              {deptBreakdown.length === 0 ? (
                // Placeholder bars when no data
                ['Hematology', 'Biochemistry', 'Microbiology'].map(dept => (
                  <div key={dept}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{dept}</span>
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-200 dark:bg-gray-600 rounded-full w-0" />
                    </div>
                  </div>
                ))
              ) : (
                deptBreakdown.map((dept, i) => {
                  const colors = Object.values(DEPT_COLORS)[i % Object.keys(DEPT_COLORS).length];
                  const maxCount = Math.max(...deptBreakdown.map(d => d.count || 0), 1);
                  const pct = Math.round(((dept.count || 0) / maxCount) * 100);
                  return (
                    <div key={dept.department || i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{dept.department}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{dept.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* TAT Summary Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Turn-Around Time</h3>
            </div>
            <div className="p-4 space-y-2">
              {tatData ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Average TAT</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{tatData.avgMinutes || '—'} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Within SLA</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{tatData.withinSla || '—'}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">TAT Breaches</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{tatData.breaches || 0}</span>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  {[{ label: 'Average TAT', note: 'Worklist data needed' }, { label: 'Within SLA', note: 'Connect worklist' }].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">{item.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Actions</h3>
            </div>
            <div className="p-2 space-y-1">
              {[
                canCreate('Patients') && { href: '/dashboard/patients/new', icon: Users, label: 'Register Patient', color: 'text-blue-600 dark:text-blue-400' },
                canCreate('Orders') && { href: '/dashboard/orders/new', icon: ClipboardList, label: 'New Order', color: 'text-indigo-600 dark:text-indigo-400' },
                canRead('Specimens') && { href: '/dashboard/specimens', icon: Beaker, label: 'Receive Specimen', color: 'text-violet-600 dark:text-violet-400' },
                canRead('Worklist') && { href: '/dashboard/worklist', icon: FlaskConical, label: 'Open Worklist', color: 'text-amber-600 dark:text-amber-400' },
              ].filter(Boolean).map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <action.icon className={`w-4 h-4 ${action.color} flex-shrink-0`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
