'use client';

import AppLayout from '@/components/layout/AppLayout';
import { dashboardMenuConfig } from '@/components/layout/menu-config';
import SessionTimeoutWatcher from '@/components/SessionTimeoutWatcher';

export default function DashboardLayout({ children }) {
  return (
    <AppLayout menuConfig={dashboardMenuConfig} permissionAction="read" basePath="/dashboard">
      <SessionTimeoutWatcher />
      {children}
    </AppLayout>
  );
}
