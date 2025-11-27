import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    Box,
    Tabs,
    Tab,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { clearAuthError, selectRole, selectIsAuthenticated } from '../../features/auth/authSlice';
import { canAccessRoute } from '../../config/permissions';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({
    open,
    onClose,
    defaultMode = 'login',
    redirectAfterAuth = null
}) => {
    const [mode, setMode] = useState(defaultMode);
    const [pendingRedirect, setPendingRedirect] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const userRole = useSelector(selectRole);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Store the element that triggered the modal for focus restoration
    const triggerElementRef = useRef(null);

    // Store trigger element when modal opens
    useEffect(() => {
        if (open && !triggerElementRef.current) {
            triggerElementRef.current = document.activeElement;
        }
    }, [open]);

    // Update mode when defaultMode prop changes
    useEffect(() => {
        setMode(defaultMode);
    }, [defaultMode]);

    // Handle redirect after authentication state changes
    useEffect(() => {
        if (isAuthenticated && pendingRedirect && userRole !== 'guest') {
            // User is now authenticated, handle the redirect
            if (canAccessRoute(userRole, pendingRedirect)) {
                // User has permission, redirect to the requested path
                if (window.location.pathname !== pendingRedirect) {
                    console.log('[AuthModal] Redirecting to requested path:', pendingRedirect);
                    navigate(pendingRedirect);
                } else {
                    console.log('[AuthModal] Already on requested path, staying here');
                }
            } else {
                // User doesn't have permission for the requested path
                // Redirect to appropriate default page based on role
                console.log('[AuthModal] User lacks permission for:', pendingRedirect, 'Redirecting to default page');
                if (userRole === 'admin' || userRole === 'user') {
                    navigate('/dashboard');
                } else {
                    navigate('/');
                }
            }
            // Clear pending redirect
            setPendingRedirect(null);
        }
    }, [isAuthenticated, userRole, pendingRedirect, navigate]);

    // Clear errors when switching modes
    const handleModeChange = (event, newMode) => {
        dispatch(clearAuthError());
        setMode(newMode);
    };

    const handleSwitchToRegister = () => {
        dispatch(clearAuthError());
        setMode('register');
    };

    const handleSwitchToLogin = () => {
        dispatch(clearAuthError());
        setMode('login');
    };

    const handleSuccess = () => {
        // Close the modal
        onClose();

        // Set pending redirect if specified
        // The actual redirect will happen in the useEffect after role is updated
        if (redirectAfterAuth) {
            console.log('[AuthModal] Setting pending redirect to:', redirectAfterAuth);
            setPendingRedirect(redirectAfterAuth);
        } else {
            console.log('[AuthModal] No redirect path, staying on current page');
        }
    };

    const handleClose = (event, reason) => {
        // Allow closing via ESC key or click outside
        if (reason === 'escapeKeyDown' || reason === 'backdropClick') {
            dispatch(clearAuthError());
            onClose();
            // Restore focus to trigger element
            restoreFocus();
        }
    };

    const handleCloseButton = () => {
        dispatch(clearAuthError());
        onClose();
        // Restore focus to trigger element
        restoreFocus();
    };

    const restoreFocus = () => {
        // Restore focus to the element that opened the modal
        if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
            // Use setTimeout to ensure the modal is fully closed before restoring focus
            setTimeout(() => {
                triggerElementRef.current?.focus();
                triggerElementRef.current = null;
            }, 100);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            aria-labelledby="auth-modal-title"
            aria-describedby="auth-modal-description"
            // Focus trap is handled by Material-UI Dialog by default
            disableEscapeKeyDown={false}
            keepMounted={false}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 2,
                    position: 'relative',
                },
                role: 'dialog',
                'aria-modal': true,
            }}
        >
            {/* Close button */}
            <IconButton
                aria-label="close"
                onClick={handleCloseButton}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                    zIndex: 1,
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Tabs for switching between login and register */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', pt: 1 }}>
                <Tabs
                    value={mode}
                    onChange={handleModeChange}
                    aria-label="authentication mode tabs"
                    centered
                >
                    <Tab
                        label="Sign In"
                        value="login"
                        id="auth-tab-login"
                        aria-controls="auth-tabpanel-login"
                    />
                    <Tab
                        label="Sign Up"
                        value="register"
                        id="auth-tab-register"
                        aria-controls="auth-tabpanel-register"
                    />
                </Tabs>
            </Box>

            <DialogContent sx={{ p: 4 }}>
                {/* Login Form */}
                {mode === 'login' && (
                    <Box
                        role="tabpanel"
                        id="auth-tabpanel-login"
                        aria-labelledby="auth-tab-login"
                    >
                        <LoginForm
                            onSuccess={handleSuccess}
                            onSwitchToRegister={handleSwitchToRegister}
                        />
                    </Box>
                )}

                {/* Register Form */}
                {mode === 'register' && (
                    <Box
                        role="tabpanel"
                        id="auth-tabpanel-register"
                        aria-labelledby="auth-tab-register"
                    >
                        <RegisterForm
                            onSuccess={handleSuccess}
                            onSwitchToLogin={handleSwitchToLogin}
                        />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
