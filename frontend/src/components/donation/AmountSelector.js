import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Button,
    TextField,
    FormControl,
    FormLabel,
    FormHelperText,
    Paper,
    InputAdornment,
    Grid,
} from '@mui/material';
import {
    setAmount,
    setCustomAmount,
    selectAmount,
    selectCustomAmount,
    selectEffectiveAmount,
} from '../../features/donation/donationSlice';

/**
 * AmountSelector Component
 * 
 * Displays preset donation amounts and a custom amount input.
 * Validates minimum ($1) and maximum ($10,000) amounts.
 * Provides visual feedback for selected amount.
 * 
 * Requirements: 2.3, 2.4, 2.5, 2.6, 2.7
 */
const AmountSelector = () => {
    const dispatch = useDispatch();
    const selectedAmount = useSelector(selectAmount);
    const customAmount = useSelector(selectCustomAmount);
    const effectiveAmount = useSelector(selectEffectiveAmount);

    const [validationError, setValidationError] = useState('');

    const presetAmounts = [25, 50, 100, 250, 500];
    const MIN_AMOUNT = 1;
    const MAX_AMOUNT = 10000;

    const handlePresetClick = (amount) => {
        dispatch(setAmount(amount));
        setValidationError('');
    };

    const handleCustomAmountChange = (event) => {
        const value = event.target.value;
        dispatch(setCustomAmount(value));

        // Validate custom amount
        if (value === '') {
            setValidationError('');
            return;
        }

        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            setValidationError('Please enter a valid number');
        } else if (numValue < MIN_AMOUNT) {
            setValidationError(`Minimum donation is $${MIN_AMOUNT}`);
        } else if (numValue > MAX_AMOUNT) {
            setValidationError(`Maximum donation is $${MAX_AMOUNT.toLocaleString()}`);
        } else {
            setValidationError('');
        }
    };

    // Clear validation error when switching back to preset
    useEffect(() => {
        if (selectedAmount !== null) {
            setValidationError('');
        }
    }, [selectedAmount]);

    const hasError = validationError !== '';
    const hasValidAmount = effectiveAmount !== null && effectiveAmount > 0 && !hasError;

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
            <FormControl component="fieldset" fullWidth error={hasError}>
                <FormLabel
                    component="legend"
                    sx={{
                        mb: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    Donation Amount
                </FormLabel>

                {/* Preset Amounts */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {presetAmounts.map((amount) => (
                        <Grid item xs={6} sm={4} md={2.4} key={amount}>
                            <Button
                                variant={selectedAmount === amount ? 'contained' : 'outlined'}
                                onClick={() => handlePresetClick(amount)}
                                fullWidth
                                sx={{
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderWidth: 2,
                                    borderColor: selectedAmount === amount ? 'primary.main' : 'divider',
                                    '&:hover': {
                                        borderWidth: 2,
                                        borderColor: 'primary.main',
                                    },
                                    transition: 'all 0.2s ease',
                                    ...(selectedAmount === amount && {
                                        boxShadow: 2,
                                    }),
                                }}
                                aria-label={`Donate $${amount}`}
                                aria-pressed={selectedAmount === amount}
                            >
                                ${amount}
                            </Button>
                        </Grid>
                    ))}
                </Grid>

                {/* Custom Amount Input */}
                <Box>
                    <FormLabel
                        htmlFor="custom-amount"
                        sx={{
                            mb: 1,
                            display: 'block',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                        }}
                    >
                        Or enter a custom amount
                    </FormLabel>
                    <TextField
                        id="custom-amount"
                        type="number"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Enter amount"
                        fullWidth
                        error={hasError}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box
                                        component="span"
                                        sx={{
                                            fontSize: '1.2rem',
                                            fontWeight: 600,
                                            color: 'text.primary',
                                        }}
                                    >
                                        $
                                    </Box>
                                </InputAdornment>
                            ),
                            inputProps: {
                                min: MIN_AMOUNT,
                                max: MAX_AMOUNT,
                                step: '0.01',
                                'aria-label': 'custom donation amount',
                                'aria-describedby': hasError ? 'amount-error' : 'amount-helper',
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: '1.1rem',
                                fontWeight: 500,
                                ...(customAmount && !hasError && {
                                    borderColor: 'primary.main',
                                    '& fieldset': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2,
                                    },
                                }),
                            },
                            '& input[type=number]': {
                                MozAppearance: 'textfield',
                            },
                            '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                        }}
                    />
                    {hasError ? (
                        <FormHelperText
                            id="amount-error"
                            error
                            sx={{
                                mt: 1,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            {validationError}
                        </FormHelperText>
                    ) : (
                        <FormHelperText
                            id="amount-helper"
                            sx={{
                                mt: 1,
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                            }}
                        >
                            Minimum: ${MIN_AMOUNT} • Maximum: ${MAX_AMOUNT.toLocaleString()}
                        </FormHelperText>
                    )}
                </Box>

                {/* Selected Amount Display */}
                {hasValidAmount && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: 'success.light',
                            borderRadius: 1,
                            textAlign: 'center',
                            animation: 'fadeIn 0.3s ease-in',
                            '@keyframes fadeIn': {
                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                        }}
                        role="status"
                        aria-live="polite"
                    >
                        <Box
                            component="span"
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'success.dark',
                            }}
                        >
                            Selected amount: ${effectiveAmount.toFixed(2)}
                        </Box>
                    </Box>
                )}
            </FormControl>
        </Paper>
    );
};

export default AmountSelector;
