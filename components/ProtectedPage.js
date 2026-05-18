// components/ProtectedPage.js
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '../hooks/permissions/usePermissions';
import {PermissionDenied} from './PermissionGuard';

export function withProtection(Component, options = {}) {
  const { resource, action, redirectTo = '/dashboard' } = options;
  
  return function ProtectedPage(props) {
    const { hasPermission, isAdmin } = usePermissions();
    const router = useRouter();
    
    const hasAccess = isAdmin() || (resource && action && hasPermission(resource, action));
    
    useEffect(() => {
      if (!hasAccess && resource && action) {
        if (redirectTo) {
          router.replace(redirectTo);
        }
      }
    }, [hasAccess]);
    
    if (!hasAccess && resource && action) {
      return <PermissionDenied resource={resource} action={action} />;
    }
    
    return <Component {...props} />;
  };
}