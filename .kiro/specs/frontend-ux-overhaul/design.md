# Design Document

## Overview

This design document outlines the comprehensive frontend architecture overhaul for the PSDAHS Alumni application. The solution eliminates the dual authentication state management (Redux + Context), implements proper modal-based authentication UI, establishes a robust role-based access control system, and ensures consistent UI behavior across all components.

### Key Design Principles

1. **Single Source of Truth**: Redux Toolkit as the sole state management solution for authentication
2. **Component Separation**: Clear boundaries between layout, page, and modal components
3. **Role-Based Architecture**: Explicit role system (guest, user, admin) with centralized permission logic
4. **User Experience First**: Seamless authentication flows with proper loading and error states
5. **Maintainability**: Reusable components and centralized configuration

## Architecture

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Navbar   │  │   Pages    │  │   Modals   │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│                   ┌──────▼──────┐                            │
│                   │  useSelector │                            │
│                   │  useDispatch │                            │
│                   └──────┬──────┘                            │
│                          │                                    │
│         ┌────────────────▼────────────────┐                  │
│         │      Redux Store (authSlice)     │                  │
│         │  - user                          │                  │
│         │  - token                         │                  │
│         │  - role (guest/user/admin)       │                  │
│         │  - isAuthenticated               │                  │
│         │  - status (idle/loading/error)   │                  │
│         └────────────────┬────────────────┘                  │
│                          │                                    │
│         ┌────────────────▼────────────────┐                  │
│         │      authService (API Layer)     │                  │
│         │  - login()                       │                  │
│         │  - register()                    │                  │
│         │  - getMe()                       │                  │
│         │  - logout()                      │                  │
│         └────────────────┬────────────────┘                  │
│                          │                                    │
│         ┌────────────────▼────────────────┐                  │
│         │      Backend API                 │                  │
│         └──────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App.js
├── AuthInitializer (new component)
│   └── Validates token on mount
├── Layout
│   ├── Navbar (refactored)
│   │   └── Role-based navigation rendering
│   └── Outlet (page content)
├── AuthModal (new component)
│   ├── LoginForm (extracted)
│   └── RegisterForm (extracted)
├── ProtectedRoute (enhanced)
│   └── Role-based route protection
└── Routes
    ├── Public Routes (guest accessible)
    ├── User Routes (user + admin)
    └── Admin Routes (admin only)
```

## Components and Interfaces

### 1. Enhanced authSlice (Redux)

**Location**: `frontend/src/features/auth/authSlice.js`

**State Shape**:
```javascript
{
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    role: 'guest' | 'user' | 'admin',
    isAdmin: boolean, // kept for backward compatibility
    graduationYear: number,
    profilePicture: string,
    // ... other user fields
  } | null,
  token: string | null,
  role: 'guest' | 'user' | 'admin',
  isAuthenticated: boolean,
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null,
  isInitialized: boolean
}
```

**Actions**:
- `initializeAuth()` - Async thunk to validate token on app load
- `loginUser()` - Async thunk for login
- `registerUser()` - Async thunk for registration
- `logoutUser()` - Sync action to clear auth state
- `setAuthError()` - Sync action to set error messages
- `clearAuthError()` - Sync action to clear errors

**Selectors**:
- `selectUser` - Get current user object
- `selectRole` - Get current role (guest/user/admin)
- `selectIsAuthenticated` - Boolean authentication status
- `selectIsAdmin` - Boolean admin status
- `selectAuthStatus` - Loading status
- `selectAuthError` - Error message
- `selectIsInitialized` - Whether auth has been initialized

### 2. AuthModal Component

**Location**: `frontend/src/components/auth/AuthModal.js`

**Purpose**: Centralized modal for login and registration

**Props**:
```typescript
interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  redirectAfterAuth?: string;
}
```

**Features**:
- Tab switching between login and register
- Form validation with Formik + Yup
- Loading states during authentication
- Error display
- Google OAuth integration
- Keyboard navigation (ESC to close)
- Click outside to close
- Accessibility attributes (ARIA labels)

**State Management**:
```javascript
const [mode, setMode] = useState('login'); // 'login' or 'register'
const dispatch = useDispatch();
const authStatus = useSelector(selectAuthStatus);
const authError = useSelector(selectAuthError);
```

### 3. LoginForm Component (Refactored from LoginPage)

**Location**: `frontend/src/components/auth/LoginForm.js`

**Purpose**: Extracted login form content from existing LoginPage for use in AuthModal

**Props**:
```typescript
interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}
```

**Fields**:
- Email (validated)
- Password (with show/hide toggle)
- Remember me checkbox
- Forgot password link

### 4. RegisterForm Component (Refactored from RegisterPage)

**Location**: `frontend/src/components/auth/RegisterForm.js`

**Purpose**: Extracted registration form content from existing RegisterPage for use in AuthModal

**Props**:
```typescript
interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}
```

**Fields**:
- First Name
- Last Name
- Email
- Password (with strength indicator)
- Confirm Password
- Graduation Year
- Terms acceptance checkbox

### 5. Refactored Navbar Component

**Location**: `frontend/src/components/layout/Navbar.js`

**Key Changes**:
- Remove `useAuth()` hook (Context API)
- Use Redux selectors: `useSelector(selectUser)`, `useSelector(selectRole)`
- Implement role-based navigation configuration
- Add `onLoginClick` and `onSignUpClick` handlers to open AuthModal
- Remove direct navigation to /login and /register routes

**Navigation Configuration**:
```javascript
const navigationConfig = {
  guest: [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Events', path: '/events', icon: <EmojiEvents /> },
    { text: 'About', path: '/about', icon: <Info /> },
    { text: 'Contact', path: '/contact', icon: <ContactMail /> },
  ],
  user: [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { text: 'Alumni', path: '/alumni', icon: <PeopleAlt /> },
    { text: 'Events', path: '/events', icon: <EmojiEvents /> },
    { text: 'Community', path: '/community', icon: <Forum /> },
    { text: 'Gallery', path: '/gallery', icon: <Image /> },
    { text: 'Contact', path: '/contact', icon: <ContactMail /> },
  ],
  admin: [
    // All user items plus:
    { text: 'Admin', path: '/admin', icon: <AdminPanel /> },
  ]
};
```

### 6. Enhanced ProtectedRoute Component

**Location**: `frontend/src/components/auth/ProtectedRoute.js`

**Purpose**: Route protection with role-based access control

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
}
```

