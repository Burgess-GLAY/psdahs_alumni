import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock as LockIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { processStripePayment } from '../../services/paymentService';
import { cardElementOptions } from '../../utils/stripeHelpers';

const StripePaymentForm = ({ donationData, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setError('Payment system is not ready. Please try again.');
            return;
        }

        if (!cardComplete) {
            setError('Please complete your card information.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const result = await processStripePayment(stripe, elements, donationData);

            if (result.success) {
                onSuccess(result);
            } else {
                setError(result.error);
                if (onError) {
                    onError(result.error);
                }
            }
        } catch (err) {
            const errorMessage = 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* Card Element Container */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border: '1px solid',
                    borderColor: error ? 'error.main' : 'grey.300',
                    borderRadius: 1,
                    transition: 'border-color 0.3s',
                    '&:focus-within': {
                        borderColor: error ? 'error.main' : 'primary.main',
                        borderWidth: '2px',
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        Card Information
                    </Typography>
                </Box>
                <CardElement
                    options={cardElementOptions}
                    onChange={handleCardChange}
                />
            </Paper>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Security Notice */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                }}
            >
                <LockIcon sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                    Your payment information is encrypted and secure. We never store your card details.
                </Typography>
            </Box>

            {/* Submit Button */}
            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!stripe || isProcessing || !cardComplete}
                startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                }}
            >
                {isProcessing ? 'Processing...' : `Donate $${donationData.amount}`}
            </Button>

            {/* Powered by Stripe */}
            <Box textAlign="center" mt={2}>
                <Typography variant="caption" color="text.secondary">
                    Powered by Stripe • PCI DSS Compliant
                </Typography>
            </Box>
        </Box>
    );
};

export default StripePaymentForm;
