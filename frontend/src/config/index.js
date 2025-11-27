/**
 * Centralized exports for role-based configuration
 */

// Export everything from roleConfig
export {
    navigationConfig,
    getNavigationForRole,
    getAccessiblePaths
} from './roleConfig';

// Export everything from permissions
export {
    UserRole,
    rolePermissions,
    routePermissions,
    canAccessRoute,
    hasPermission,
    getRequiredRole,
    getPermissionsForRole
} from './permissions';
