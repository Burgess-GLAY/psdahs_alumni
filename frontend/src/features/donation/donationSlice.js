import { createSlice } from '@reduxjs/toolkit';

// Initial state for donation feature
const initialState = {
    // Form data
    formData: {
        type: 'one-time', // 'one-time' | 'recurring'
        frequency: null, // 'monthly' | 'quarterly' | 'annually' | null
        amount: null, // Selected preset amount or null
        customAmount: '', // Custom amount input value
        category: 'all', // 'all' | 'alumni-support' | 'scholarships' | 'programs'
        donorInfo: {
            name: '',
            email: '',
            displayName: null, // How name appears on donor wall
            optInRecognition: false, // Show on donor wall
            optInUpdates: false, // Subscribe to impact updates
        },
        paymentMethod: 'card', // 'card' | 'paypal'
    },

    // Processing states
    processing: false,
    success: false,
    error: null,

    // Transaction data
    transactionId: null,
    receiptUrl: null,
    donationId: null,

    // Payment intent data (for Stripe)
    clientSecret: null,

    // Validation errors
    validationErrors: {},
};

const donationSlice = createSlice({
    name: 'donation',
    initialState,
    reducers: {
        // Update donation type (one-time or recurring)
        setDonationType: (state, action) => {
            state.formData.type = action.payload;
            // Reset frequency if switching to one-time
            if (action.payload === 'one-time') {
                state.formData.frequency = null;
            }
        },

        // Update recurring frequency
        setDonationFrequency: (state, action) => {
            state.formData.frequency = action.payload;
        },

        // Update selected amount (preset)
        setAmount: (state, action) => {
            state.formData.amount = action.payload;
            // Clear custom amount when preset is selected
            if (action.payload !== null) {
                state.formData.customAmount = '';
            }
        },

        // Update custom amount input
        setCustomAmount: (state, action) => {
            state.formData.customAmount = action.payload;
            // Clear preset amount when custom is entered
            if (action.payload) {
                state.formData.amount = null;
            }
        },

        // Update donation category
        setCategory: (state, action) => {
            state.formData.category = action.payload;
        },

        // Update donor information
        setDonorInfo: (state, action) => {
            state.formData.donorInfo = {
                ...state.formData.donorInfo,
                ...action.payload,
            };
        },

        // Update specific donor info field
        updateDonorField: (state, action) => {
            const { field, value } = action.payload;
            state.formData.donorInfo[field] = value;
        },

        // Update payment method
        setPaymentMethod: (state, action) => {
            state.formData.paymentMethod = action.payload;
        },

        // Update entire form data at once
        updateFormData: (state, action) => {
            state.formData = {
                ...state.formData,
                ...action.payload,
            };
        },

        // Pre-fill donor info for authenticated users
        prefillDonorInfo: (state, action) => {
            const { name, email } = action.payload;
            state.formData.donorInfo.name = name || '';
            state.formData.donorInfo.email = email || '';
        },

        // Set validation errors
        setValidationErrors: (state, action) => {
            state.validationErrors = action.payload;
        },

        // Clear validation errors
        clearValidationErrors: (state) => {
            state.validationErrors = {};
        },

        // Clear specific validation error
        clearValidationError: (state, action) => {
            const field = action.payload;
            delete state.validationErrors[field];
        },

        // Start payment processing
        startProcessing: (state) => {
            state.processing = true;
            state.error = null;
            state.success = false;
        },

        // Set client secret for Stripe payment
        setClientSecret: (state, action) => {
            state.clientSecret = action.payload.clientSecret;
            state.donationId = action.payload.donationId;
        },

        // Payment processing success
        processingSuccess: (state, action) => {
            state.processing = false;
            state.success = true;
            state.error = null;
            state.transactionId = action.payload.transactionId;
            state.receiptUrl = action.payload.receiptUrl;
            state.donationId = action.payload.donationId || state.donationId;
        },

        // Payment processing error
        processingError: (state, action) => {
            state.processing = false;
            state.success = false;
            state.error = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Reset donation state (after successful donation or cancellation)
        resetDonation: (state) => {
            return {
                ...initialState,
                // Preserve donor info if they want to donate again
                formData: {
                    ...initialState.formData,
                    donorInfo: {
                        ...state.formData.donorInfo,
                        // Keep name and email, reset opt-ins
                        optInRecognition: false,
                        optInUpdates: false,
                        displayName: null,
                    },
                },
            };
        },

        // Complete reset (clear everything including donor info)
        resetDonationComplete: () => {
            return initialState;
        },
    },
});

// Selectors

// Form data selectors
export const selectDonationType = (state) => state.donation.formData.type;
export const selectDonationFrequency = (state) => state.donation.formData.frequency;
export const selectAmount = (state) => state.donation.formData.amount;
export const selectCustomAmount = (state) => state.donation.formData.customAmount;
export const selectCategory = (state) => state.donation.formData.category;
export const selectDonorInfo = (state) => state.donation.formData.donorInfo;
export const selectPaymentMethod = (state) => state.donation.formData.paymentMethod;
export const selectFormData = (state) => state.donation.formData;

// Get the effective donation amount (preset or custom)
export const selectEffectiveAmount = (state) => {
    const { amount, customAmount } = state.donation.formData;
    if (amount !== null) return amount;
    if (customAmount) {
        const parsed = parseFloat(customAmount);
        return isNaN(parsed) ? null : parsed;
    }
    return null;
};

// Check if form has a valid amount
export const selectHasValidAmount = (state) => {
    const effectiveAmount = selectEffectiveAmount(state);
    return effectiveAmount !== null && effectiveAmount > 0;
};

// Check if recurring donation
export const selectIsRecurring = (state) => state.donation.formData.type === 'recurring';

// Processing state selectors
export const selectIsProcessing = (state) => state.donation.processing;
export const selectIsSuccess = (state) => state.donation.success;
export const selectDonationError = (state) => state.donation.error;

// Transaction data selectors
export const selectTransactionId = (state) => state.donation.transactionId;
export const selectReceiptUrl = (state) => state.donation.receiptUrl;
export const selectDonationId = (state) => state.donation.donationId;
export const selectClientSecret = (state) => state.donation.clientSecret;

// Validation selectors
export const selectValidationErrors = (state) => state.donation.validationErrors;
export const selectHasValidationErrors = (state) =>
    Object.keys(state.donation.validationErrors).length > 0;

// Check if form is ready for submission
export const selectIsFormValid = (state) => {
    const { donorInfo } = state.donation.formData;
    const hasValidAmount = selectHasValidAmount(state);
    const hasName = donorInfo.name.trim().length > 0;
    const hasEmail = donorInfo.email.trim().length > 0;
    const hasNoValidationErrors = !selectHasValidationErrors(state);

    return hasValidAmount && hasName && hasEmail && hasNoValidationErrors;
};

// Get donation summary for display
export const selectDonationSummary = (state) => {
    const { type, frequency, category, donorInfo } = state.donation.formData;
    const amount = selectEffectiveAmount(state);

    return {
        amount,
        type,
        frequency,
        category,
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        isRecurring: type === 'recurring',
    };
};

// Actions
export const {
    setDonationType,
    setDonationFrequency,
    setAmount,
    setCustomAmount,
    setCategory,
    setDonorInfo,
    updateDonorField,
    setPaymentMethod,
    updateFormData,
    prefillDonorInfo,
    setValidationErrors,
    clearValidationErrors,
    clearValidationError,
    startProcessing,
    setClientSecret,
    processingSuccess,
    processingError,
    clearError,
    resetDonation,
    resetDonationComplete,
} = donationSlice.actions;

export default donationSlice.reducer;
