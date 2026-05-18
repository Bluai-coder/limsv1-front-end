// components/withPermission.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePermissions } from '../hooks/permissions/usePermissions';

/**
 * HOC to protect routes/components based on permissions
 * @param {Component} Component - The component to wrap
 * @param {Object} options - Permission options
 * @param {string} options.resource - The resource name
 * @param {string|string[]} options.action - Required action(s)
 * @param {string} options.redirectTo - Redirect path if permission denied
 * @param {boolean} options.showToast - Show toast message on denial
 */
export const withPermission = (Component, options = {}) => {
  const {
    resource,
    action,
    redirectTo = '/dashboard',
    showToast = true,
  } = options;

  return function ProtectedComponent(props) {
    const { hasPermission, isAdmin } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      // Admin has all permissions
      if (isAdmin()) return;

      // Check permission
      const hasAccess = hasPermission(resource, action);
      
      if (!hasAccess) {
        if (showToast) {
          toast.error(`You don't have permission to access this resource`);
        }
        router.replace(redirectTo);
      }
    }, []);

    // Check permission before rendering
    if (!isAdmin() && !hasPermission(resource, action)) {
      return null;
    }

    return <Component {...props} />;
  };
};