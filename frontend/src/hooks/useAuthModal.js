import { useState } from 'react';

/**
 * Custom hook to manage AuthModal state
 * Provides functions to open login/register modals and track redirect paths
 * 
 * @returns {Object} Modal state and control functions
 * @returns {boolean} isOpen - Whether the modal is currently open
 * @returns {string} mode - Current mode ('login' or 'register')
 * @returns {string|null} redirectPath - Path to redirect to after successful auth
 * @returns {Function} openLogin - Function to open modal in login mode
 * @returns {Function} openRegister - Function to open modal in register mode
 * @returns {Function} close - Function to close the modal
 */
const useAuthModal = () => {
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

    return {
        isOpen,
        mode,
        redirectPath,
        openLogin,
        openRegister,
        close,
    };
};

export default useAuthModal;
