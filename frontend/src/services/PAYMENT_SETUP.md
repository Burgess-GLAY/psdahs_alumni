# Payment Infrastructure Setup

This document describes the payment infrastructure setup for the donate page, including Stripe and PayPal integrations.

## Overview

The payment infrastructure supports:
- **Stripe** for credit/debit card payments
- **PayPal** for PayPal account payments
- One-time and recurring donations
- Multiple donation categories
- Secure payment processing with PCI compliance

## Dependencies

The following packages are installed:

```json
{
  "@stripe/stripe-js": "^8.3.0",
  "@stripe/react-stripe-js": "^5.3.0",
  "@paypal/react-paypal-js": "^8.9.2"
}
```

## Environment Variables

Configure the following environment variables in `frontend/.env`:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# PayPal Configuration
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id_here
```

### Getting API Keys

**Stripe:**
1. Sign up at https://stripe.com
2. Navigate to Developers > API keys
3. Copy the Publishable key (starts with `pk_test_` for test mode)
4. Use test mode for development, live mode for production

**PayPal:**
1. Sign up at https://developer.paypal.com
2. Create an app in the Dashboard
3. Copy the Client ID from the app credentials
4. Use Sandbox credentials for development, Live for production

## File Structure

```
frontend/src/
├── services/
│   ├── paymentService.js          # Main payment service
│   └── PAYMENT_SETUP.md           # This file
├── utils/
│   ├── stripeHelpers.js           # Stripe-specific utilities
│   └── paypalHelpers.js           # PayPal-specific utilities
└── constants/
    └── paymentConstants.js        # Payment-related constants
```

## Services

### paymentService.js

Main payment service that handles:
- Stripe payment intent creation and confirmation
- PayPal order creation and capture
- Payment validation
- Error handling
- Amount formatting

**Key Functions:**
- `getStripe()` - Get Stripe instance
- `createPaymentIntent(donationData)` - Create Stripe payment intent
- `confirmPayment(paymentIntentId, donationData)` - Confirm Stripe payment
- `processStripePayment(stripe, elements, donationData)` - Complete Stripe payment flow
- `createPayPalOrder(donationData)` - Create PayPal order
- `capturePayPalOrder(orderId)` - Capture PayPal payment
- `validatePaymentAmount(amount, type)` - Validate donation amount
- `formatAmount(amount, currency)` - Format amount for display
- `handlePaymentError(error)` - Parse and format error messages

### stripeHelpers.js

Stripe-specific utilities:
- Element styling options
- Error code parsing
- Card brand formatting
- Metadata creation
- Configuration validation

### paypalHelpers.js

PayPal-specific utilities:
- SDK options and button styling
- Purchase unit creation
- Error parsing
- Amount formatting
- Callback handlers

### paymentConstants.js

Constants for:
- Payment methods and types
- Donation categories and amounts
- Status codes
- Error/success messages
- API endpoints
- Validation rules
- Analytics events

## Usage Examples

### Initialize Stripe

```javascript
import { getStripe } from '../services/paymentService';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = getStripe();

function App() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

### Process Stripe Payment

```javascript
import { processStripePayment } from '../services/paymentService';
import { useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (donationData) => {
    const result = await processStripePayment(stripe, elements, donationData);
    
    if (result.success) {
      console.log('Payment successful:', result.transactionId);
    } else {
      console.error('Payment failed:', result.error);
    }
  };
}
```

### Initialize PayPal

```javascript
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalOptions } from '../utils/paypalHelpers';

function App() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalPaymentButton />
    </PayPalScriptProvider>
  );
}
```

### Process PayPal Payment

```javascript
import { PayPalButtons } from '@paypal/react-paypal-js';
import { createPayPalOrder, capturePayPalOrder } from '../services/paymentService';

function PayPalPaymentButton({ donationData }) {
  return (
    <PayPalButtons
      createOrder={async () => {
        return await createPayPalOrder(donationData);
      }}
      onApprove={async (data) => {
        const result = await capturePayPalOrder(data.orderID);
        if (result.success) {
          console.log('Payment successful:', result.transactionId);
        }
      }}
      onError={(error) => {
        console.error('PayPal error:', error);
      }}
    />
  );
}
```

### Validate Amount

```javascript
import { validatePaymentAmount } from '../services/paymentService';

const validation = validatePaymentAmount(100, 'one-time');
if (!validation.valid) {
  console.error(validation.error);
}
```

## Backend Requirements

The payment service expects the following backend API endpoints:

### Stripe Endpoints

**POST /api/donations/create-intent**
- Creates a Stripe payment intent
- Request: `{ amount, currency, type, category, metadata }`
- Response: `{ clientSecret, donationId }`

**POST /api/donations/confirm**
- Confirms a successful payment
- Request: `{ paymentIntentId, donationId, donorInfo }`
- Response: `{ transactionId, receiptUrl, donation }`

### PayPal Endpoints

**POST /api/donations/paypal/create-order**
- Creates a PayPal order
- Request: `{ amount, currency, type, category, donorInfo }`
- Response: `{ orderId }`

**POST /api/donations/paypal/capture-order**
- Captures a PayPal order
- Request: `{ orderId }`
- Response: `{ transactionId, receiptUrl, donation }`

## Security Considerations

1. **Never store sensitive payment data** - Use Stripe Elements and PayPal SDK
2. **Use HTTPS only** - All payment requests must be over secure connections
3. **Validate on backend** - Always validate amounts and data on the server
4. **PCI Compliance** - Stripe and PayPal handle PCI compliance
5. **Rate limiting** - Implement rate limiting on backend endpoints
6. **CSRF protection** - Use CSRF tokens for payment requests

## Error Handling

The payment service provides comprehensive error handling:

1. **Network errors** - Retry mechanism with user feedback
2. **Validation errors** - Clear, actionable error messages
3. **Payment errors** - User-friendly messages for card declines, etc.
4. **Configuration errors** - Checks for missing API keys

All errors are logged for debugging and return user-friendly messages.

## Testing

### Test Mode

Both Stripe and PayPal provide test modes:

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

**PayPal Sandbox:**
- Use PayPal Sandbox accounts for testing
- Create test accounts at https://developer.paypal.com/dashboard/accounts

### Testing Checklist

- [ ] Successful one-time payment
- [ ] Successful recurring payment
- [ ] Card declined error handling
- [ ] Network error handling
- [ ] Amount validation
- [ ] Guest donation (not logged in)
- [ ] Authenticated user donation
- [ ] PayPal payment flow
- [ ] Receipt generation
- [ ] Email confirmation

## Next Steps

1. Implement backend API endpoints
2. Create donation form components
3. Integrate payment components
4. Add receipt generation
5. Implement email notifications
6. Add analytics tracking
7. Test payment flows
8. Security audit

## Support

For issues or questions:
- Stripe Documentation: https://stripe.com/docs
- PayPal Documentation: https://developer.paypal.com/docs
- React Stripe.js: https://stripe.com/docs/stripe-js/react
- React PayPal.js: https://paypal.github.io/react-paypal-js/

## License

This payment infrastructure is part of the Alumni Platform project.
