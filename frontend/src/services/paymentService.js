/**
 * Payment Service
 * Handles payment processing for Stripe and PayPal integrations
 */

import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Initialize Stripe
let stripePromise = null;

/**
 * Get Stripe instance
 * @returns {Promise<Stripe>} Stripe instance
 */
export const getStripe = () => {
    if (!stripePromise) {
        const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.error('Stripe publishable key is not configured');
            return null;
        }
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};

/**
 * Create a payment intent for Stripe
 * @param {Object} donationData - Donation details
 * @returns {Promise<Object>} Payment intent data
 */
export const createPaymentIntent = async (donationData) => {
    try {
        const response = await axios.post(`${API_URL}/donations/create-intent`, {
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            type: donationData.type,
            category: donationData.category,
            metadata: {
                donorName: donationData.donorInfo?.name,
                donorEmail: donationData.donorInfo?.email,
            },
        });

        return {
            success: true,
            clientSecret: response.data.clientSecret,
            donationId: response.data.donationId,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to initialize payment',
        };
    }
};

/**
 * Confirm a Stripe payment
 * @param {string} paymentIntentId - Payment intent ID
 * @param {Object} donationData - Donation details
 * @returns {Promise<Object>} Confirmation result
 */
export const confirmPayment = async (paymentIntentId, donationData) => {
    try {
        const response = await axios.post(`${API_URL}/donations/confirm`, {
            paymentIntentId,
            donationId: donationData.donationId,
            donorInfo: donationData.donorInfo,
        });

        return {
            success: true,
            transactionId: response.data.transactionId,
            receiptUrl: response.data.receiptUrl,
            donation: response.data.donation,
        };
    } catch (error) {
        console.error('Error confirming payment:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to confirm payment',
        };
    }
};

/**
 * Process a Stripe card payment
 * @param {Object} stripe - Stripe instance
 * @param {Object} elements - Stripe Elements instance
 * @param {Object} donationData - Donation details
 * @returns {Promise<Object>} Payment result
 */
export const processStripePayment = async (stripe, elements, donationData) => {
    try {
        // Create payment intent
        const intentResult = await createPaymentIntent(donationData);

        if (!intentResult.success) {
            return intentResult;
        }

        // Confirm card payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
            intentResult.clientSecret,
            {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: donationData.donorInfo.name,
                        email: donationData.donorInfo.email,
                    },
                },
            }
        );

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        // Confirm payment on backend
        const confirmResult = await confirmPayment(paymentIntent.id, {
            ...donationData,
            donationId: intentResult.donationId,
        });

        return confirmResult;
    } catch (error) {
        console.error('Error processing Stripe payment:', error);
        return {
            success: false,
            error: 'An unexpected error occurred during payment processing',
        };
    }
};

/**
 * Create a PayPal order
 * @param {Object} donationData - Donation details
 * @returns {Promise<string>} Order ID
 */
export const createPayPalOrder = async (donationData) => {
    try {
        const response = await axios.post(`${API_URL}/donations/paypal/create-order`, {
            amount: donationData.amount,
            currency: donationData.currency || 'USD',
            type: donationData.type,
            category: donationData.category,
            donorInfo: donationData.donorInfo,
        });

        return response.data.orderId;
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        throw new Error(error.response?.data?.message || 'Failed to create PayPal order');
    }
};

/**
 * Capture a PayPal order
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} Capture result
 */
export const capturePayPalOrder = async (orderId) => {
    try {
        const response = await axios.post(`${API_URL}/donations/paypal/capture-order`, {
            orderId,
        });

        return {
            success: true,
            transactionId: response.data.transactionId,
            receiptUrl: response.data.receiptUrl,
            donation: response.data.donation,
        };
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Failed to capture PayPal payment',
        };
    }
};

/**
 * Get payment method configuration
 * @returns {Object} Payment method configuration
 */
export const getPaymentConfig = () => {
    return {
        stripe: {
            enabled: !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
            publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
        },
        paypal: {
            enabled: !!process.env.REACT_APP_PAYPAL_CLIENT_ID,
            clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
        },
    };
};

/**
 * Validate payment amount
 * @param {number} amount - Amount to validate
 * @param {string} type - Donation type (one-time or recurring)
 * @returns {Object} Validation result
 */
export const validatePaymentAmount = (amount, type = 'one-time') => {
    const minAmount = 1;
    const maxOneTime = 10000;
    const maxRecurring = 5000;

    if (!amount || isNaN(amount)) {
        return {
            valid: false,
            error: 'Please enter a valid amount',
        };
    }

    if (amount < minAmount) {
        return {
            valid: false,
            error: `Minimum donation amount is $${minAmount}`,
        };
    }

    const maxAmount = type === 'recurring' ? maxRecurring : maxOneTime;
    if (amount > maxAmount) {
        return {
            valid: false,
            error: `Maximum ${type} donation amount is $${maxAmount}`,
        };
    }

    return {
        valid: true,
    };
};

/**
 * Format amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

/**
 * Handle payment errors
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handlePaymentError = (error) => {
    const errorMessages = {
        card_declined: 'Your card was declined. Please try a different payment method.',
        insufficient_funds: 'Insufficient funds. Please try a different payment method.',
        expired_card: 'Your card has expired. Please use a different card.',
        incorrect_cvc: 'The security code is incorrect. Please check and try again.',
        processing_error: 'An error occurred while processing your payment. Please try again.',
        network_error: 'Network error. Please check your connection and try again.',
    };

    if (error.code && errorMessages[error.code]) {
        return errorMessages[error.code];
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again or contact support.';
};

export default {
    getStripe,
    createPaymentIntent,
    confirmPayment,
    processStripePayment,
    createPayPalOrder,
    capturePayPalOrder,
    getPaymentConfig,
    validatePaymentAmount,
    formatAmount,
    handlePaymentError,
};
