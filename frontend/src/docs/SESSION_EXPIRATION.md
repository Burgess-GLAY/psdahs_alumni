# Session Expiration Handling

## Overview

The application now includes comprehensive session expiration handling that provides a seamless user experience when authentication tokens expire.

## How It Works

### 1. Axios Response Interceptor

The `authService.js` file includes an axios response interceptor that monitors all API responses for 401 (Unauthorized) status codes:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle session expiration
      const currentPath = window.location.pathname;
      
      // Dispatch session expired action
      if (store) {
        store.dispatch(sessionExpired());
      }
      
      // Open auth modal with preserved route
      if (authModalContext && currentPath !== '/') {
        authModalContext.openLogin(currentPath);
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. Redux Action

The `sessionExpired` action in `authSlice.js` handles the state cleanup:

- Clears user data
- Removes token from localStorage
- Sets role to 'guest'
- Sets authentication status to false
- Sets an error message: "Your session has expired. Please log in again."

### 3. User Experience Flow

When a session expires:

1. **API Request Fails**: Any API request returns a 401 status
2. **State Cleared**: Redux state is cleared and token removed from localStorage
3. **Modal Opens**: The AuthModal automatically opens in login mode
4. **Error Displayed**: The session expiration message is shown in the login form
5. **Route Preserved**: The current route is saved for redirect after re-authentication
6. **User Re-authenticates**: User logs in again
7. **Redirect**: User is redirected back to the page they were on (if allowed by their role)

### 4. Setup Requirements

The session expiration handling requires proper setup in `App.js`:

```javascript
import store from './store/store';
import { setStoreReference, setAuthModalReference } from './services/authService';

const AppContent = () => {
  const authModalContext = useAuthModalContext();
  
  useEffect(() => {
    setStoreReference(store);
    setAuthModalReference(authModalContext);
  }, [authModalContext]);
  
  // ... rest of component
};
```

## Benefits

- **Seamless UX**: Users stay on their current page and see a modal instead of being redirected
- **Clear Messaging**: Users understand why they need to log in again
- **Route Preservation**: Users are returned to their intended destination after re-authentication
- **Automatic Cleanup**: All authentication state is properly cleared
- **Consistent Behavior**: All 401 responses are handled uniformly across the application

## Testing

To test session expiration handling:

1. Log in to the application
2. Manually expire or delete the token from localStorage
3. Make any API request (e.g., navigate to a protected page)
4. Verify the AuthModal opens with the session expired message
5. Log in again and verify you're redirected to the intended page
