/**
 * Tests for permission helper functions
 * Run with: npm test permissions.test.js
 */

import {
    canAccessRoute,
    hasPermission,
    getRequiredRole,
    UserRole
} from '../permissions';

describe('Permission System', () => {
    describe('canAccessRoute', () => {
        test('guest can access public routes', () => {
            expect(canAccessRoute('guest', '/')).toBe(true);
            expect(canAccessRoute('guest', '/about')).toBe(true);
            expect(canAccessRoute('guest', '/events')).toBe(true);
        });

        test('guest cannot access user routes', () => {
            expect(canAccessRoute('guest', '/dashboard')).toBe(false);
            expect(canAccessRoute('guest', '/alumni')).toBe(false);
        });

        test('guest cannot access admin routes', () => {
            expect(canAccessRoute('guest', '/admin')).toBe(false);
            expect(canAccessRoute('guest', '/admin/users')).toBe(false);
        });

        test('user can access user routes', () => {
            expect(canAccessRoute('user', '/dashboard')).toBe(true);
            expect(canAccessRoute('user', '/alumni')).toBe(true);
            expect(canAccessRoute('user', '/community')).toBe(true);
        });

        test('user cannot access admin routes', () => {
            expect(canAccessRoute('user', '/admin')).toBe(false);
            expect(canAccessRoute('user', '/admin/users')).toBe(false);
        });

        test('admin can access all routes', () => {
            expect(canAccessRoute('admin', '/')).toBe(true);
            expect(canAccessRoute('admin', '/dashboard')).toBe(true);
            expect(canAccessRoute('admin', '/admin')).toBe(true);
            expect(canAccessRoute('admin', '/admin/users')).toBe(true);
        });

        test('handles dynamic routes correctly', () => {
            expect(canAccessRoute('user', '/events/123')).toBe(true);
            expect(canAccessRoute('guest', '/events/123')).toBe(true);
            expect(canAccessRoute('user', '/admin/events/456')).toBe(false);
            expect(canAccessRoute('admin', '/admin/events/456')).toBe(true);
        });
    });

    describe('hasPermission', () => {
        test('guest has limited permissions', () => {
            expect(hasPermission('guest', 'canViewPublicPages')).toBe(true);
            expect(hasPermission('guest', 'canViewDashboard')).toBe(false);
            expect(hasPermission('guest', 'canAccessAdminPanel')).toBe(false);
        });

        test('user has authenticated permissions', () => {
            expect(hasPermission('user', 'canViewDashboard')).toBe(true);
            expect(hasPermission('user', 'canViewAlumni')).toBe(true);
            expect(hasPermission('user', 'canAccessAdminPanel')).toBe(false);
        });

        test('admin has all permissions', () => {
            expect(hasPermission('admin', 'canViewDashboard')).toBe(true);
            expect(hasPermission('admin', 'canAccessAdminPanel')).toBe(true);
            expect(hasPermission('admin', 'canManageUsers')).toBe(true);
        });
    });

    describe('getRequiredRole', () => {
        test('returns correct role for public routes', () => {
            expect(getRequiredRole('/')).toBe(UserRole.GUEST);
            expect(getRequiredRole('/about')).toBe(UserRole.GUEST);
        });

        test('returns correct role for user routes', () => {
            expect(getRequiredRole('/dashboard')).toBe(UserRole.USER);
            expect(getRequiredRole('/alumni')).toBe(UserRole.USER);
        });

        test('returns correct role for admin routes', () => {
            expect(getRequiredRole('/admin')).toBe(UserRole.ADMIN);
            expect(getRequiredRole('/admin/users')).toBe(UserRole.ADMIN);
        });
    });
});
