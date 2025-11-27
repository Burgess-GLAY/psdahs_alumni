import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole, selectIsInitialized } from '../../features/auth/authSlice';
import LoadingScreen from '../common/LoadingScreen';
import { useAuthModalContext } from '../../contexts/AuthModalContext';
import { canAccessRoute } from '../../config/permissions';
import { AuthNotifications } from '../../utils/notifications';

const ProtectedRoute = ({ children, requiredRole = 'user', fallbackPath = '/' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const isInitialized = useSelector(selectIsInitialized);
  const location = useLocation();
  const { openLogin } = useAuthModalContext();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS

  // Debug logging for admin access
  useEffect(() => {
    if (requiredRole === 'admin') {
      console.log('[ProtectedRoute] Admin route access check:', {
        path: location.pathname,
        isAuthenticated,
        userRole,
        requiredRole,
        isInitialized,
        timestamp: new Date().toISOString(),
      });
    }
  }, [location.pathname, isAuthenticated, userRole, requiredRole, isInitialized]);

  // If not authenticated, trigger AuthModal and redirect to home
  useEffect(() => {
    if (!isAuthenticated && isInitialized) {
      console.log('[ProtectedRoute] User not authenticated, opening login modal for:', location.pathname);
      // Trigger the auth modal to open with the current location for redirect after auth
      openLogin(location.pathname);
    }
  }, [isAuthenticated, isInitialized, location.pathname, openLogin]);

  // NOW WE CAN DO CONDITIONAL RETURNS

  // Show loading screen while auth is being initialized
  if (!isInitialized) {
    console.log('[ProtectedRoute] Auth not initialized, showing loading screen');
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting unauthenticated user to home, modal will open');
    // Redirect to home page while modal opens
    // The modal will handle redirecting back to the protected route after successful auth
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role permissions using centralized permission system
  if (requiredRole === 'admin' && userRole !== 'admin') {
    console.warn('[ProtectedRoute] Admin access denied:', {
      path: location.pathname,
      userRole,
      requiredRole: 'admin',
      message: 'User does not have admin role',
    });

    // Show unauthorized access notification
    AuthNotifications.unauthorizedAccess();

    // User doesn't have admin role, redirect to fallback
    return <Navigate to={fallbackPath} replace />;
  }

  // Additional check: verify user can access the current route
  if (!canAccessRoute(userRole, location.pathname)) {
    console.warn('[ProtectedRoute] Route access denied:', {
      path: location.pathname,
      userRole,
      requiredRole,
      message: 'User does not have permission for this route',
    });

    // Show unauthorized access notification
    AuthNotifications.unauthorizedAccess();

    // User doesn't have permission for this route
    return <Navigate to={fallbackPath} replace />;
  }

  console.log('[ProtectedRoute] Access granted:', {
    path: location.pathname,
    userRole,
    requiredRole,
  });

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;
