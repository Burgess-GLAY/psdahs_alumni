import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Divider,
    IconButton,
    Paper,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { formatAmount } from '../../services/paymentService';

const ThankYouModal = ({
    open,
    onClose,
    donationData,
    onDownloadReceipt,
    onMakeAnotherDonation,
}) => {
    const {
        amount,
        transactionId,
        date,
        category,
        type,
        receiptUrl,
    } = donationData || {};

    const getCategoryName = (cat) => {
        const categoryMap = {
            'alumni-support': 'Fellow Alumni in Need',
            'scholarships': 'Scholarships',
            'programs': 'Alumni Programs',
            'all': 'General Support',
        };
        return categoryMap[cat] || 'Alumni Platform';
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'I just donated to Alumni Platform',
                text: `I just made a donation to support ${getCategoryName(category)}. Join me in making a difference!`,
                url: window.location.origin + '/donate',
            }).catch((error) => console.log('Error sharing:', error));
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.origin + '/donate');
            alert('Link copied to clipboard!');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 2,
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: 'grey.500',
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent sx={{ pt: 4, pb: 3 }}>
                {/* Success Animation */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            mb: 2,
                            animation: 'scaleIn 0.5s ease-out',
                            '@keyframes scaleIn': {
                                '0%': {
                                    transform: 'scale(0)',
                                    opacity: 0,
                                },
                                '50%': {
                                    transform: 'scale(1.1)',
                                },
                                '100%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                },
                            },
                        }}
                    >
                        <CheckCircleIcon
                            sx={{
                                fontSize: 80,
                                color: 'success.main',
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        textAlign="center"
                        sx={{ fontWeight: 700, mb: 1 }}
                    >
                        Thank You for Your Donation!
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ maxWidth: '400px' }}
                    >
                        Your generous contribution will make a real difference in our community.
                        We've sent a receipt to your email.
                    </Typography>
                </Box>

                {/* Donation Summary */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Donation Summary
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Amount */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Amount
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                                {formatAmount(amount)}
                            </Typography>
                        </Box>

                        {/* Type */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Type
                            </Typography>
                            <Typography variant="body1">
                                {type === 'recurring' ? 'Recurring (Monthly)' : 'One-Time'}
                            </Typography>
                        </Box>

                        {/* Category */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Category
                            </Typography>
                            <Typography variant="body1">
                                {getCategoryName(category)}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Transaction ID */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Transaction ID
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {transactionId}
                            </Typography>
                        </Box>

                        {/* Date */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Date
                            </Typography>
                            <Typography variant="body2">
                                {date ? new Date(date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Recurring Donation Info */}
                {type === 'recurring' && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 3,
                            bgcolor: 'info.light',
                            border: '1px solid',
                            borderColor: 'info.main',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <FavoriteIcon sx={{ color: 'info.main', mt: 0.5 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Recurring Donation Active
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Your next donation of {formatAmount(amount)} will be processed on{' '}
                                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}. You can manage or cancel your recurring donation anytime from your dashboard.
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Download Receipt */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={onDownloadReceipt}
                        disabled={!receiptUrl}
                    >
                        Download Receipt
                    </Button>

                    {/* Share */}
                    <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<ShareIcon />}
                        onClick={handleShare}
                    >
                        Share Your Impact
                    </Button>

                    {/* Make Another Donation */}
                    <Button
                        variant="text"
                        size="large"
                        fullWidth
                        onClick={onMakeAnotherDonation}
                    >
                        Make Another Donation
                    </Button>
                </Box>

                {/* Tax Deductible Notice */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    display="block"
                    sx={{ mt: 3 }}
                >
                    This donation is tax-deductible to the fullest extent allowed by law.
                    Tax ID: 12-3456789
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default ThankYouModal;
