# Error Handling Documentation

## Overview

This document describes the comprehensive error handling system implemented throughout the authentication flow in the PSDAHS Alumni application.

## Architecture

### Error Flow

```
Backend API Error
    ↓
authService (catches and preserves error)
    ↓
Redux Thunk (catches and maps error)
    ↓
Error Mapping Utility (mapErrorToMessage)
    ↓
Redux State (stores user-friendly message)
    ↓
UI Component (displays with ErrorAlert)
    ↓
User sees friendly message + retry option (if applicable)
```

## Components

### 1. Error Mapping Utility (`utils/errorMessages.js`)

Central utility for mapping backend errors to user-friendly messages.

#### Key Functions

**`mapErrorToMessage(error)`**
- Maps error objects to user-friendly messages
- Handles network errors, authentication errors, validation errors, etc.
- Returns clear, actionable messages for users

**`getErrorType(error)`**
- Determines the type of error (network, auth, validation, server, etc.)
- Used for categorizing errors and determining retry logic

**`isRetryableError(error)`**
- Determines if an error can be retried
- Network errors and server errors (500+) are retryable
- Authentication and validation errors are not retryable

**`logError(context, error, additionalInfo)`**
- Logs detailed error information for debugging
- Includes error type, user message, status codes, and stack traces
- Does not expose sensitive information

#### Error Types

- `NETWORK_ERROR`: Connection issues, timeouts
- `AUTHENTICATION`: Invalid credentials, expired tokens
- `VALIDATION`: Invalid input, missing fields
- `AUTHORIZATION`: Insufficient permissions
- `SERVER`: Backend server errors (500+)
- `UNKNOWN`: Unrecognized errors

### 2. Enhanced Redux Thunks (`features/auth/authSlice.js`)

All async thunks now include:

**Try-Catch Blocks**
```javascript
try {
  const response = await authService.login(email, password);
  return response;
} catch (error) {
  logError('loginUser', error, { email, action: 'User login attempt failed' });
  const userMessage = mapErrorToMessage(error);
  return rejectWithValue(userMessage);
}
```

**Error Logging**
- Logs all errors with context
- Includes relevant metadata (email, action, etc.)
- Excludes sensitive data (passwords)

**User-Friendly Messages**
- Maps all errors to clear messages
- Provides actionable feedback
- Maintains consistent tone

### 3. Enhanced authService (`services/authService.js`)

**Error Preservation**
- Preserves original error objects for better mapping
- Attaches response data to errors
- Maintains error context through the chain

**Example**
```javascript
catch (error) {
  if (error.response) {
    error.message = error.response?.data?.message || 'Default message';
  }
  throw error; // Preserve full error object
}
```

### 4. Form Components with Retry Logic

Both `LoginForm` and `RegisterForm` now include:

**Error State Management**
```javascript
const [lastError, setLastError] = useState(null);
const canRetry = lastError && isRetryableError(lastError);
```

**Retry Handler**
```javascript
const handleRetry = () => {
  formik.handleSubmit(); // Retry last submission
};
```

**ErrorAlert Integration**
```javascript
<ErrorAlert 
  error={authError}
  onRetry={canRetry ? handleRetry : null}
  onDismiss={handleDismissError}
/>
```

### 5. ErrorAlert Component (`components/common/ErrorAlert.js`)

Reusable component for displaying errors with optional retry functionality.

**Props**
- `error`: Error message to display
- `onRetry`: Optional callback for retry button
- `onDismiss`: Optional callback for dismiss action

**Features**
- Material-UI Alert component
- Conditional retry button
- Dismissible
- Consistent styling

## Error Message Examples

### Network Errors
- **User sees**: "Unable to connect to the server. Please check your internet connection and try again."
- **Retry**: Available
- **Logged**: Full error with network details

### Authentication Errors
- **User sees**: "Invalid email or password. Please check your credentials and try again."
- **Retry**: Not available (user needs to correct input)
- **Logged**: Email (not password), error details

### Registration Errors
- **User sees**: "An account with this email already exists. Please use a different email or try logging in."
- **Retry**: Not available
- **Logged**: User data (excluding password), error details

### Server Errors
- **User sees**: "Something went wrong on our end. Please try again later."
- **Retry**: Available
- **Logged**: Full error with status codes and response data

### Token Expiration
- **User sees**: "Your session has expired. Please log in again."
- **Retry**: Not available (handled by session expiration flow)
- **Logged**: Token validation failure details

## Testing

### Unit Tests

Run error handling tests:
```bash
npm test -- errorMessages.test.js
```

### Manual Testing Scenarios

1. **Network Error**
   - Disconnect internet
   - Try to login
   - Verify error message and retry button appear
   - Reconnect and click retry
   - Verify successful login

2. **Invalid Credentials**
   - Enter wrong password
   - Verify error message (no retry button)
   - Correct password and resubmit
   - Verify successful login

3. **Email Already Exists**
   - Try to register with existing email
   - Verify clear error message
   - Change email and retry
   - Verify successful registration

4. **Server Error**
   - Simulate 500 error from backend
   - Verify error message and retry button
   - Click retry
   - Verify retry attempt

## Best Practices

### For Developers

1. **Always use error mapping utility**
   - Don't create custom error messages in components
   - Use `mapErrorToMessage()` for consistency

2. **Log errors with context**
   - Use `logError()` with meaningful context
   - Include relevant metadata
   - Never log sensitive data (passwords, tokens)

3. **Preserve error objects**
   - Don't convert errors to strings too early
   - Pass full error objects through the chain
   - Let mapping utility extract relevant info

4. **Test error scenarios**
   - Test network errors
   - Test validation errors
   - Test server errors
   - Verify retry logic works

### For Users

1. **Read error messages carefully**
   - Messages provide specific guidance
   - Follow suggested actions

2. **Use retry button when available**
   - Retry button appears for transient errors
   - Safe to retry multiple times

3. **Contact support if errors persist**
   - Include error message in support request
   - Mention steps taken before error

## Future Enhancements

1. **Error Analytics**
   - Track error frequency
   - Identify common error patterns
   - Improve error messages based on data

2. **Offline Support**
   - Queue requests when offline
   - Retry automatically when connection restored

3. **Error Recovery**
   - Automatic retry with exponential backoff
   - Graceful degradation for non-critical errors

4. **Localization**
   - Translate error messages
   - Support multiple languages

## Related Documentation

- [Session Expiration](./SESSION_EXPIRATION.md)
- [Admin Panel Routing](./ADMIN_PANEL_ROUTING.md)
- [API Usage Guide](../../API_USAGE_GUIDE.md)