**Logic**:
```javascript
const ProtectedRoute = ({ children, requiredRole = 'user', fallbackPath = '/' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const isInitialized = useSelector(selectIsInitialized);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Show auth modal instead of redirecting
    return (
      <>
        <Navigate to="/" replace />
        <AuthModal 
          open={true} 
          onClose={() => {}} 
          redirectAfterAuth={window.location.pathname}
        />
      </>
    );
  }

  // Check role permissions
  if (requiredRole === 'admin' && userRole !== 'admin') {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};
```

### 7. AuthInitializer Component

**Location**: `frontend/src/components/auth/AuthInitializer.js`

**Purpose**: Initialize authentication state on app load

**Implementation**:
```javascript
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return children;
};
```

### 8. useAuthModal Hook

**Location**: `frontend/src/hooks/useAuthModal.js`

**Purpose**: Centralized modal state management

**Interface**:
```javascript
const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [redirectPath, setRedirectPath] = useState(null);

  const openLogin = (redirect) => {
    setMode('login');
    setRedirectPath(redirect);
    setIsOpen(true);
  };

  const openRegister = (redirect) => {
    setMode('register');
    setRedirectPath(redirect);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setRedirectPath(null);
  };

  return { isOpen, mode, redirectPath, openLogin, openRegister, close };
};
```

## Data Models

### User Role Enum

```javascript
const UserRole = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin'
};
```

### Role Permissions Matrix

```javascript
const rolePermissions = {
  guest: {
    canViewPublicPages: true,
    canViewEvents: true,
    canViewAbout: true,
    canAuthenticate: true,
  },
  user: {
    ...guestPermissions,
    canViewDashboard: true,
    canViewAlumni: true,
    canViewAnnouncements: true,
    canDonate: true,
    canUpdateProfile: true,
    canRegisterForEvents: true,
  },
  admin: {
    ...userPermissions,
    canAccessAdminPanel: true,
    canManageUsers: true,
    canManageEvents: true,
    canManageAnnouncements: true,
    canManageClasses: true,
    canViewAnalytics: true,
  }
};
```

### Auth State Transitions

```
┌─────────┐
│  GUEST  │ ◄─── Initial state (not authenticated)
└────┬────┘
     │
     │ login() / register()
     ▼
┌─────────┐
│  USER   │ ◄─── Authenticated user
└────┬────┘
     │
     │ (if isAdmin === true)
     ▼
┌─────────┐
│  ADMIN  │ ◄─── Authenticated admin
└────┬────┘
     │
     │ logout()
     ▼
┌─────────┐
│  GUEST  │
└─────────┘
```

## Error Handling

### Error Types and Handling Strategy

