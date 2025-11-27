# Notification System Documentation

## Overview

The PSDAHS Alumni application uses **notistack** for displaying toast notifications to users. The notification system provides a centralized way to show success messages, errors, warnings, and informational messages throughout the application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Components │  │   Redux    │  │  Services  │            │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│                   ┌──────▼──────┐                            │
│                   │ notifications│                            │
│                   │   utility    │                            │
│                   └──────┬──────┘                            │
│                          │                                    │
│                   ┌──────▼──────┐                            │
│                   │  notistack   │                            │
│                   │ (SnackbarProvider)                        │
│                   └──────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### 1. SnackbarProvider Configuration

The `SnackbarProvider` is configured in `App.js`:

```javascript
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      {/* App content */}
    </SnackbarProvider>
  );
}
```

**Configuration:**
- `maxSnack={3}`: Maximum of 3 notifications visible at once
- Older notifications are automatically dismissed when the limit is reached

### 2. Notification Utility

The notification utility (`utils/notifications.js`) provides a clean API for showing notifications:

```javascript
import { AuthNotifications, showSuccess, showError } from '../utils/notifications';

// Show a success notification
showSuccess('Operation completed successfully!');

// Show an error notification
showError('Something went wrong!');

// Use pre-configured auth notifications
AuthNotifications.loginSuccess('John');
```

## API Reference

### Basic Notification Functions

#### `showSuccess(message, options)`
Shows a success notification (green).

**Parameters:**
- `message` (string): The message to display
- `options` (object, optional): Additional notistack options

**Example:**
```javascript
showSuccess('Profile updated successfully!');
showSuccess('Saved!', { autoHideDuration: 3000 });
```

#### `showError(message, options)`
Shows an error notification (red).

**Parameters:**
- `message` (string): The message to display
- `options` (object, optional): Additional notistack options

**Example:**
```javascript
showError('Failed to save changes.');
showError('Network error', { autoHideDuration: 10000 });
```

#### `showWarning(message, options)`
Shows a warning notification (orange).

**Parameters:**
- `message` (string): The message to display
- `options` (object, optional): Additional notistack options

**Example:**
```javascript
showWarning('Your session will expire soon.');
```

#### `showInfo(message, options)`
Shows an info notification (blue).

**Parameters:**
- `message` (string): The message to display
- `options` (object, optional): Additional notistack options

**Example:**
```javascript
showInfo('New features available!');
```

### Pre-configured Notification Collections

#### AuthNotifications

Authentication-related notifications with consistent messaging.

##### `AuthNotifications.loginSuccess(userName)`
Shows a personalized welcome message after successful login.

**Example:**
```javascript
AuthNotifications.loginSuccess('John'); // "Welcome back, John!"
AuthNotifications.loginSuccess(); // "Successfully logged in!"
```

##### `AuthNotifications.registrationSuccess(userName)`
Shows a welcome message after successful registration.

**Example:**
```javascript
AuthNotifications.registrationSuccess('Jane'); // "Welcome to PSDAHS Alumni, Jane!"
```

##### `AuthNotifications.sessionExpired()`
Shows a warning when the user's session expires.

**Example:**
```javascript
AuthNotifications.sessionExpired();
// "Your session has expired. Please log in again to continue."
```

##### `AuthNotifications.unauthorizedAccess()`
Shows an error when the user tries to access a restricted resource.

**Example:**
```javascript
AuthNotifications.unauthorizedAccess();
// "You do not have permission to access this resource."
```

##### `AuthNotifications.logoutSuccess()`
Shows a confirmation message after logout.

**Example:**
```javascript
AuthNotifications.logoutSuccess();
// "You have been logged out successfully."
```

##### Other Auth Notifications
- `invalidCredentials()` - Invalid login credentials
- `networkError()` - Network connection issues
- `serverError()` - Server-side errors
- `emailExists()` - Email already registered
- `profileUpdateSuccess()` - Profile updated
- `passwordChangeSuccess()` - Password changed

#### AdminNotifications

Admin-specific notifications for CRUD operations.

##### `AdminNotifications.createSuccess(resourceType)`
Shows success message for creating a resource.

**Example:**
```javascript
AdminNotifications.createSuccess('Event'); // "Event created successfully!"
AdminNotifications.createSuccess('User'); // "User created successfully!"
```

##### `AdminNotifications.updateSuccess(resourceType)`
Shows success message for updating a resource.

**Example:**
```javascript
AdminNotifications.updateSuccess('Announcement'); // "Announcement updated successfully!"
```

##### `AdminNotifications.deleteSuccess(resourceType)`
Shows success message for deleting a resource.

**Example:**
```javascript
AdminNotifications.deleteSuccess('Class'); // "Class deleted successfully!"
```

##### `AdminNotifications.deleteWarning(resourceType)`
Shows warning before deleting a resource.

**Example:**
```javascript
AdminNotifications.deleteWarning('User'); // "Are you sure you want to delete this User?"
```

#### AppNotifications

General application notifications.

##### Common Notifications
- `saveSuccess()` - Changes saved
- `saveError()` - Failed to save
- `copiedToClipboard()` - Text copied
- `validationError()` - Form validation errors
- `requiredFields()` - Missing required fields

