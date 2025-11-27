import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Grid,
    Link,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Divider,
    Alert,
    AlertTitle,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser, selectAuthStatus, selectAuthError, clearAuthError } from '../../features/auth/authSlice';
import GoogleLoginButton from './GoogleLoginButton';
import ErrorAlert from '../common/ErrorAlert';
import { isRetryableError } from '../../utils/errorMessages';
import { ClassGroupNotifications } from '../../utils/notifications';

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 50 }, (_, i) => currentYear - i).reverse();

const validationSchema = Yup.object({
    firstName: Yup.string()
        .max(50, 'First name must be less than 50 characters')
        .required('First name is required'),
    lastName: Yup.string()
        .max(50, 'Last name must be less than 50 characters')
        .required('Last name is required'),
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain uppercase, lowercase, number, and special character'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
    graduationYear: Yup.number()
        .required('Graduation year is required')
        .min(1950, 'Graduation year must be after 1950')
        .max(currentYear + 5, `Graduation year cannot be after ${currentYear + 5}`),
    phone: Yup.string().matches(/^\+?[0-9\s-]{10,}$/, 'Please enter a valid phone number'),
});

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [lastError, setLastError] = useState(null);
    const [assignedClassGroup, setAssignedClassGroup] = useState(null);
    const [showClassGroupNotification, setShowClassGroupNotification] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authStatus = useSelector(selectAuthStatus);
    const authError = useSelector(selectAuthError);
    const loading = authStatus === 'loading';

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            graduationYear: '',
            phone: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            dispatch(clearAuthError());

            const userData = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                graduationYear: values.graduationYear,
                phone: values.phone || undefined,
            };

            const result = await dispatch(registerUser(userData));

            if (registerUser.fulfilled.match(result)) {
                // Registration successful
                const response = result.payload;

                // Check if user was assigned to a class group
                if (response.assignedClassGroup) {
                    setAssignedClassGroup(response.assignedClassGroup);
                    setShowClassGroupNotification(true);

                    // Show success notification with class group info using ClassGroupNotifications
                    ClassGroupNotifications.registrationWelcome(
                        response.assignedClassGroup.name,
                        response.assignedClassGroup.id
                    );
                } else if (response.warning) {
                    // Show warning if assignment failed but registration succeeded
                    ClassGroupNotifications.registrationWithoutGroup();
                }

                // Auto-hide notification after 8 seconds
                setTimeout(() => {
                    setShowClassGroupNotification(false);
                }, 8000);

                if (onSuccess) {
                    onSuccess();
                }
            } else if (registerUser.rejected.match(result)) {
                // Store error for retry logic
                setLastError(result.error);
            }
        },
    });

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);
    const handleMouseDownPassword = (e) => e.preventDefault();

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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5" id="register-form-title">
                Create Your Alumni Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
                Join the PSDAHS Alumni Network to reconnect with classmates, attend events, and stay
                updated with the school community.
            </Typography>

            <Box sx={{ width: '100%', mb: 2 }}>
                <ErrorAlert
                    error={authError}
                    onRetry={canRetry ? handleRetry : null}
                    onDismiss={handleDismissError}
                />
            </Box>

            {/* Class Group Assignment Notification */}
            {showClassGroupNotification && assignedClassGroup && (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    onClose={() => setShowClassGroupNotification(false)}
                    sx={{ mb: 2, width: '100%' }}
                >
                    <AlertTitle>Welcome to Your Class Group!</AlertTitle>
                    You've been automatically added to{' '}
                    <strong>{assignedClassGroup.name}</strong> with{' '}
                    {assignedClassGroup.memberCount} member{assignedClassGroup.memberCount !== 1 ? 's' : ''}.{' '}
                    <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/classes/${assignedClassGroup.id}`);
                        }}
                        sx={{ fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                        View your class group
                    </Link>
                </Alert>
            )}

            <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="firstName"
                            label="First Name"
                            required
                            fullWidth
                            autoComplete="given-name"
                            autoFocus
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                            helperText={formik.touched.firstName && formik.errors.firstName}
                            disabled={loading}
                            inputProps={{
                                'aria-label': 'First Name',
                                'aria-required': 'true',
                                'aria-invalid': formik.touched.firstName && Boolean(formik.errors.firstName),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="lastName"
                            label="Last Name"
                            required
                            fullWidth
                            autoComplete="family-name"
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                            helperText={formik.touched.lastName && formik.errors.lastName}
                            disabled={loading}
                            inputProps={{
                                'aria-label': 'Last Name',
                                'aria-required': 'true',
                                'aria-invalid': formik.touched.lastName && Boolean(formik.errors.lastName),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl
                            fullWidth
                            error={formik.touched.graduationYear && Boolean(formik.errors.graduationYear)}
                            disabled={loading}
                        >
                            <InputLabel id="graduation-year-label">Graduation Year *</InputLabel>
                            <Select
                                labelId="graduation-year-label"
                                id="graduationYear"
                                name="graduationYear"
                                value={formik.values.graduationYear}
                                label="Graduation Year *"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                {graduationYears.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formik.touched.graduationYear && formik.errors.graduationYear && (
                                <FormHelperText>{formik.errors.graduationYear}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="phone"
                            label="Phone Number (Optional)"
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                            helperText={formik.touched.phone && formik.errors.phone}
                            disabled={loading}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="email"
                            label="Email Address"
                            autoComplete="email"
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
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            disabled={loading}
                            inputProps={{
                                'aria-label': 'Confirm Password',
                                'aria-required': 'true',
                                'aria-invalid': formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword),
                            }}
                        />
                    </Grid>
                </Grid>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                    aria-label={loading ? 'Creating account, please wait' : 'Create your alumni account'}
                >
                    {loading ? <CircularProgress size={24} aria-label="Loading" /> : 'Sign Up'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                        OR
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                </Box>

                <Box sx={{ width: '100%', mb: 3 }}>
                    <GoogleLoginButton
                        buttonText="Sign up with Google"
                        isSignUp={true}
                    />
                </Box>

                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={(e) => {
                                e.preventDefault();
                                if (onSwitchToLogin) {
                                    onSwitchToLogin();
                                }
                            }}
                            sx={{ cursor: 'pointer' }}
                        >
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default RegisterForm;
