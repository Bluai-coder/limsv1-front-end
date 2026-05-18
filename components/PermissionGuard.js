// components/PermissionGuard.js
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { AlertCircle } from 'lucide-react';

/**
 * Component to conditionally render children based on permissions
 */
export const PermissionGuard = ({ 
  resource, 
  action, 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

  // Admin has all permissions
  if (isAdmin()) {
    return <>{children}</>;
  }

  let hasAccess = false;
  
  if (requireAll && Array.isArray(action)) {
    hasAccess = action.every(act => hasPermission(resource, act));
  } else if (Array.isArray(action)) {
    hasAccess = hasAnyPermission(resource, action);
  } else {
    hasAccess = hasPermission(resource, action);
  }

  return hasAccess ? <>{children}</> : fallback;
};

/**
 * Component to show permission denied message
 */
export const PermissionDenied = ({ resource, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
      <p className="text-sm text-gray-500">
        You don't have permission to {action} {resource?.toLowerCase()}
      </p>
    </div>
  );
};