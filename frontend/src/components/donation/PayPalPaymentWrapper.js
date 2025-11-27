import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Box, Alert } from '@mui/material';
import { paypalOptions } from '../../utils/paypalHelpers';
import PayPalPaymentButton from './PayPalPaymentButton';

const PayPalPaymentWrapper = ({ donationData, onSuccess, onError }) => {
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

    if (!clientId) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    PayPal is not configured. Please contact support or use a different payment method.
                </Alert>
            </Box>
        );
    }

    return (
        <PayPalScriptProvider options={paypalOptions}>
            <PayPalPaymentButton
                donationData={donationData}
                onSuccess={onSuccess}
                onError={onError}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalPaymentWrapper;
