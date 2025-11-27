/**
 * Stripe Helper Utilities
 * Helper functions for Stripe integration
 */

/**
 * Stripe Elements styling options
 */
export const stripeElementsOptions = {
    fonts: [
        {
            cssSrc: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
        },
    ],
};

/**
 * Card Element styling
 */
export const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: 'Roboto, sans-serif',
            '::placeholder': {
                color: '#aab7c4',
            },
            iconColor: '#666EE8',
        },
        invalid: {
            color: '#d32f2f',
            iconColor: '#d32f2f',
        },
    },
    hidePostalCode: false,
};

/**
 * Parse Stripe error codes to user-friendly messages
 * @param {string} code - Stripe error code
 * @returns {string} User-friendly error message
 */
export const parseStripeError = (code) => {
    const errorMap = {
        // Card errors
        card_declined: 'Your card was declined. Please try another card.',
        expired_card: 'Your card has expired. Please use a different card.',
        incorrect_cvc: 'The card security code is incorrect.',
        incorrect_number: 'The card number is incorrect.',
        invalid_cvc: 'The card security code is invalid.',
        invalid_expiry_month: 'The card expiration month is invalid.',
        invalid_expiry_year: 'The card expiration year is invalid.',
        invalid_number: 'The card number is invalid.',

        // Processing errors
        processing_error: 'An error occurred while processing your card. Please try again.',

        // Insufficient funds
        insufficient_funds: 'Your card has insufficient funds.',

        // Authentication errors
        authentication_required: 'Additional authentication is required. Please complete the verification.',

        // Rate limiting
        rate_limit: 'Too many requests. Please wait a moment and try again.',

        // Generic errors
        api_error: 'An error occurred with our payment processor. Please try again.',
        validation_error: 'Please check your payment information and try again.',
    };

    return errorMap[code] || 'An unexpected error occurred. Please try again.';
};

/**
 * Check if Stripe is properly configured
 * @returns {boolean} True if Stripe is configured
 */
export const isStripeConfigured = () => {
    return !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Format card brand for display
 * @param {string} brand - Card brand from Stripe
 * @returns {string} Formatted brand name
 */
export const formatCardBrand = (brand) => {
    const brandMap = {
        visa: 'Visa',
        mastercard: 'Mastercard',
        amex: 'American Express',
        discover: 'Discover',
        diners: 'Diners Club',
        jcb: 'JCB',
        unionpay: 'UnionPay',
        unknown: 'Card',
    };

    return brandMap[brand?.toLowerCase()] || 'Card';
};

/**
 * Get card icon based on brand
 * @param {string} brand - Card brand
 * @returns {string} Icon name or emoji
 */
export const getCardIcon = (brand) => {
    const iconMap = {
        visa: '💳',
        mastercard: '💳',
        amex: '💳',
        discover: '💳',
        diners: '💳',
        jcb: '💳',
        unionpay: '💳',
    };

    return iconMap[brand?.toLowerCase()] || '💳';
};

/**
 * Validate Stripe publishable key format
 * @param {string} key - Publishable key
 * @returns {boolean} True if valid format
 */
export const isValidPublishableKey = (key) => {
    return key && (key.startsWith('pk_test_') || key.startsWith('pk_live_'));
};

/**
 * Create Stripe metadata object
 * @param {Object} donationData - Donation data
 * @returns {Object} Metadata object
 */
export const createStripeMetadata = (donationData) => {
    return {
        donation_type: donationData.type,
        donation_category: donationData.category,
        donor_name: donationData.donorInfo?.name || 'Anonymous',
        donor_email: donationData.donorInfo?.email || '',
        platform: 'alumni_platform',
    };
};

export default {
    stripeElementsOptions,
    cardElementOptions,
    parseStripeError,
    isStripeConfigured,
    formatCardBrand,
    getCardIcon,
    isValidPublishableKey,
    createStripeMetadata,
};
