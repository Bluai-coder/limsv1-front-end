

'use client';
// hooks/usePermissions.js
import { useMemo } from 'react';
import { useAuthStore } from './../../lib/auth-store';

/**
 * Permission checking hook for RBAC
 * Provides methods to check user permissions across the application
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const permissions = useMemo(() => {
    return user?.permissions || {};
  }, [user]);

  /**
   * Check if user has a specific permission for a resource
   * @param {string} resource - The resource name (e.g., 'Users', 'Patients', 'Orders')
   * @param {string|string[]} action - The action(s) to check (e.g., 'create', ['create', 'read'])
   * @returns {boolean} - True if user has all specified permissions
   */
  const hasPermission = (resource, action) => {
    if (!user || !user.permissions) return false;
    
    const resourcePermissions = user.permissions[resource];
    if (!resourcePermissions) return false;

    // Handle single action
    if (typeof action === 'string') {
      return resourcePermissions.includes(action);
    }

    // Handle multiple actions (AND condition)
    if (Array.isArray(action)) {
      return action.every(act => resourcePermissions.includes(act));
    }

    return false;
  };

  /**
   * Check if user has ANY of the specified permissions for a resource
   * @param {string} resource - The resource name
   * @param {string[]} actions - Array of actions to check
   * @returns {boolean} - True if user has at least one of the permissions
   */
  const hasAnyPermission = (resource, actions) => {
    if (!user || !user.permissions || !Array.isArray(actions)) return false;
    
    const resourcePermissions = user.permissions[resource];
    if (!resourcePermissions) return false;

    return actions.some(action => resourcePermissions.includes(action));
  };

  /**
   * Check if user has all permissions for multiple resources
   * @param {Object} requirements - Object with resource-action pairs
   * @returns {boolean} - True if user has all specified permissions
   */
  const hasAllPermissions = (requirements) => {
    if (!user || !user.permissions) return false;

    return Object.entries(requirements).every(([resource, action]) => {
      return hasPermission(resource, action);
    });
  };

  /**
   * Get all permissions for a specific resource
   * @param {string} resource - The resource name
   * @returns {string[]} - Array of permissions for the resource
   */
  const getResourcePermissions = (resource) => {
    return permissions[resource] || [];
  };

  /**
   * Check if user has full access (all CRUD operations) to a resource
   * @param {string} resource - The resource name
   * @returns {boolean} - True if user has create, read, update, delete permissions
   */
  const hasFullAccess = (resource) => {
    return hasPermission(resource, ['create', 'read', 'update', 'delete']);
  };

  /**
   * Check if user has read access to a resource
   * @param {string} resource - The resource name
   * @returns {boolean}
   */
  const canRead = (resource) => hasPermission(resource, 'read');

  /**
   * Check if user has create access to a resource
   * @param {string} resource - The resource name
   * @returns {boolean}
   */
  const canCreate = (resource) => hasPermission(resource, 'create');

  /**
   * Check if user has update access to a resource
   * @param {string} resource - The resource name
   * @returns {boolean}
   */
  const canUpdate = (resource) => hasPermission(resource, 'update');

  /**
   * Check if user has delete access to a resource
   * @param {string} resource - The resource name
   * @returns {boolean}
   */
  const canDelete = (resource) => hasPermission(resource, 'delete');

  /**
   * Get all resources the user has access to
   * @returns {string[]} - Array of resource names
   */
  const getAccessibleResources = () => {
    return Object.keys(permissions);
  };

  /**
   * Get all resources with a specific action
   * @param {string} action - The action to filter by (e.g., 'create')
   * @returns {string[]} - Array of resource names where user has the action
   */
  const getResourcesByAction = (action) => {
    return Object.entries(permissions)
      .filter(([_, actions]) => actions.includes(action))
      .map(([resource]) => resource);
  };

  /**
   * Check if user is admin (has admin role or full system access)
   * @returns {boolean}
   */
  const isAdmin = () => {
    const hasAdminRole = user?.roles?.some(role => 
      role.name === 'admin' || role.displayName === 'Administrator'
    );
    
    // Check if user has full access to all critical resources
    const criticalResources = ['Users', 'Roles', 'Settings', 'Permissions'];
    const hasFullSystemAccess = criticalResources.every(resource => 
      hasFullAccess(resource)
    );

    return hasAdminRole || hasFullSystemAccess;
  };

  /**
   * Get user role names
   * @returns {string[]}
   */
  const getUserRoles = () => {
    return user?.roles?.map(role => role.name) || [];
  };

  /**
   * Check if user has a specific role
   * @param {string|string[]} roleName - Role name(s) to check
   * @returns {boolean}
   */
  const hasRole = (roleName) => {
    if (!user?.roles) return false;
    
    if (typeof roleName === 'string') {
      return user.roles.some(role => 
        role.name === roleName || role.displayName === roleName
      );
    }
    
    if (Array.isArray(roleName)) {
      return roleName.some(role => 
        user.roles.some(r => r.name === role || r.displayName === role)
      );
    }
    
    return false;
  };

  return {
    // Basic permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getResourcePermissions,
    hasFullAccess,
    
    // Convenience methods for CRUD operations
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    
    // Resource management
    getAccessibleResources,
    getResourcesByAction,
    
    // Role management
    isAdmin,
    getUserRoles,
    hasRole,
    
    // Raw permissions object
    permissions,
    user,
  };
};