/**
 * Payment Constants
 * Constants for payment processing and donation management
 */

// Payment Methods
export const PAYMENT_METHODS = {
    STRIPE: 'card',
    PAYPAL: 'paypal',
};

// Donation Types
export const DONATION_TYPES = {
    ONE_TIME: 'one-time',
    RECURRING: 'recurring',
};

// Recurring Frequencies
export const RECURRING_FREQUENCIES = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    ANNUALLY: 'annually',
};

// Donation Categories
export const DONATION_CATEGORIES = {
    ALL: 'all',
    ALUMNI_SUPPORT: 'alumni-support',
    SCHOLARSHIPS: 'scholarships',
    PROGRAMS: 'programs',
};

// Preset Donation Amounts (in USD)
export const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

// Amount Limits
export const AMOUNT_LIMITS = {
    MIN: 1,
    MAX_ONE_TIME: 10000,
    MAX_RECURRING: 5000,
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};

// Donor Recognition Levels
export const DONOR_LEVELS = {
    BRONZE: { name: 'Bronze', min: 1, max: 99, color: '#CD7F32' },
    SILVER: { name: 'Silver', min: 100, max: 499, color: '#C0C0C0' },
    GOLD: { name: 'Gold', min: 500, max: 999, color: '#FFD700' },
    PLATINUM: { name: 'Platinum', min: 1000, max: Infinity, color: '#E5E4E2' },
};

// Currency
export const DEFAULT_CURRENCY = 'USD';

// Error Messages
export const PAYMENT_ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    INVALID_AMOUNT: 'Please enter a valid donation amount.',
    PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
    SESSION_EXPIRED: 'Your payment session has expired. Please start over.',
    CONFIGURATION_ERROR: 'Payment system is not properly configured. Please contact support.',
};

// Success Messages
export const PAYMENT_SUCCESS_MESSAGES = {
    ONE_TIME: 'Thank you for your generous donation!',
    RECURRING: 'Thank you for setting up a recurring donation!',
};

// Category Display Names
export const CATEGORY_NAMES = {
    [DONATION_CATEGORIES.ALL]: 'General Support',
    [DONATION_CATEGORIES.ALUMNI_SUPPORT]: 'Fellow Alumni in Need',
    [DONATION_CATEGORIES.SCHOLARSHIPS]: 'Scholarships',
    [DONATION_CATEGORIES.PROGRAMS]: 'Alumni Programs',
};

// Category Descriptions
export const CATEGORY_DESCRIPTIONS = {
    [DONATION_CATEGORIES.ALL]: 'Support all areas where help is needed most',
    [DONATION_CATEGORIES.ALUMNI_SUPPORT]: 'Help fellow alumni facing financial hardship',
    [DONATION_CATEGORIES.SCHOLARSHIPS]: 'Fund scholarships for deserving students',
    [DONATION_CATEGORIES.PROGRAMS]: 'Support alumni events and programs',
};

// Frequency Display Names
export const FREQUENCY_NAMES = {
    [RECURRING_FREQUENCIES.MONTHLY]: 'Monthly',
    [RECURRING_FREQUENCIES.QUARTERLY]: 'Quarterly',
    [RECURRING_FREQUENCIES.ANNUALLY]: 'Annually',
};

// API Endpoints
export const PAYMENT_ENDPOINTS = {
    CREATE_INTENT: '/donations/create-intent',
    CONFIRM_PAYMENT: '/donations/confirm',
    PAYPAL_CREATE_ORDER: '/donations/paypal/create-order',
    PAYPAL_CAPTURE_ORDER: '/donations/paypal/capture-order',
    GET_CATEGORIES: '/donations/categories',
    GET_IMPACT_STORIES: '/donations/impact-stories',
    GET_DONOR_WALL: '/donations/donor-wall',
    DOWNLOAD_RECEIPT: '/donations/receipt',
};

// Form Field Names
export const FORM_FIELDS = {
    DONATION_TYPE: 'donationType',
    AMOUNT: 'amount',
    CUSTOM_AMOUNT: 'customAmount',
    CATEGORY: 'category',
    FREQUENCY: 'frequency',
    DONOR_NAME: 'donorName',
    DONOR_EMAIL: 'donorEmail',
    PAYMENT_METHOD: 'paymentMethod',
    OPT_IN_RECOGNITION: 'optInRecognition',
    OPT_IN_UPDATES: 'optInUpdates',
    DISPLAY_NAME: 'displayName',
};

// Validation Rules
export const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    AMOUNT_REGEX: /^\d+(\.\d{1,2})?$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
};

// Analytics Event Names
export const ANALYTICS_EVENTS = {
    PAGE_VIEW: 'donate_page_view',
    AMOUNT_SELECTED: 'amount_selected',
    TYPE_CHANGED: 'donation_type_changed',
    CATEGORY_SELECTED: 'category_selected',
    PAYMENT_METHOD_SELECTED: 'payment_method_selected',
    DONATION_INITIATED: 'donation_initiated',
    DONATION_COMPLETED: 'donation_completed',
    DONATION_FAILED: 'donation_failed',
    DONATION_ABANDONED: 'donation_abandoned',
    RECEIPT_DOWNLOADED: 'receipt_downloaded',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    DONATION_DRAFT: 'donation_draft',
    LAST_DONATION: 'last_donation',
};

// Timeouts (in milliseconds)
export const TIMEOUTS = {
    PAYMENT_PROCESSING: 30000, // 30 seconds
    API_REQUEST: 15000, // 15 seconds
    DEBOUNCE_INPUT: 500, // 0.5 seconds
};

export default {
    PAYMENT_METHODS,
    DONATION_TYPES,
    RECURRING_FREQUENCIES,
    DONATION_CATEGORIES,
    PRESET_AMOUNTS,
    AMOUNT_LIMITS,
    PAYMENT_STATUS,
    DONOR_LEVELS,
    DEFAULT_CURRENCY,
    PAYMENT_ERROR_MESSAGES,
    PAYMENT_SUCCESS_MESSAGES,
    CATEGORY_NAMES,
    CATEGORY_DESCRIPTIONS,
    FREQUENCY_NAMES,
    PAYMENT_ENDPOINTS,
    FORM_FIELDS,
    VALIDATION_RULES,
    ANALYTICS_EVENTS,
    STORAGE_KEYS,
    TIMEOUTS,
};