**Example:**
```javascript
AppNotifications.saveSuccess(); // "Changes saved successfully!"
AppNotifications.copiedToClipboard(); // "Copied to clipboard!"
```

## Usage Examples

### In Redux Thunks

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthNotifications } from '../../utils/notifications';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      
      // Show success notification
      AuthNotifications.loginSuccess(response.user.firstName);
      
      return response;
    } catch (error) {
      // Error notification can be shown here or in the component
      return rejectWithValue(error.message);
    }
  }
);
```

### In Components

```javascript
import { useDispatch } from 'react-redux';
import { showSuccess, showError } from '../utils/notifications';

const ProfilePage = () => {
  const dispatch = useDispatch();

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile. Please try again.');
    }
  };

  return (
    // Component JSX
  );
};
```

### In Protected Routes

```javascript
import { AuthNotifications } from '../../utils/notifications';

const ProtectedRoute = ({ children, requiredRole }) => {
  // ... role checking logic

  if (userRole !== requiredRole) {
    AuthNotifications.unauthorizedAccess();
    return <Navigate to="/" />;
  }

  return children;
};
```

### In Services

```javascript
import { AuthNotifications } from '../utils/notifications';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired
      AuthNotifications.sessionExpired();
      // ... handle session expiration
    }
    return Promise.reject(error);
  }
);
```

## Configuration Options

### Default Options

All notifications use these default options:

```javascript
{
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'right',
  },
  autoHideDuration: 5000, // 5 seconds
  preventDuplicate: true,
}
```

### Custom Options

You can override default options for any notification:

```javascript
showSuccess('Message', {
  autoHideDuration: 3000, // 3 seconds
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  preventDuplicate: false,
});
```

### Duration Guidelines

- **Success**: 5 seconds (default)
- **Error**: 7 seconds (longer for users to read)
- **Warning**: 6 seconds
- **Info**: 5 seconds
- **Quick actions** (e.g., copy): 2 seconds
- **Important errors**: 8-10 seconds

## Best Practices

### 1. Use Pre-configured Notifications

Prefer using pre-configured notifications for consistency:

```javascript
// Good
AuthNotifications.loginSuccess(userName);

// Avoid
showSuccess(`Welcome back, ${userName}!`);
```

### 2. Keep Messages Concise

Notifications should be brief and actionable:

```javascript
// Good
showSuccess('Profile updated!');

// Avoid
showSuccess('Your profile has been successfully updated and all changes have been saved to the database.');
```

### 3. Don't Duplicate Error Messages

If an error is already displayed in a form, don't show a notification:

```javascript
// In authSlice
builder.addCase(loginUser.rejected, (state, action) => {
  state.error = action.payload; // Error shown in form
  // Don't show notification here
});
```

### 4. Use Appropriate Severity

Choose the right notification type:

- **Success**: Completed actions (save, create, update, delete)
- **Error**: Failed operations, validation errors
- **Warning**: Session expiration, potential issues
- **Info**: General information, confirmations

### 5. Avoid Notification Spam

Use `preventDuplicate: true` (default) to avoid showing the same message multiple times:

```javascript
// This will only show once even if called multiple times
showSuccess('Saved!');
```

### 6. Consider User Context

Show notifications that make sense in the current context:

```javascript
// On protected route access
if (!isAuthenticated) {
  // Don't show notification - modal will open
  openLoginModal();
} else if (!hasPermission) {
  // Show notification - user is authenticated but lacks permission
  AuthNotifications.unauthorizedAccess();
}
```

## Testing

### Unit Tests

Test notifications using Jest mocks:

```javascript
import { enqueueSnackbar } from 'notistack';
import { AuthNotifications } from '../notifications';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

test('should show login success notification', () => {
  AuthNotifications.loginSuccess('John');

  expect(enqueueSnackbar).toHaveBeenCalledWith(
    'Welcome back, John!',
    expect.objectContaining({ variant: 'success' })
  );
});
```

### Integration Tests

Test notification behavior in components:

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';

test('should show success notification after save', async () => {
  render(
    <SnackbarProvider>
      <ProfilePage />
    </SnackbarProvider>
  );

  // Trigger save action
  fireEvent.click(screen.getByText('Save'));

  // Wait for notification
  await waitFor(() => {
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Notifications Not Showing

1. **Check SnackbarProvider**: Ensure `SnackbarProvider` wraps your app in `App.js`
2. **Check Import**: Verify you're importing from the correct path
3. **Check Console**: Look for errors in the browser console

### Duplicate Notifications

1. **Use preventDuplicate**: Ensure `preventDuplicate: true` is set (default)
2. **Check Multiple Calls**: Verify the notification isn't being called multiple times

### Notifications Disappearing Too Quickly

1. **Adjust Duration**: Use custom `autoHideDuration` option
2. **Use Appropriate Type**: Errors automatically stay longer (7 seconds)

## Related Documentation

- [Error Handling](./ERROR_HANDLING.md)
- [Session Expiration](./SESSION_EXPIRATION.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md)

## External Resources

- [Notistack Documentation](https://notistack.com/)
- [Material-UI Snackbar](https://mui.com/material-ui/react-snackbar/)
