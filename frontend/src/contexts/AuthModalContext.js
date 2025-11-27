import React, { createContext, useContext, useState } from 'react';

/**
 * Context for managing AuthModal state globally
 * This allows any component (like ProtectedRoute) to trigger the modal
 */
const AuthModalContext = createContext(null);

/**
 * Provider component that wraps the app and provides modal control functions
 */
export const AuthModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('login');
    const [redirectPath, setRedirectPath] = useState(null);

    /**
     * Open the modal in login mode
     * @param {string} redirect - Optional path to redirect to after successful login
     */
    const openLogin = (redirect = null) => {
        setMode('login');
        setRedirectPath(redirect);
        setIsOpen(true);
    };

    /**
     * Open the modal in register mode
     * @param {string} redirect - Optional path to redirect to after successful registration
     */
    const openRegister = (redirect = null) => {
        setMode('register');
        setRedirectPath(redirect);
        setIsOpen(true);
    };

    /**
     * Close the modal and clear redirect path
     */
    const close = () => {
        setIsOpen(false);
        setRedirectPath(null);
    };

    const value = {
        isOpen,
        mode,
        redirectPath,
        openLogin,
        openRegister,
        close,
    };

    return (
        <AuthModalContext.Provider value={value}>
            {children}
        </AuthModalContext.Provider>
    );
};

/**
 * Hook to access AuthModal control functions
 * @returns {Object} Modal state and control functions
 */
export const useAuthModalContext = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModalContext must be used within AuthModalProvider');
    }
    return context;
};
