import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { mapErrorToMessage, logError } from '../../utils/errorMessages';
import { AuthNotifications } from '../../utils/notifications';

// Helper function to determine role from user data
const getUserRole = (user) => {
  if (!user) return 'guest';
  return user.isAdmin ? 'admin' : 'user';
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[authSlice] No token found in localStorage');
        return { user: null, token: null };
      }

      console.log('[authSlice] Token found, fetching user data...');
      // Validate token by fetching current user (includes profilePicture)
      const user = await authService.getMe();

      // Log for debugging profile picture
      console.log('[authSlice] User fetched on init:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasProfilePicture: !!user.profilePicture,
        profilePicture: user.profilePicture
      });

      return { user, token };
    } catch (error) {
      // Log error for debugging (but don't show to user during initialization)
      logError('initializeAuth', error, {
        action: 'Token validation failed during app initialization'
      });

      // Token is invalid, clear it
      localStorage.removeItem('token');
      return { user: null, token: null };
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);

      // Log for debugging profile picture
      console.log('[authSlice] Login response:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        userId: response.user?.id,
        email: response.user?.email,
        hasProfilePicture: !!response.user?.profilePicture,
        profilePicture: response.user?.profilePicture
      });

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      return response;
    } catch (error) {
      // Log error for debugging
      logError('loginUser', error, {
        email, // Log email (not password) for debugging
        action: 'User login attempt failed'
      });

      // Map error to user-friendly message
      const userMessage = mapErrorToMessage(error);
      return rejectWithValue(userMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      return response;
    } catch (error) {
      // Log error for debugging (exclude sensitive data like password)
      const { password, ...safeUserData } = userData;
      logError('registerUser', error, {
        userData: safeUserData,
        action: 'User registration attempt failed'
      });

      // Map error to user-friendly message
      const userMessage = mapErrorToMessage(error);
      return rejectWithValue(userMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response;
    } catch (error) {
      // Log error for debugging
      logError('getCurrentUser', error, {
        action: 'Failed to fetch current user data'
      });

      // Map error to user-friendly message
      const userMessage = mapErrorToMessage(error);
      return rejectWithValue(userMessage);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: 'guest',
  isAuthenticated: false,
  isAdmin: false,
  isInitialized: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = getUserRole(user);
      state.isAuthenticated = true;
      state.isAdmin = user?.isAdmin || false;
      state.error = null;
    },
    logoutUser: (state) => {
      console.log('[authSlice] Logging out user, clearing profile picture from state');
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('token');

      // Show logout notification
      AuthNotifications.logoutSuccess();
    },
    logout: (state) => {
      // Keep for backward compatibility
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearError: (state) => {
      // Keep for backward compatibility
      state.error = null;
    },
    sessionExpired: (state) => {
      // Handle session expiration
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = 'Your session has expired. Please log in again.';
      // Clear localStorage
      localStorage.removeItem('token');

      // Show session expiration notification
      AuthNotifications.sessionExpired();
    },
    updateUser: (state, action) => {
      // Update user data in state (e.g., after profile update)
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.status = 'loading';
      state.isInitialized = false;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = getUserRole(action.payload.user);
      state.isAuthenticated = !!action.payload.user;
      state.isAdmin = action.payload.user?.isAdmin || false;
      state.isInitialized = true;
      state.error = null;
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.status = 'failed';
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isInitialized = true;
      state.error = null;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = getUserRole(action.payload.user);
      state.isAuthenticated = true;
      state.isAdmin = action.payload.user?.isAdmin || false;
      state.error = null;

      // Show success notification
      const userName = action.payload.user?.firstName || action.payload.user?.email;
      AuthNotifications.loginSuccess(userName);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Login failed';

      // Show error notification
      if (action.payload) {
        // Error message is already user-friendly from mapErrorToMessage
        // No need to show notification here as it will be displayed in the form
      }
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = getUserRole(action.payload.user);
      state.isAuthenticated = true;
      state.isAdmin = action.payload.user?.isAdmin || false;
      state.error = null;

      // Show success notification
      const userName = action.payload.user?.firstName || action.payload.user?.email;
      AuthNotifications.registrationSuccess(userName);
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Registration failed';

      // Show error notification
      if (action.payload) {
        // Error message is already user-friendly from mapErrorToMessage
        // No need to show notification here as it will be displayed in the form
      }
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.role = getUserRole(action.payload);
      state.isAuthenticated = true;
      state.isAdmin = action.payload?.isAdmin || false;
      state.error = null;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.status = 'failed';
      state.user = null;
      state.token = null;
      state.role = 'guest';
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.error = action.payload || 'Failed to load user';
    });
  },
});

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.isAdmin;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

// Actions
export const { login, logout, logoutUser, setAuthError, clearAuthError, clearError, sessionExpired, updateUser } = authSlice.actions;

export default authSlice.reducer;
