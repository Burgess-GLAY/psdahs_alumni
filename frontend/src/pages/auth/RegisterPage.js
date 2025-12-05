import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage = () => {
    const location = useLocation();
    // Initialize mode based on current path
    const [mode, setMode] = useState(() => {
        return location.pathname === '/login' ? 'login' : 'register';
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const userRole = useSelector(selectRole);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Update mode when path changes
    useEffect(() => {
        if (location.pathname === '/login') {
            setMode('login');
        } else {
            setMode('register');
        }
    }, [location.pathname]);

    // Close dialog if already authenticated
    useEffect(() => {
        if (isAuthenticated && userRole !== 'guest') {
            navigate('/dashboard');
        }
    }, [isAuthenticated, userRole, navigate]);

    // Clear errors when switching modes
    const handleModeChange = (event, newMode) => {
        dispatch(clearAuthError());
        setMode(newMode);
        if (newMode === 'register') {
            navigate('/register', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    };

    const handleSwitchToRegister = () => {
        dispatch(clearAuthError());
        setMode('register');
        navigate('/register', { replace: true });
    };

    const handleSwitchToLogin = () => {
        dispatch(clearAuthError());
        setMode('login');
        navigate('/login', { replace: true });
    };

    const handleSuccess = () => {
        navigate('/dashboard');
    };

    const handleClose = () => {
        navigate('/');
    };

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            aria-labelledby="auth-modal-title"
            aria-describedby="auth-modal-description"
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
                onClick={handleClose}
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

export default RegisterPage;
