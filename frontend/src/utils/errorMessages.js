/**
 * Error Message Mapping Utility
 * 
 * Maps backend error messages and error codes to user-friendly messages
 * for display in the UI.
 */

// Error type constants
export const ErrorTypes = {
    NETWORK: 'NETWORK_ERROR',
    AUTHENTICATION: 'AUTH_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    SERVER: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
};

// User-friendly error messages
const errorMessages = {
    // Network errors
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
    TIMEOUT_ERROR: 'The request took too long. Please try again.',

    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
    USER_NOT_FOUND: 'No account found with this email address.',
    INVALID_TOKEN: 'Your session is invalid. Please log in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',

    // Registration errors
    EMAIL_EXISTS: 'An account with this email already exists. Please use a different email or try logging in.',
    WEAK_PASSWORD: 'Password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and special characters.',
    INVALID_EMAIL: 'Please enter a valid email address.',

    // Validation errors
    MISSING_FIELDS: 'Please fill in all required fields.',
    INVALID_INPUT: 'Some of the information you entered is invalid. Please check and try again.',

    // Authorization errors
    UNAUTHORIZED: 'You do not have permission to access this resource.',
    FORBIDDEN: 'Access to this resource is forbidden.',

    // Server errors
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again in a few moments.',

    // Generic fallback
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Determines the error type based on the error object
 * @param {Error} error - The error object
 * @returns {string} The error type constant
 */
export const getErrorType = (error) => {
    // Network errors
    if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
        return ErrorTypes.NETWORK;
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return ErrorTypes.NETWORK;
    }

    // HTTP status code based errors
    if (error.response) {
        const status = error.response.status;

        if (status === 401) {
            return ErrorTypes.AUTHENTICATION;
        }

        if (status === 403) {
            return ErrorTypes.AUTHORIZATION;
        }

        if (status === 400 || status === 422) {
            return ErrorTypes.VALIDATION;
        }

        if (status >= 500) {
            return ErrorTypes.SERVER;
        }
    }

    return ErrorTypes.UNKNOWN;
};

/**
 * Maps backend error messages to user-friendly messages
 * @param {Error} error - The error object from axios or other source
 * @returns {string} User-friendly error message
 */
export const mapErrorToMessage = (error) => {
    // If error is already a string, return it
    if (typeof error === 'string') {
        return error;
    }

    // Network errors
    if (!error.response) {
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
            return errorMessages.NETWORK_ERROR;
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return errorMessages.TIMEOUT_ERROR;
        }
    }

    // Extract backend error message
    const backendMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg;

    // Map specific backend messages to user-friendly messages
    if (backendMessage) {
        const lowerMessage = backendMessage.toLowerCase();

        // Authentication errors
        if (lowerMessage.includes('invalid credentials') ||
            lowerMessage.includes('invalid email or password')) {
            return errorMessages.INVALID_CREDENTIALS;
        }

        if (lowerMessage.includes('user not found') ||
            lowerMessage.includes('no user found')) {
            return errorMessages.USER_NOT_FOUND;
        }

        if (lowerMessage.includes('invalid token')) {
            return errorMessages.INVALID_TOKEN;
        }

        if (lowerMessage.includes('token expired') ||
            lowerMessage.includes('session expired')) {
            return errorMessages.TOKEN_EXPIRED;
        }

        // Registration errors
        if (lowerMessage.includes('email already exists') ||
            lowerMessage.includes('user already exists') ||
            lowerMessage.includes('email is already registered')) {
            return errorMessages.EMAIL_EXISTS;
        }

        if (lowerMessage.includes('password') &&
            (lowerMessage.includes('weak') || lowerMessage.includes('strength'))) {
            return errorMessages.WEAK_PASSWORD;
        }

        if (lowerMessage.includes('invalid email')) {
            return errorMessages.INVALID_EMAIL;
        }

        // If backend message is clear and user-friendly, use it
        if (backendMessage.length < 200 && !backendMessage.includes('Error:')) {
            return backendMessage;
        }
    }

    // HTTP status code based messages
    if (error.response) {
        const status = error.response.status;

        if (status === 401) {
            return errorMessages.INVALID_CREDENTIALS;
        }

        if (status === 403) {
            return errorMessages.UNAUTHORIZED;
        }

        if (status === 400 || status === 422) {
            return errorMessages.INVALID_INPUT;
        }

        if (status === 503) {
            return errorMessages.SERVICE_UNAVAILABLE;
        }

        if (status >= 500) {
            return errorMessages.SERVER_ERROR;
        }
    }

    // Fallback to generic error message
    return errorMessages.UNKNOWN_ERROR;
};

/**
 * Checks if an error is retryable (network or server errors)
 * @param {Error} error - The error object
 * @returns {boolean} True if the error is retryable
 */
export const isRetryableError = (error) => {
    const errorType = getErrorType(error);

    // Network errors and server errors are retryable
    if (errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.SERVER) {
        return true;
    }

    // 503 Service Unavailable is retryable
    if (error.response?.status === 503) {
        return true;
    }

    return false;
};

/**
 * Logs error details for debugging
 * @param {string} context - Context where the error occurred (e.g., 'login', 'register')
 * @param {Error} error - The error object
 * @param {Object} additionalInfo - Additional information to log
 */
export const logError = (context, error, additionalInfo = {}) => {
    const errorType = getErrorType(error);
    const userMessage = mapErrorToMessage(error);

    console.error(`[${context}] Error occurred:`, {
        type: errorType,
        userMessage,
        originalError: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        ...additionalInfo,
    });

    // Log stack trace for debugging
    if (error.stack) {
        console.error(`[${context}] Stack trace:`, error.stack);
    }
};

export default {
    ErrorTypes,
    mapErrorToMessage,
    getErrorType,
    isRetryableError,
    logError,
};
