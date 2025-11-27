# Payment Infrastructure Quick Start Guide

## Setup Checklist

- [x] Install dependencies (`@stripe/stripe-js`, `@stripe/react-stripe-js`, `@paypal/react-paypal-js`)
- [x] Configure environment variables in `frontend/.env`
- [x] Create payment service utilities
- [ ] Obtain real API keys from Stripe and PayPal
- [ ] Implement backend API endpoints
- [ ] Create payment form components
- [ ] Test payment flows

## Quick Configuration

### 1. Get API Keys

**Stripe (Test Mode):**
```
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key" (starts with pk_test_)
3. Add to .env: REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**PayPal (Sandbox):**
```
1. Go to https://developer.paypal.com/dashboard/applications
2. Create a new app or use existing
3. Copy "Client ID" from app credentials
4. Add to .env: REACT_APP_PAYPAL_CLIENT_ID=...
```

### 2. Update Environment Variables

Replace placeholder values in `frontend/.env`:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
REACT_APP_PAYPAL_CLIENT_ID=AaBbCc123...
```

### 3. Verify Setup

Run this check in your component:

```javascript
import { getPaymentConfig } from '../services/paymentService';

const config = getPaymentConfig();
console.log('Stripe enabled:', config.stripe.enabled);
console.log('PayPal enabled:', config.paypal.enabled);
```

## Basic Usage

### Stripe Payment Component

```javascript
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../services/paymentService';

const stripePromise = getStripe();

function DonationPage() {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm />
    </Elements>
  );
}
```

### PayPal Payment Component

```javascript
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalOptions } from '../utils/paypalHelpers';

function DonationPage() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalPaymentButton />
    </PayPalScriptProvider>
  );
}
```

## Test Cards (Stripe)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |

Use any future expiry date and any 3-digit CVC.

## Common Issues

### "Stripe is not configured"
- Check that `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Restart development server after changing `.env`
- Verify key starts with `pk_test_` or `pk_live_`

### "PayPal client ID is missing"
- Check that `REACT_APP_PAYPAL_CLIENT_ID` is set in `.env`
- Restart development server after changing `.env`
- Verify client ID is from PayPal Developer Dashboard

### Payment fails immediately
- Check backend API endpoints are implemented
- Verify API_URL is correct in `.env`
- Check browser console for detailed error messages

## Files Created

```
frontend/src/
├── services/
│   ├── paymentService.js              # Main payment service
│   ├── PAYMENT_SETUP.md               # Detailed documentation
│   └── PAYMENT_QUICK_START.md         # This file
├── utils/
│   ├── stripeHelpers.js               # Stripe utilities
│   └── paypalHelpers.js               # PayPal utilities
└── constants/
    └── paymentConstants.js            # Payment constants
```

## Next Steps

1. **Get real API keys** - Replace placeholder values in `.env`
2. **Implement backend** - Create the required API endpoints
3. **Build components** - Create donation form and payment components
4. **Test thoroughly** - Test all payment scenarios
5. **Security review** - Ensure PCI compliance and security best practices

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Documentation](https://developer.paypal.com/docs)
- [Payment Setup Guide](./PAYMENT_SETUP.md)
- [Task List](.kiro/specs/donate-page/tasks.md)

## Support

If you encounter issues:
1. Check the detailed [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) guide
2. Review browser console for error messages
3. Verify environment variables are set correctly
4. Ensure backend endpoints are implemented
