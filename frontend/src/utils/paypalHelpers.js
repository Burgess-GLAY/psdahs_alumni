/**
 * PayPal Helper Utilities
 * Helper functions for PayPal integration
 */

/**
 * PayPal SDK options
 */
export const paypalOptions = {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
    'disable-funding': 'credit,card', // Optional: disable specific funding sources
};

/**
 * PayPal button styling
 */
export const paypalButtonStyles = {
    layout: 'vertical',
    color: 'gold',
    shape: 'rect',
    label: 'paypal',
    height: 45,
    tagline: false,
};

/**
 * Parse PayPal error to user-friendly message
 * @param {Object} error - PayPal error object
 * @returns {string} User-friendly error message
 */
export const parsePayPalError = (error) => {
    const errorMap = {
        INSTRUMENT_DECLINED: 'Your payment method was declined. Please try another payment method.',
        PAYER_ACTION_REQUIRED: 'Additional action is required. Please complete the payment process.',
        INTERNAL_SERVER_ERROR: 'A server error occurred. Please try again.',
        INVALID_REQUEST: 'Invalid payment request. Please refresh and try again.',
        RESOURCE_NOT_FOUND: 'Payment session expired. Please start over.',
        UNPROCESSABLE_ENTITY: 'Unable to process payment. Please check your information.',
        PERMISSION_DENIED: 'Payment authorization failed. Please try again.',
    };

    if (error.name && errorMap[error.name]) {
        return errorMap[error.name];
    }

    if (error.message) {
        return error.message;
    }

    return 'An error occurred with PayPal. Please try again or use a different payment method.';
};

/**
 * Check if PayPal is properly configured
 * @returns {boolean} True if PayPal is configured
 */
export const isPayPalConfigured = () => {
    return !!process.env.REACT_APP_PAYPAL_CLIENT_ID;
};

/**
 * Format PayPal amount
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted amount for PayPal
 */
export const formatPayPalAmount = (amount) => {
    return amount.toFixed(2);
};

/**
 * Create PayPal purchase units
 * @param {Object} donationData - Donation data
 * @returns {Array} Purchase units array
 */
export const createPurchaseUnits = (donationData) => {
    return [
        {
            amount: {
                currency_code: donationData.currency || 'USD',
                value: formatPayPalAmount(donationData.amount),
                breakdown: {
                    item_total: {
                        currency_code: donationData.currency || 'USD',
                        value: formatPayPalAmount(donationData.amount),
                    },
                },
            },
            description: `Donation to ${getCategoryName(donationData.category)}`,
            custom_id: donationData.donationId || '',
            items: [
                {
                    name: `${donationData.type === 'recurring' ? 'Recurring ' : ''}Donation`,
                    description: getCategoryName(donationData.category),
                    unit_amount: {
                        currency_code: donationData.currency || 'USD',
                        value: formatPayPalAmount(donationData.amount),
                    },
                    quantity: '1',
                    category: 'DONATION',
                },
            ],
        },
    ];
};

/**
 * Get category display name
 * @param {string} category - Category slug
 * @returns {string} Display name
 */
const getCategoryName = (category) => {
    const categoryMap = {
        all: 'General Support',
        'alumni-support': 'Fellow Alumni in Need',
        scholarships: 'Scholarships',
        programs: 'Alumni Programs',
    };

    return categoryMap[category] || 'Alumni Platform';
};

/**
 * Create PayPal application context
 * @param {Object} donationData - Donation data
 * @returns {Object} Application context
 */
export const createApplicationContext = (donationData) => {
    return {
        brand_name: 'Alumni Platform',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
    };
};

/**
 * Handle PayPal onApprove callback
 * @param {Object} data - PayPal approval data
 * @param {Function} captureOrder - Function to capture order
 * @returns {Promise<Object>} Capture result
 */
export const handlePayPalApprove = async (data, captureOrder) => {
    try {
        const result = await captureOrder(data.orderID);
        return {
            success: true,
            orderId: data.orderID,
            ...result,
        };
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        return {
            success: false,
            error: parsePayPalError(error),
        };
    }
};

/**
 * Handle PayPal onError callback
 * @param {Object} error - PayPal error
 * @returns {Object} Error result
 */
export const handlePayPalError = (error) => {
    console.error('PayPal error:', error);
    return {
        success: false,
        error: parsePayPalError(error),
    };
};

/**
 * Handle PayPal onCancel callback
 * @returns {Object} Cancel result
 */
export const handlePayPalCancel = () => {
    return {
        success: false,
        cancelled: true,
        error: 'Payment was cancelled',
    };
};

/**
 * Validate PayPal client ID format
 * @param {string} clientId - Client ID
 * @returns {boolean} True if valid format
 */
export const isValidClientId = (clientId) => {
    return clientId && clientId.length > 20;
};

/**
 * Get PayPal SDK script URL
 * @returns {string} SDK script URL
 */
export const getPayPalSDKUrl = () => {
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
    const currency = 'USD';
    return `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
};

export default {
    paypalOptions,
    paypalButtonStyles,
    parsePayPalError,
    isPayPalConfigured,
    formatPayPalAmount,
    createPurchaseUnits,
    createApplicationContext,
    handlePayPalApprove,
    handlePayPalError,
    handlePayPalCancel,
    isValidClientId,
    getPayPalSDKUrl,
};
