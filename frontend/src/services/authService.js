import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference for dispatching actions
let store;
let authModalContext;

// Function to set the store reference (called from App.js)
export const setStoreReference = (storeInstance) => {
  store = storeInstance;
};

// Function to set the auth modal context reference (called from App.js)
export const setAuthModalReference = (modalContext) => {
  authModalContext = modalContext;
};

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle session expiration
      const currentPath = window.location.pathname;

      // Dispatch session expired action if store is available
      if (store) {
        const { sessionExpired } = require('../features/auth/authSlice');
        store.dispatch(sessionExpired());
      } else {
        // Fallback: clear localStorage manually
        localStorage.removeItem('token');
      }

      // Open auth modal with session expired message if context is available
      if (authModalContext && currentPath !== '/') {
        // Preserve current route for redirect after re-authentication
        authModalContext.openLogin(currentPath);
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Verify Google token
  verifyGoogleToken: async (token) => {
    try {
      const response = await api.post('/auth/verify-google-token', { token });
      return response.data;
    } catch (error) {
      console.error('Error verifying Google token:', error);
      throw error;
    }
  },

  // Authenticate with Google
  googleAuth: async (authData) => {
    try {
      const response = await api.post('/auth/google', authData);
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      // Preserve the original error object for better error mapping
      if (error.response) {
        error.message = error.response?.data?.message || 'Google authentication failed. Please try again.';
      } else {
        error.message = 'Google authentication failed. Please try again.';
      }
      throw error;
    }
  },

  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // Preserve the original error object for better error mapping
      if (error.response) {
        // Attach response data to error for mapping
        error.message = error.response?.data?.message ||
          error.response?.data?.error ||
          'Registration failed. Please try again.';
      } else {
        error.message = 'Registration failed. Please try again.';
      }
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Ensure the response has the expected format
      if (response.data && response.data.token) {
        // If the user object is nested in the response, flatten it
        if (response.data.user) {
          return {
            token: response.data.token,
            user: response.data.user
          };
        }
        // If user data is at the root level
        return {
          token: response.data.token,
          user: {
            id: response.data.id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            isAdmin: response.data.isAdmin || false
          }
        };
      }
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Login error:', error);
      // Preserve the original error object for better error mapping
      if (error.response) {
        // Attach response data to error for mapping
        error.message = error.response?.data?.errors?.[0]?.msg ||
          error.response?.data?.message ||
          'Login failed. Please check your credentials and try again.';
      } else if (!error.message) {
        error.message = 'Login failed. Please check your credentials and try again.';
      }
      throw error;
    }
  },

  // Get current user's data
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Preserve the original error object for better error mapping
      if (error.response) {
        error.message = error.response?.data?.message || 'Failed to fetch user data.';
      } else {
        error.message = 'Failed to fetch user data.';
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to update profile.'
      );
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password.'
      );
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to process your request.'
      );
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to reset password.'
      );
    }
  },

  // Logout user (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    // Note: You might want to call an API endpoint to invalidate the token
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
