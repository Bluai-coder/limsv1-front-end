'use client';

import AppLayout from '@/components/layout/AppLayout';
import { dashboardMenuConfig } from '@/components/layout/menu-config';

export default function DashboardLayout({ children }) {
  return (
    <AppLayout menuConfig={dashboardMenuConfig} permissionAction="read" basePath="/dashboard">
      {children}
    </AppLayout>
  );
}
