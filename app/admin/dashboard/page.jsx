// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building, Users, Activity, TrendingUp, TrendingDown,
  Calendar, CheckCircle, XCircle, Clock, AlertCircle,
  ArrowUpRight, ArrowDownRight, MoreVertical,
  Download, RefreshCw, Filter, BarChart3,
  PieChart, Layers, Crown, Home, Server,
  Mail, Phone, MapPin, Eye, Pencil,
  ChevronRight, Sparkles, Zap, Target,
  ShoppingBag, TestTube, Microscope
} from 'lucide-react';
import { useTenants, useTenantById } from '@/hooks/use-tenants';
import { toast } from 'sonner';

// ==================== STATISTICS CARD ====================
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
        )}
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend !== undefined && !loading && (
      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">vs last month</span>
      </div>
    )}
  </div>
);

// ==================== ACTIVITY ITEM ====================
const ActivityItem = ({ icon: Icon, title, description, time, color, type }) => (
  <div className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{time}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
    </div>
  </div>
);

// ==================== RECENT TENANT CARD ====================
const RecentTenantCard = ({ tenant }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-500/20">
      {tenant.name?.[0] || 'T'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tenant.name}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${tenant.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
          {tenant.status}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{tenant.plan || 'Basic'}</span>
      </div>
    </div>
    <div className="flex gap-1">
      <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
        <Eye className="w-4 h-4" />
      </button>
      <button className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ==================== PLAN DISTRIBUTION CHART ====================
const PlanDistribution = ({ tenants }) => {
  const plans = tenants?.reduce((acc, t) => {
    const plan = t.plan || 'basic';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  const planColors = {
    basic: 'bg-gray-500',
    professional: 'bg-blue-500',
    enterprise: 'bg-purple-500'
  };

  const planLabels = {
    basic: 'Basic',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };

  const total = tenants?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Distribution</p>
        <span className="text-xs text-gray-400">{total} total</span>
      </div>
      <div className="space-y-3">
        {Object.entries(plans || {}).map(([plan, count]) => (
          <div key={plan}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{planLabels[plan] || plan}</span>
              <span className="font-medium text-gray-900 dark:text-white">{count} ({Math.round((count/total)*100)}%)</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${planColors[plan] || 'bg-gray-500'} rounded-full transition-all duration-1000`}
                style={{ width: `${(count/total)*100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== STATUS DISTRIBUTION ====================
const StatusDistribution = ({ tenants }) => {
  const active = tenants?.filter(t => t.status === 'active').length || 0;
  const inactive = tenants?.filter(t => t.status === 'inactive').length || 0;
  const total = tenants?.length || 0;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Overview</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{active}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active</p>
          <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${(active/total)*100 || 0}%` }} />
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{inactive}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inactive</p>
          <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${(inactive/total)*100 || 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('week');

  const { data, isLoading, refetch } = useTenants({ 
    search: search || undefined, 
    page, 
    limit: 100 
  });

  const tenants = data?.data || [];
  const pagination = data?.pagination;

  // Calculate statistics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;
  const totalUsers = tenants.reduce((acc, t) => acc + (t.userCount || 0), 0);
  const totalOrders = tenants.reduce((acc, t) => acc + (t.orderCount || 0), 0);
  const totalTests = tenants.reduce((acc, t) => acc + (t.testCount || 0), 0);

  // Mock trends (replace with real data from API)
  const trends = {
    tenants: 12,
    users: 18,
    orders: 25,
    tests: 8
  };

  // Recent activity (mock - replace with real activity API)
  const recentActivities = [
    { icon: Building, title: 'New tenant created', description: 'MediCare Labs joined the platform', time: '2 min ago', color: 'bg-blue-500' },
    { icon: Users, title: 'User added', description: 'Dr. Sarah Johnson added to HealthPlus', time: '15 min ago', color: 'bg-green-500' },
    { icon: Activity, title: 'System update', description: 'Database migration completed successfully', time: '1 hour ago', color: 'bg-purple-500' },
    { icon: CheckCircle, title: 'Tenant activated', description: 'QuickDiagnostics activated', time: '3 hours ago', color: 'bg-emerald-500' },
    { icon: AlertCircle, title: 'Warning', description: 'Storage usage at 85% for PharmaCare', time: '5 hours ago', color: 'bg-orange-500' },
  ];

  // Recent tenants
  const recentTenants = tenants.slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
    toast.success('Dashboard refreshed');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time overview of your tenant ecosystem
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['week', 'month', 'year'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeframe === t 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Tenants" 
          value={totalTenants} 
          icon={Building} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={trends.tenants}
          subtitle={`${activeTenants} active`}
          loading={isLoading}
        />
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          trend={trends.users}
          loading={isLoading}
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={ShoppingBag} 
          color="bg-gradient-to-br from-purple-500 to-violet-600"
          trend={trends.orders}
          loading={isLoading}
        />
        <StatCard 
          title="Tests Conducted" 
          value={totalTests} 
          icon={Microscope} 
          color="bg-gradient-to-br from-orange-500 to-amber-600"
          trend={trends.tests}
          loading={isLoading}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                </div>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  View All →
                </button>
              </div>
            </div>
            <div className="p-4 divide-y divide-gray-100 dark:divide-gray-700">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/tenants/new" className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white hover:shadow-lg hover:scale-[1.02] transition-all group">
              <Plus className="w-5 h-5 mb-2 group-hover:rotate-90 transition-transform" />
              <p className="font-semibold text-sm">New Tenant</p>
              <p className="text-xs text-blue-100">Add organization</p>
            </Link>
            <Link href="/admin/users" className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl text-white hover:shadow-lg hover:scale-[1.02] transition-all group">
              <Users className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Manage Users</p>
              <p className="text-xs text-green-100">User management</p>
            </Link>
            <Link href="/admin/analytics" className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-2xl text-white hover:shadow-lg hover:scale-[1.02] transition-all group">
              <BarChart3 className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm">Analytics</p>
              <p className="text-xs text-purple-100">View insights</p>
            </Link>
            <Link href="/admin/settings" className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-2xl text-white hover:shadow-lg hover:scale-[1.02] transition-all group">
              <Settings className="w-5 h-5 mb-2 group-hover:rotate-90 transition-transform" />
              <p className="font-semibold text-sm">Settings</p>
              <p className="text-xs text-orange-100">Configure</p>
            </Link>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Recent Tenants */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tenants</h2>
                </div>
                <Link href="/admin/tenants" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-4 divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : recentTenants.length > 0 ? (
                recentTenants.map((tenant) => (
                  <RecentTenantCard key={tenant.id} tenant={tenant} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No tenants yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribution</h2>
            </div>
            <PlanDistribution tenants={tenants} />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <StatusDistribution tenants={tenants} />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table Preview */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Tenants</h2>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {totalTenants}
            </span>
          </div>
          <Link href="/admin/tenants" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
            Manage Tenants <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tenants.length > 0 ? (
                tenants.slice(0, 5).map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                          {tenant.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{tenant.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{tenant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
                        tenant.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        tenant.plan === 'enterprise' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                          : tenant.plan === 'professional' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {tenant.plan || 'Basic'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{tenant.userCount || 0}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{tenant.orderCount || 0}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p>No tenants found. Create your first tenant to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">System Health</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Total Revenue</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
            </div>
            <div className="ml-auto">
              <p className="text-lg font-bold text-green-600">$124.8K</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Growth Rate</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Month over month</p>
            </div>
            <div className="ml-auto">
              <p className="text-lg font-bold text-purple-600">+23.5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Settings icon since it was missing
const Settings = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Add Plus icon import
import { Plus } from 'lucide-react';