1. **Network Errors**
   - Display: "Unable to connect. Please check your internet connection."
   - Action: Provide retry button
   - Logging: Console error with full error object

2. **Authentication Errors (401)**
   - Display: "Invalid email or password"
   - Action: Clear form, allow retry
   - Logging: Log attempt (without sensitive data)

3. **Authorization Errors (403)**
   - Display: "You don't have permission to access this resource"
   - Action: Redirect to appropriate page based on role
   - Logging: Log unauthorized access attempt

4. **Validation Errors (400)**
   - Display: Field-specific error messages
   - Action: Highlight invalid fields
   - Logging: Log validation failure

5. **Token Expiration**
   - Display: "Your session has expired. Please log in again."
   - Action: Show login modal automatically
   - Logging: Log session expiration

6. **Server Errors (500)**
   - Display: "Something went wrong. Please try again later."
   - Action: Provide retry button, suggest contacting support
   - Logging: Log full error with stack trace

### Error Display Component

**Location**: `frontend/src/components/common/ErrorAlert.js`

```javascript
const ErrorAlert = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;
  
  return (
    <Alert 
      severity="error" 
      onClose={onDismiss}
      action={onRetry && (
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      )}
    >
      {error}
    </Alert>
  );
};
```

## Testing Strategy

### Unit Tests

1. **authSlice Tests**
   - Test all reducers
   - Test all async thunks
   - Test all selectors
   - Test state transitions
   - Test error handling

2. **Component Tests**
   - AuthModal: rendering, mode switching, form submission
   - LoginForm: validation, submission, error display
   - RegisterForm: validation, submission, password strength
   - Navbar: role-based rendering, modal triggering
   - ProtectedRoute: access control, redirects

3. **Hook Tests**
   - useAuthModal: state management, modal control

### Integration Tests

1. **Authentication Flow**
   - Complete login flow from modal to dashboard
   - Complete registration flow
   - Logout flow
   - Session restoration on page reload

2. **Role-Based Access**
   - Guest attempting to access protected routes
   - User attempting to access admin routes
   - Admin accessing all routes

3. **Modal Behavior**
   - Opening modal from navbar
   - Closing modal with ESC key
   - Closing modal by clicking outside
   - Staying on current page after auth

### E2E Tests (Recommended)

1. User registers, logs in, navigates to dashboard
2. Admin logs in, accesses admin panel
3. Session expiration and re-authentication
4. Unauthorized access attempts

## Migration Strategy

### Phase 1: Preparation (No Breaking Changes)

1. Create new AuthModal component
2. Create new LoginForm and RegisterForm components
3. Create AuthInitializer component
4. Create useAuthModal hook
5. Enhance authSlice with new actions and selectors

### Phase 2: Integration (Parallel Systems)

1. Wrap App with AuthInitializer
2. Add AuthModal to App.js (controlled by global state)
3. Update Navbar to use Redux selectors (keep Context as fallback)
4. Test both systems working in parallel

### Phase 3: Migration (Switch to New System)

1. Remove AuthContext and AuthProvider
2. Remove /login and /register routes (keep page files as reference)
3. Update all components using useAuth() to use Redux selectors
4. Update ProtectedRoute to trigger AuthModal instead of redirecting
5. Optionally remove old LoginPage and RegisterPage components after confirming modal works

### Phase 4: Cleanup

1. Remove unused Context files
2. Remove unused page components
3. Update documentation
4. Run full test suite

## Performance Considerations

1. **Code Splitting**: Lazy load AuthModal to reduce initial bundle size
2. **Memoization**: Use React.memo for LoginForm and RegisterForm
3. **Selector Optimization**: Use reselect for complex selectors
4. **Token Validation**: Debounce token validation on app load
5. **Modal Rendering**: Only render modal when open

## Accessibility

1. **Keyboard Navigation**: Full keyboard support in modals
2. **Screen Readers**: Proper ARIA labels and roles
3. **Focus Management**: Trap focus in modal, restore on close
4. **Error Announcements**: Use aria-live for error messages
5. **Color Contrast**: Ensure WCAG AA compliance

## Security Considerations

1. **Token Storage**: Continue using localStorage (consider httpOnly cookies for future)
2. **XSS Protection**: Sanitize all user inputs
3. **CSRF Protection**: Include CSRF tokens in state-changing requests
4. **Password Handling**: Never log or expose passwords
5. **Role Verification**: Always verify roles on backend, frontend is for UX only

## Backward Compatibility

- Keep `isAdmin` field in user object for existing code
- Maintain existing API contracts
- Provide migration guide for custom components
- Support gradual migration of existing pages
