import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Link,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress,
    Stack,
    Divider,
} from '@mui/material';
import {
    LockOutlined as LockOutlinedIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, selectAuthStatus, selectAuthError, clearAuthError } from '../../features/auth/authSlice';
import GoogleLoginButton from './GoogleLoginButton';
import ErrorAlert from '../common/ErrorAlert';
import { isRetryableError } from '../../utils/errorMessages';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [lastError, setLastError] = useState(null);
    const dispatch = useDispatch();
    const authStatus = useSelector(selectAuthStatus);
    const authError = useSelector(selectAuthError);
    const loading = authStatus === 'loading';

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validationSchema,
        onSubmit: async (values) => {
            dispatch(clearAuthError());
            const result = await dispatch(loginUser({
                email: values.email,
                password: values.password
            }));

            if (loginUser.fulfilled.match(result)) {
                // Login successful
                if (onSuccess) {
                    onSuccess();
                }
            } else if (loginUser.rejected.match(result)) {
                // Store error for retry logic
                setLastError(result.error);
            }
        },
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleRetry = () => {
        // Retry the last submission
        formik.handleSubmit();
    };

    const handleDismissError = () => {
        dispatch(clearAuthError());
        setLastError(null);
    };

    // Determine if error is retryable
    const canRetry = lastError && isRetryableError(lastError);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
            setLastError(null);
        };
    }, [dispatch]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" id="login-form-title">
                Sign in to PSDAHS Alumni
            </Typography>

            <Box sx={{ width: '100%', mt: 2 }}>
                <ErrorAlert
                    error={authError}
                    onRetry={canRetry ? handleRetry : null}
                    onDismiss={handleDismissError}
                />
            </Box>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={loading}
                    inputProps={{
                        'aria-label': 'Email Address',
                        'aria-required': 'true',
                        'aria-invalid': formik.touched.email && Boolean(formik.errors.email),
                        'aria-describedby': formik.touched.email && formik.errors.email ? 'email-error' : undefined,
                    }}
                    FormHelperTextProps={{
                        id: 'email-error',
                        role: 'alert',
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    disabled={loading}
                    inputProps={{
                        'aria-label': 'Password',
                        'aria-required': 'true',
                        'aria-invalid': formik.touched.password && Boolean(formik.errors.password),
                        'aria-describedby': formik.touched.password && formik.errors.password ? 'password-error' : undefined,
                    }}
                    FormHelperTextProps={{
                        id: 'password-error',
                        role: 'alert',
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    disabled={loading}
                                    tabIndex={0}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="rememberMe"
                                color="primary"
                                checked={formik.values.rememberMe}
                                onChange={formik.handleChange}
                                disabled={loading}
                            />
                        }
                        label="Remember me"
                    />
                    <Link href="/forgot-password" variant="body2">
                        Forgot password?
                    </Link>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                    aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
                >
                    {loading ? <CircularProgress size={24} aria-label="Loading" /> : 'Sign In'}
                </Button>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 2 }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                </Stack>

                <GoogleLoginButton />

                <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Grid item>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={(e) => {
                                e.preventDefault();
                                if (onSwitchToRegister) {
                                    onSwitchToRegister();
                                }
                            }}
                            sx={{ cursor: 'pointer' }}
                        >
                            Don't have an account? Sign Up
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default LoginForm;
