import React from 'react';
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
    Chip,
} from '@mui/material';
import {
    CreditCard as CreditCardIcon,
    Lock as LockIcon,
    PhoneIphone as PhoneIcon,
} from '@mui/icons-material';
// import StripePaymentWrapper from './StripePaymentWrapper';
import MobileMoneyPayment from './MobileMoneyPayment';
import OrangeMoneyPayment from './OrangeMoneyPayment';

const PaymentMethodSelector = ({ donationData, onSuccess, onError }) => {
    const [paymentMethod, setPaymentMethod] = React.useState('card');

    const handlePaymentMethodChange = (event, newMethod) => {
        if (newMethod !== null) {
            setPaymentMethod(newMethod);
        }
    };

    return (
        <Box>
            {/* Section Header */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Choose Payment Method
            </Typography>

            {/* Payment Method Toggle */}
            <Box sx={{ mb: 4 }}>
                <ToggleButtonGroup
                    value={paymentMethod}
                    exclusive
                    onChange={handlePaymentMethodChange}
                    aria-label="payment method"
                    fullWidth
                    sx={{
                        '& .MuiToggleButton-root': {
                            py: 2,
                            px: 3,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            border: '2px solid',
                            borderColor: 'divider',
                            '&.Mui-selected': {
                                borderColor: 'primary.main',
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                },
                            },
                        },
                    }}
                >
                    <ToggleButton value="card" aria-label="credit or debit card">
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <CreditCardIcon sx={{ fontSize: 32 }} />
                            <Typography variant="body1" fontWeight={600}>
                                Credit/Debit Card
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Chip label="Visa" size="small" />
                                <Chip label="Mastercard" size="small" />
                                <Chip label="Amex" size="small" />
                            </Box>
                        </Box>
                    </ToggleButton>

                    <ToggleButton value="liberia_mobile_money" aria-label="Liberia Mobile Money">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 32 }} />
                            <Typography variant="body1" fontWeight={600}>Liberia Mobile Money</Typography>
                            <Chip label="MTN MoMo" size="small" />
                        </Box>
                    </ToggleButton>
                    <ToggleButton value="orange_money" aria-label="Orange Money">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 32 }} />
                            <Typography variant="body1" fontWeight={600}>Orange Money</Typography>
                            <Chip label="Orange Liberia" size="small" />
                        </Box>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Security Badges */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2" color="text.secondary">
                            256-bit SSL Encryption
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        •
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        PCI DSS Compliant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        •
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {paymentMethod === 'card' ? 'Powered by Stripe' : paymentMethod === 'liberia_mobile_money' ? 'Powered by Mobile Money' : 'Powered by Orange Money'}
                    </Typography>
                </Box>
            </Paper>

            {/* Payment Form */}
            <Box>
                {paymentMethod === 'card' && (
                    // <StripePaymentWrapper donationData={donationData} onSuccess={onSuccess} onError={onError} />
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body1" color="text.secondary">
                            Card payments are temporarily unavailable due to system maintenance.
                        </Typography>
                    </Box>
                )}
                {paymentMethod === 'liberia_mobile_money' && (
                    <MobileMoneyPayment donationData={donationData} onSuccess={onSuccess} onError={onError} />
                )}
                {paymentMethod === 'orange_money' && (
                    <OrangeMoneyPayment donationData={donationData} onSuccess={onSuccess} onError={onError} />
                )}
            </Box>
        </Box>
    );
};

export default PaymentMethodSelector;
