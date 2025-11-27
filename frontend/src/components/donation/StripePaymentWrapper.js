import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Box, Alert, CircularProgress } from '@mui/material';
import { getStripe } from '../../services/paymentService';
import { stripeElementsOptions } from '../../utils/stripeHelpers';
import StripePaymentForm from './StripePaymentForm';

const StripePaymentWrapper = ({ donationData, onSuccess, onError }) => {
    const stripePromise = getStripe();

    if (!stripePromise) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Payment system is not configured. Please contact support.
                </Alert>
            </Box>
        );
    }

    return (
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
            <StripePaymentForm
                donationData={donationData}
                onSuccess={onSuccess}
                onError={onError}
            />
        </Elements>
    );
};

export default StripePaymentWrapper;
