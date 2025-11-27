import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    TextField,
    FormControl,
    FormLabel,
    Select,
    MenuItem,
    Paper,
    Typography,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import {
    updateDonorField,
    setCategory,
    selectDonorInfo,
    selectCategory,
} from '../../features/donation/donationSlice';
import { selectUser, selectIsAuthenticated } from '../../features/auth/authSlice';

/**
 * DonorInformationForm Component
 * 
 * Collects donor name, email, and donation category.
 * Pre-fills fields if user is authenticated.
 * Includes inline validation with error messages.
 * Ensures proper ARIA labels and accessibility.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.7
 */
const DonorInformationForm = () => {
    const dispatch = useDispatch();
    const donorInfo = useSelector(selectDonorInfo);
    const category = useSelector(selectCategory);
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});

    // Pre-fill donor info if user is authenticated
    useEffect(() => {
        if (isAuthenticated && user && !donorInfo.name && !donorInfo.email) {
            if (user.name) {
                dispatch(updateDonorField({ field: 'name', value: user.name }));
            }
            if (user.email) {
                dispatch(updateDonorField({ field: 'email', value: user.email }));
            }
        }
    }, [isAuthenticated, user, donorInfo.name, donorInfo.email, dispatch]);

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'name':
                if (!value || value.trim().length === 0) {
                    error = 'Name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                if (!value || value.trim().length === 0) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;

            default:
                break;
        }

        return error;
    };

    const handleFieldChange = (field, value) => {
        dispatch(updateDonorField({ field, value }));

        // Validate if field has been touched
        if (touched[field]) {
            const error = validateField(field, value);
            setErrors((prev) => ({
                ...prev,
                [field]: error,
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const value = donorInfo[field];
        const error = validateField(field, value);
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));
    };

    const handleCategoryChange = (event) => {
        dispatch(setCategory(event.target.value));
    };

    const categories = [
        {
            value: 'all',
            label: 'Where Most Needed',
            description: 'Support all areas of our mission',
        },
        {
            value: 'alumni-support',
            label: 'Fellow Alumni in Need',
            description: 'Help alumni facing hardship',
        },
        {
            value: 'scholarships',
            label: 'Scholarships',
            description: 'Fund educational opportunities',
        },
        {
            value: 'programs',
            label: 'Alumni Programs',
            description: 'Support events and initiatives',
        },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
            }}
        >
            <FormControl component="fieldset" fullWidth>
                <FormLabel
                    component="legend"
                    sx={{
                        mb: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    Your Information
                </FormLabel>

                {/* Name Field */}
                <Box sx={{ mb: 3 }}>
                    <FormLabel
                        htmlFor="donor-name"
                        required
                        sx={{
                            mb: 1,
                            display: 'block',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                        }}
                    >
                        Full Name
                    </FormLabel>
                    <TextField
                        id="donor-name"
                        value={donorInfo.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Enter your full name"
                        fullWidth
                        required
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                        inputProps={{
                            'aria-label': 'full name',
                            'aria-required': 'true',
                            'aria-invalid': touched.name && !!errors.name,
                            'aria-describedby': touched.name && errors.name ? 'name-error' : undefined,
                        }}
                        FormHelperTextProps={{
                            id: 'name-error',
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderWidth: 2,
                                },
                            },
                        }}
                    />
                </Box>

                {/* Email Field */}
                <Box sx={{ mb: 3 }}>
                    <FormLabel
                        htmlFor="donor-email"
                        required
                        sx={{
                            mb: 1,
                            display: 'block',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                        }}
                    >
                        Email Address
                    </FormLabel>
                    <TextField
                        id="donor-email"
                        type="email"
                        value={donorInfo.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="your.email@example.com"
                        fullWidth
                        required
                        error={touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                        inputProps={{
                            'aria-label': 'email address',
                            'aria-required': 'true',
                            'aria-invalid': touched.email && !!errors.email,
                            'aria-describedby': touched.email && errors.email ? 'email-error' : 'email-helper',
                        }}
                        FormHelperTextProps={{
                            id: touched.email && errors.email ? 'email-error' : 'email-helper',
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderWidth: 2,
                                },
                            },
                        }}
                    />
                    {!errors.email && !touched.email && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                            id="email-helper"
                        >
                            We'll send your receipt to this email
                        </Typography>
                    )}
                </Box>

                {/* Donation Category */}
                <Box sx={{ mb: 3 }}>
                    <FormLabel
                        htmlFor="donation-category"
                        sx={{
                            mb: 1,
                            display: 'block',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                        }}
                    >
                        Donation Category
                    </FormLabel>
                    <Select
                        id="donation-category"
                        value={category}
                        onChange={handleCategoryChange}
                        fullWidth
                        inputProps={{
                            'aria-label': 'donation category',
                        }}
                        sx={{
                            '& .MuiSelect-select': {
                                py: 1.5,
                            },
                        }}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.value} value={cat.value}>
                                <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                        {cat.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {cat.description}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* Recognition Options */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: 'grey.50',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1.5 }}
                    >
                        Recognition & Updates
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={donorInfo.optInRecognition || false}
                                onChange={(e) =>
                                    handleFieldChange('optInRecognition', e.target.checked)
                                }
                                inputProps={{
                                    'aria-label': 'display name on donor wall',
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Display my name on the donor wall
                            </Typography>
                        }
                        sx={{ mb: 1 }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={donorInfo.optInUpdates || false}
                                onChange={(e) =>
                                    handleFieldChange('optInUpdates', e.target.checked)
                                }
                                inputProps={{
                                    'aria-label': 'subscribe to impact updates',
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Send me updates about how my donation is making an impact
                            </Typography>
                        }
                    />
                </Box>
            </FormControl>
        </Paper>
    );
};

export default DonorInformationForm;
