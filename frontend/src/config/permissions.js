/**
 * Role-based permissions matrix
 * Defines what actions and routes each role can access
 */

// Define all available roles
export const UserRole = {
    GUEST: 'guest',
    USER: 'user',
    ADMIN: 'admin'
};

// Permission definitions for each role
export const rolePermissions = {
    guest: {
        // View permissions
        canViewPublicPages: true,
        canViewEvents: true,
        canViewAbout: true,
        canViewContact: true,
        canViewHome: true,

        // Action permissions
        canAuthenticate: true,
        canRegister: true,

        // Feature access
        canViewDashboard: false,
        canViewAlumni: false,
        canViewAnnouncements: false,
        canViewCommunity: false,
        canViewGallery: false,
        canDonate: true,
        canUpdateProfile: false,
        canRegisterForEvents: false,

        // Admin permissions
        canAccessAdminPanel: false,
        canManageUsers: false,
        canManageEvents: false,
        canManageAnnouncements: false,
        canManageClasses: false,
        canViewAnalytics: false,
    },
    user: {
        // View permissions
        canViewPublicPages: true,
        canViewEvents: true,
        canViewAbout: true,
        canViewContact: true,
        canViewHome: true,

        // Action permissions
        canAuthenticate: true,
        canRegister: false, // Already registered

        // Feature access
        canViewDashboard: true,
        canViewAlumni: true,
        canViewAnnouncements: true,
        canViewCommunity: true,
        canViewGallery: true,
        canDonate: true,
        canUpdateProfile: true,
        canRegisterForEvents: true,

        // Admin permissions
        canAccessAdminPanel: false,
        canManageUsers: false,
        canManageEvents: false,
        canManageAnnouncements: false,
        canManageClasses: false,
        canViewAnalytics: false,
    },
    admin: {
        // View permissions
        canViewPublicPages: true,
        canViewEvents: true,
        canViewAbout: true,
        canViewContact: true,
        canViewHome: true,

        // Action permissions
        canAuthenticate: true,
        canRegister: false, // Already registered

        // Feature access
        canViewDashboard: true,
        canViewAlumni: true,
        canViewAnnouncements: true,
        canViewCommunity: true,
        canViewGallery: true,
        canDonate: true,
        canUpdateProfile: true,
        canRegisterForEvents: true,

        // Admin permissions
        canAccessAdminPanel: true,
        canManageUsers: true,
        canManageEvents: true,
        canManageAnnouncements: true,
        canManageClasses: true,
        canViewAnalytics: true,
    }
};

/**
 * Route-to-role mapping
 * Defines minimum role required to access each route
 */
export const routePermissions = {
    // Public routes (guest accessible)
    '/': UserRole.GUEST,
    '/about': UserRole.GUEST,
    '/contact': UserRole.GUEST,
    '/events': UserRole.GUEST,
    '/donate': UserRole.GUEST,

    // User routes (requires authentication)
    '/dashboard': UserRole.USER,
    '/profile': UserRole.USER,
    '/settings': UserRole.USER,
    '/alumni': UserRole.USER,
    '/classes': UserRole.USER,
    '/announcements': UserRole.USER,
    '/community': UserRole.USER,
    '/gallery': UserRole.USER,

    // Admin routes (requires admin role)
    '/admin': UserRole.ADMIN,
    '/admin/users': UserRole.ADMIN,
    '/admin/events': UserRole.ADMIN,
    '/admin/announcements': UserRole.ADMIN,
    '/admin/classes': UserRole.ADMIN,
    '/admin/analytics': UserRole.ADMIN,
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The user role
 * @param {string} permission - The permission to check
 * @returns {boolean} True if role has permission
 */
export const hasPermission = (role, permission) => {
    const permissions = rolePermissions[role] || rolePermissions.guest;
    return permissions[permission] || false;
};

/**
 * Check if a role can access a specific route
 * @param {string} role - The user role ('guest', 'user', or 'admin')
 * @param {string} path - The route path to check
 * @returns {boolean} True if role can access the route
 */
export const canAccessRoute = (role, path) => {
    // Safety check: ensure path is a string
    if (typeof path !== 'string') {
        console.warn('[canAccessRoute] Invalid path type:', typeof path, path);
        return false;
    }

    // Normalize the path (remove trailing slash, handle dynamic segments)
    const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

    // Check exact match first
    if (routePermissions[normalizedPath]) {
        const requiredRole = routePermissions[normalizedPath];
        return isRoleSufficient(role, requiredRole);
    }

    // Check for admin sub-routes
    if (normalizedPath.startsWith('/admin')) {
        return role === UserRole.ADMIN;
    }

    // Check for partial matches (e.g., /events/123 should match /events)
    const matchingRoute = Object.keys(routePermissions).find(route => {
        if (route === '/') return false;
        return normalizedPath.startsWith(route);
    });

    if (matchingRoute) {
        const requiredRole = routePermissions[matchingRoute];
        return isRoleSufficient(role, requiredRole);
    }

    // Default: allow guest access to unknown routes (they'll be handled by 404)
    return true;
};

/**
 * Check if a user role is sufficient for a required role
 * @param {string} userRole - The user's current role
 * @param {string} requiredRole - The required role for access
 * @returns {boolean} True if user role is sufficient
 */
const isRoleSufficient = (userRole, requiredRole) => {
    const roleHierarchy = {
        [UserRole.GUEST]: 0,
        [UserRole.USER]: 1,
        [UserRole.ADMIN]: 2
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Get the minimum required role for a route
 * @param {string} path - The route path
 * @returns {string} The minimum required role
 */
export const getRequiredRole = (path) => {
    const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');

    // Check exact match
    if (routePermissions[normalizedPath]) {
        return routePermissions[normalizedPath];
    }

    // Check for admin routes
    if (normalizedPath.startsWith('/admin')) {
        return UserRole.ADMIN;
    }

    // Check for partial matches
    const matchingRoute = Object.keys(routePermissions).find(route => {
        if (route === '/') return false;
        return normalizedPath.startsWith(route);
    });

    if (matchingRoute) {
        return routePermissions[matchingRoute];
    }

    // Default to guest for unknown routes
    return UserRole.GUEST;
};

/**
 * Get all permissions for a role
 * @param {string} role - The user role
 * @returns {Object} Object containing all permissions for the role
 */
export const getPermissionsForRole = (role) => {
    return rolePermissions[role] || rolePermissions.guest;
};
