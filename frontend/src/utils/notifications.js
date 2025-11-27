/**
 * Notification Utility
 * 
 * Provides a centralized way to show toast notifications using notistack.
 * Includes pre-configured notification types for common scenarios.
 * 
 * Note: This module uses a singleton pattern to store the enqueueSnackbar function
 * which is set up by the SnackbarProvider in the App component.
 */

let enqueueSnackbarRef = null;

/**
 * Sets the enqueueSnackbar function reference
 * This should be called once when the app initializes with SnackbarProvider
 * @param {Function} enqueueSnackbarFn - The enqueueSnackbar function from useSnackbar hook
 */
export const setEnqueueSnackbar = (enqueueSnackbarFn) => {
    enqueueSnackbarRef = enqueueSnackbarFn;
};

/**
 * Gets the enqueueSnackbar function
 * @returns {Function} The enqueueSnackbar function
 */
const getEnqueueSnackbar = () => {
    if (!enqueueSnackbarRef) {
        console.warn('enqueueSnackbar is not initialized. Make sure SnackbarProvider is set up.');
        return () => { }; // Return no-op function
    }
    return enqueueSnackbarRef;
};

/**
 * Notification types and their default configurations
 */
const NotificationTypes = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

/**
 * Default notification options
 */
const defaultOptions = {
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
    },
    autoHideDuration: 5000,
    preventDuplicate: true,
};

/**
 * Shows a success notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional notistack options
 */
export const showSuccess = (message, options = {}) => {
    const enqueueSnackbar = getEnqueueSnackbar();
    enqueueSnackbar(message, {
        ...defaultOptions,
        variant: NotificationTypes.SUCCESS,
        ...options,
    });
};

/**
 * Shows an error notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional notistack options
 */
export const showError = (message, options = {}) => {
    const enqueueSnackbar = getEnqueueSnackbar();
    enqueueSnackbar(message, {
        ...defaultOptions,
        variant: NotificationTypes.ERROR,
        autoHideDuration: 7000, // Errors stay longer
        ...options,
    });
};

/**
 * Shows a warning notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional notistack options
 */
export const showWarning = (message, options = {}) => {
    const enqueueSnackbar = getEnqueueSnackbar();
    enqueueSnackbar(message, {
        ...defaultOptions,
        variant: NotificationTypes.WARNING,
        autoHideDuration: 6000,
        ...options,
    });
};

/**
 * Shows an info notification
 * @param {string} message - The message to display
 * @param {Object} options - Additional notistack options
 */
export const showInfo = (message, options = {}) => {
    const enqueueSnackbar = getEnqueueSnackbar();
    enqueueSnackbar(message, {
        ...defaultOptions,
        variant: NotificationTypes.INFO,
        ...options,
    });
};

/**
 * Pre-configured notifications for common authentication scenarios
 */
export const AuthNotifications = {
    /**
     * Shows a success notification for successful login
     * @param {string} userName - The user's name (optional)
     */
    loginSuccess: (userName) => {
        const message = userName
            ? `Welcome back, ${userName}!`
            : 'Successfully logged in!';
        showSuccess(message);
    },

    /**
     * Shows a success notification for successful registration
     * @param {string} userName - The user's name (optional)
     */
    registrationSuccess: (userName) => {
        const message = userName
            ? `Welcome to PSDAHS Alumni, ${userName}!`
            : 'Registration successful! Welcome to PSDAHS Alumni!';
        showSuccess(message, { autoHideDuration: 6000 });
    },

    /**
     * Shows a notification for session expiration
     */
    sessionExpired: () => {
        showWarning('Your session has expired. Please log in again to continue.', {
            autoHideDuration: 8000,
        });
    },

    /**
     * Shows a notification for unauthorized access
     */
    unauthorizedAccess: () => {
        showError('You do not have permission to access this resource.', {
            autoHideDuration: 6000,
        });
    },

    /**
     * Shows a notification for successful logout
     */
    logoutSuccess: () => {
        showInfo('You have been logged out successfully.');
    },

    /**
     * Shows a notification for invalid credentials
     */
    invalidCredentials: () => {
        showError('Invalid email or password. Please try again.');
    },

    /**
     * Shows a notification for network errors
     */
    networkError: () => {
        showError('Unable to connect to the server. Please check your internet connection.', {
            autoHideDuration: 8000,
        });
    },

    /**
     * Shows a notification for server errors
     */
    serverError: () => {
        showError('Something went wrong on our end. Please try again later.', {
            autoHideDuration: 7000,
        });
    },

    /**
     * Shows a notification for email already exists
     */
    emailExists: () => {
        showError('An account with this email already exists. Please use a different email or try logging in.');
    },

    /**
     * Shows a notification for profile update success
     */
    profileUpdateSuccess: () => {
        showSuccess('Your profile has been updated successfully!');
    },

    /**
     * Shows a notification for password change success
     */
    passwordChangeSuccess: () => {
        showSuccess('Your password has been changed successfully!');
    },
};

/**
 * Pre-configured notifications for admin actions
 */
