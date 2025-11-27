import React, { useState } from 'react';
import { Box, Alert, Typography, CircularProgress } from '@mui/material';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { createPayPalOrder, capturePayPalOrder } from '../../services/paymentService';
import { parsePayPalError } from '../../utils/paypalHelpers';

const PayPalPaymentButton = ({ donationData, onSuccess, onError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const createOrder = async () => {
        try {
            setError(null);
            setIsProcessing(true);

            const orderId = await createPayPalOrder(donationData);
            return orderId;
        } catch (err) {
            const errorMessage = parsePayPalError(err);
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    const onApprove = async (data) => {
        try {
            setIsProcessing(true);
            setError(null);

            const result = await capturePayPalOrder(data.orderID);

            if (result.success) {
                onSuccess(result);
            } else {
                setError(result.error);
                if (onError) {
                    onError(result.error);
                }
            }
        } catch (err) {
            const errorMessage = parsePayPalError(err);
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const onErrorHandler = (err) => {
        const errorMessage = parsePayPalError(err);
        setError(errorMessage);
        if (onError) {
            onError(errorMessage);
        }
    };

    const onCancel = () => {
        setError('Payment was cancelled. Please try again if you wish to complete your donation.');
    };

    return (
        <Box>
            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        mb: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                    }}
                >
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                        Processing your payment...
                    </Typography>
                </Box>
            )}

            {/* PayPal Buttons */}
            <Box sx={{ mb: 3 }}>
                <PayPalButtons
                    style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'paypal',
                        height: 45,
                        tagline: false,
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onErrorHandler}
                    onCancel={onCancel}
                    disabled={isProcessing}
                />
            </Box>

            {/* Security Notice */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                }}
            >
                <CheckCircleIcon sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                    Secure payment powered by PayPal. Your financial information is protected.
                </Typography>
            </Box>
        </Box>
    );
};

export default PayPalPaymentButton;
