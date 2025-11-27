# Role-Based Configuration

This directory contains centralized configuration files for role-based access control (RBAC) in the PSDAHS Alumni application.

## Files

### `roleConfig.js`
Defines navigation items visible to each user role (guest, user, admin).

**Exports:**
- `navigationConfig` - Object mapping roles to their navigation items
- `getNavigationForRole(role)` - Returns navigation items for a specific role
- `getAccessiblePaths(role)` - Returns all paths accessible by a role

**Usage in Navbar:**
```javascript
import { getNavigationForRole } from '../../config/roleConfig';

const navItems = getNavigationForRole(role);
```

### `permissions.js`
Defines granular permissions and route access rules for each role.

**Exports:**
- `UserRole` - Enum of available roles (GUEST, USER, ADMIN)
- `rolePermissions` - Permission matrix for each role
- `routePermissions` - Route-to-role mapping
- `canAccessRoute(role, path)` - Check if role can access a route
- `hasPermission(role, permission)` - Check if role has a specific permission
- `getRequiredRole(path)` - Get minimum role required for a route
- `getPermissionsForRole(role)` - Get all permissions for a role

**Usage in ProtectedRoute:**
```javascript
import { canAccessRoute } from '../../config/permissions';

if (!canAccessRoute(userRole, location.pathname)) {
  return <Navigate to={fallbackPath} replace />;
}
```

**Usage for feature flags:**
```javascript
import { hasPermission } from '../../config/permissions';

{hasPermission(role, 'canManageUsers') && (
  <Button>Manage Users</Button>
)}
```

## Role Hierarchy

1. **Guest** - Unauthenticated users
   - Can view public pages (home, about, events, contact)
   - Can authenticate and register
   - Cannot access user or admin features

2. **User** - Authenticated users
   - All guest permissions
   - Can view dashboard, alumni directory, community, gallery
   - Can update profile and register for events
   - Cannot access admin panel

3. **Admin** - Administrators
   - All user permissions
   - Can access admin panel
   - Can manage users, events, announcements, classes
   - Can view analytics

## Adding New Routes

To add a new route with role-based access:

1. **Add to `roleConfig.js`** (if it should appear in navigation):
```javascript
export const navigationConfig = {
  user: [
    // ... existing items
    { text: 'New Feature', path: '/new-feature', icon: <NewIcon /> },
  ],
};
```

2. **Add to `permissions.js`** (define access rules):
```javascript
export const routePermissions = {
  // ... existing routes
  '/new-feature': UserRole.USER,
};
```

3. **Use in component** (protect the route):
```javascript
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute requiredRole="user">
      <NewFeaturePage />
    </ProtectedRoute>
  } 
/>
```

## Adding New Permissions

To add a new permission:

1. **Add to `rolePermissions`** in `permissions.js`:
```javascript
export const rolePermissions = {
  user: {
    // ... existing permissions
    canExportData: true,
  },
  admin: {
    // ... existing permissions
    canExportData: true,
  },
};
```

2. **Use in components**:
```javascript
import { hasPermission } from '../../config/permissions';

{hasPermission(role, 'canExportData') && (
  <Button onClick={handleExport}>Export Data</Button>
)}
```

## Testing

Tests are located in `__tests__/permissions.test.js`. Run with:
```bash
npm test permissions.test.js
```

## Best Practices

1. **Always use centralized config** - Don't hardcode role checks in components
2. **Check permissions on backend** - Frontend checks are for UX only
3. **Use helper functions** - Don't access config objects directly
4. **Keep hierarchy simple** - Three roles (guest, user, admin) should be sufficient
5. **Document new permissions** - Update this README when adding new permissions