export const AdminNotifications = {
    /**
     * Shows a success notification for creating a resource
     * @param {string} resourceType - The type of resource (e.g., 'user', 'event')
     */
    createSuccess: (resourceType) => {
        showSuccess(`${resourceType} created successfully!`);
    },

    /**
     * Shows a success notification for updating a resource
     * @param {string} resourceType - The type of resource (e.g., 'user', 'event')
     */
    updateSuccess: (resourceType) => {
        showSuccess(`${resourceType} updated successfully!`);
    },

    /**
     * Shows a success notification for deleting a resource
     * @param {string} resourceType - The type of resource (e.g., 'user', 'event')
     */
    deleteSuccess: (resourceType) => {
        showSuccess(`${resourceType} deleted successfully!`);
    },

    /**
     * Shows a warning notification for delete confirmation
     * @param {string} resourceType - The type of resource (e.g., 'user', 'event')
     */
    deleteWarning: (resourceType) => {
        showWarning(`Are you sure you want to delete this ${resourceType}?`);
    },
};

/**
 * Pre-configured notifications for general app actions
 */
export const AppNotifications = {
    /**
     * Shows a success notification for saving data
     */
    saveSuccess: () => {
        showSuccess('Changes saved successfully!');
    },

    /**
     * Shows an error notification for save failure
     */
    saveError: () => {
        showError('Failed to save changes. Please try again.');
    },

    /**
     * Shows a notification for copying to clipboard
     */
    copiedToClipboard: () => {
        showInfo('Copied to clipboard!', { autoHideDuration: 2000 });
    },

    /**
     * Shows a notification for form validation errors
     */
    validationError: () => {
        showError('Please fix the errors in the form before submitting.');
    },

    /**
     * Shows a notification for required fields
     */
    requiredFields: () => {
        showWarning('Please fill in all required fields.');
    },
};

/**
 * Pre-configured notifications for class group actions
 */
export const ClassGroupNotifications = {
    /**
     * Shows a welcome notification after registration with assigned class group
     * @param {string} classGroupName - The name of the assigned class group (e.g., "Class of 2020/21")
     * @param {string} classGroupId - The ID of the class group for linking
     */
    registrationWelcome: (classGroupName, classGroupId) => {
        const message = classGroupId
            ? `Welcome! You've been added to ${classGroupName}.`
            : `Welcome! You've been added to ${classGroupName}.`;
        showSuccess(message, {
            autoHideDuration: 8000,
            action: classGroupId ? (
                <a
                    href={`/classes/${classGroupId}`}
                    style={{ color: 'white', textDecoration: 'underline' }}
                >
                    View Group
                </a>
            ) : undefined
        });
    },

    /**
     * Shows a notification when auto-assignment fails but registration succeeds
     */
    registrationWithoutGroup: () => {
        showInfo('Your account has been created. A class group for your graduation year will be available soon.', {
            autoHideDuration: 7000,
        });
    },

    /**
     * Shows a success notification for joining a class group
     * @param {string} classGroupName - The name of the class group joined
     */
    joinSuccess: (classGroupName) => {
        showSuccess(`Successfully joined ${classGroupName}!`, {
            autoHideDuration: 5000,
        });
    },

    /**
     * Shows an error notification when join fails
     * @param {string} reason - Optional reason for failure
     */
    joinError: (reason) => {
        const message = reason || 'Failed to join class group. Please try again.';
        showError(message, {
            autoHideDuration: 6000,
        });
    },

    /**
     * Shows a notification when user is already a member
     */
    alreadyMember: () => {
        showInfo('You are already a member of this class group.');
    },

    /**
     * Shows a success notification for leaving a class group
     * @param {string} classGroupName - The name of the class group left
     */
    leaveSuccess: (classGroupName) => {
        showSuccess(`Successfully left ${classGroupName}.`, {
            autoHideDuration: 5000,
        });
    },

    /**
     * Shows an error notification when leave fails
     * @param {string} reason - Optional reason for failure
     */
    leaveError: (reason) => {
        const message = reason || 'Failed to leave class group. Please try again.';
        showError(message, {
            autoHideDuration: 6000,
        });
    },

    /**
     * Shows a notification when user is not a member
     */
    notMember: () => {
        showWarning('You are not a member of this class group.');
    },

    /**
     * Shows a notification for network errors during class group operations
     */
    networkError: () => {
        showError('Unable to connect to the server. Please check your internet connection and try again.', {
            autoHideDuration: 7000,
        });
    },

    /**
     * Shows a notification for server errors during class group operations
     */
    serverError: () => {
        showError('Something went wrong. Please try again later.', {
            autoHideDuration: 6000,
        });
    },

    /**
     * Shows a notification when class group data fails to load
     */
    loadError: () => {
        showError('Failed to load class groups. Please refresh the page.', {
            autoHideDuration: 6000,
        });
    },

    /**
     * Shows a notification for invalid graduation year
     */
    invalidGraduationYear: () => {
        showWarning('Please enter a valid graduation year between 2007 and 2025.');
    },
};

export default {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AuthNotifications,
    AdminNotifications,
    AppNotifications,
    ClassGroupNotifications,
};
