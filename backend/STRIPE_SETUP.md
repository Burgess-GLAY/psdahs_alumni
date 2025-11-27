# Stripe Backend Setup Guide

## Overview

This guide explains how to set up Stripe payment processing on the backend for the donation system.

## Prerequisites

1. Node.js and npm installed
2. MongoDB database running
3. Stripe account (sign up at https://stripe.com)

## Installation

### 1. Install Stripe Package

```bash
cd backend
npm install stripe
```

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Getting Your Stripe Keys

1. **Secret Key:**
   - Log in to your Stripe Dashboard
   - Navigate to Developers > API keys
   - Copy the "Secret key" (starts with `sk_test_` for test mode)
   - **IMPORTANT:** Never commit this key to version control!

2. **Webhook Secret:**
   - Navigate to Developers > Webhooks
   - Click "Add endpoint"
   - Enter your webhook URL: `https://yourdomain.com/api/donations/webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy the "Signing secret" (starts with `whsec_`)

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/donations/create-intent`

**Access:** Public (no authentication required for guest donations)

**Request Body:**
```json
{
  "amount": 100,
  "currency": "USD",
  "type": "one-time",
  "category": "scholarships",
  "metadata": {
    "donorName": "John Doe",
    "donorEmail": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "donationId": "64abc123def456789"
}
```

**What it does:**
- Validates the donation amount
- Creates a Stripe PaymentIntent
- Creates a pending donation record in the database
- Returns the client secret for frontend to complete payment

### 2. Confirm Payment

**Endpoint:** `POST /api/donations/confirm`

**Access:** Public

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "donationId": "64abc123def456789",
  "donorInfo": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "pi_xxx",
  "receiptUrl": "https://stripe.com/receipts/xxx",
  "donation": {
    "_id": "64abc123def456789",
    "amount": 100,
    "paymentStatus": "completed",
    ...
  }
}
```

**What it does:**
- Verifies the payment succeeded with Stripe
- Updates the donation record to "completed"
- Updates user's donation history (if authenticated)
- Returns transaction details and receipt URL

### 3. Webhook Handler

**Endpoint:** `POST /api/donations/webhook`

**Access:** Public (Stripe webhook)

**What it does:**
- Receives real-time events from Stripe
- Verifies webhook signature for security
- Updates donation status based on events:
  - `payment_intent.succeeded` → Mark as completed
  - `payment_intent.payment_failed` → Mark as failed
  - `charge.refunded` → Mark as refunded

## Database Schema Updates

The Donation model has been updated to support Stripe:

```javascript
{
  donor: ObjectId,              // User ID (null for guest donations)
  amount: Number,               // Donation amount
  currency: String,             // Currency code (default: USD)
  paymentMethod: String,        // 'credit_card' for Stripe
  paymentStatus: String,        // 'pending', 'completed', 'failed', 'refunded'
  transactionId: String,        // Stripe PaymentIntent ID
  receiptUrl: String,           // Stripe receipt URL
  isAnonymous: Boolean,         // True for guest donations
  purpose: String,              // Donation category
  metadata: Object,             // Additional data (donorInfo, etc.)
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

### 1. API Key Security

- **Never** expose your secret key in frontend code
- Store keys in environment variables only
- Use `.env` file and add it to `.gitignore`
- Use test keys for development, live keys for production

### 2. Webhook Security

- Always verify webhook signatures
- Use the webhook secret to validate requests
- Reject requests with invalid signatures

### 3. Amount Validation

- Validate amounts on the backend (don't trust frontend)
- Enforce minimum ($1) and maximum amounts
- Check for negative or invalid values

### 4. Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many donation attempts, please try again later'
});

router.post('/create-intent', donationLimiter, donationController.createPaymentIntent);
```

### 5. CORS Configuration

Ensure your CORS settings allow requests from your frontend:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## Testing

### Test Mode

Use Stripe test mode for development:

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`

**Test Amounts:**
- Any amount works in test mode
- Use cents (e.g., 100 = $1.00)

### Testing Webhooks Locally

Use Stripe CLI to test webhooks locally:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:5000/api/donations/webhook`
4. Use the webhook secret provided by the CLI

### Testing Checklist

- [ ] Create payment intent with valid amount
- [ ] Create payment intent with invalid amount (should fail)
- [ ] Confirm successful payment
- [ ] Handle declined card
- [ ] Handle network errors
- [ ] Verify webhook signature
- [ ] Test guest donation (no user logged in)
- [ ] Test authenticated user donation
- [ ] Verify donation record created
- [ ] Verify user donation history updated

## Error Handling

The endpoints handle various error scenarios:

1. **Invalid Amount:**
   - Response: 400 Bad Request
   - Message: "Invalid donation amount"

2. **Amount Too High:**
   - Response: 400 Bad Request
   - Message: "Maximum donation amount is $X"

3. **Stripe API Error:**
   - Response: 500 Internal Server Error
   - Message: "Failed to initialize payment"

4. **Payment Not Completed:**
   - Response: 400 Bad Request
   - Message: "Payment not completed"

5. **Donation Not Found:**
   - Response: 404 Not Found
   - Message: "Donation record not found"

## Monitoring and Logging

### Logging

All payment operations are logged:

```javascript
console.log('PaymentIntent created:', paymentIntent.id);
console.error('Error creating payment intent:', err);
```

### Stripe Dashboard

Monitor payments in the Stripe Dashboard:
- View all transactions
- Check payment status
- View refunds
- Monitor webhook events
- Download reports

## Production Deployment

### Before Going Live:

1. **Switch to Live Keys:**
   - Replace test keys with live keys
   - Update `STRIPE_SECRET_KEY` in production environment
   - Update webhook endpoint to production URL

2. **SSL Certificate:**
   - Ensure your domain has a valid SSL certificate
   - Stripe requires HTTPS for webhooks

3. **Webhook Configuration:**
   - Update webhook URL to production domain
   - Copy the new webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in production

4. **Testing:**
   - Test with real cards (small amounts)
   - Verify webhooks are received
   - Check email notifications work
   - Verify receipts are generated

5. **Monitoring:**
   - Set up error monitoring (e.g., Sentry)
   - Monitor Stripe Dashboard for issues
   - Set up alerts for failed payments

## Troubleshooting

### Common Issues:

1. **"Stripe publishable key is not configured"**
   - Check `STRIPE_SECRET_KEY` is set in `.env`
   - Restart the server after adding environment variables

2. **"Webhook signature verification failed"**
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint is receiving raw body (not parsed JSON)

3. **"Payment not completed"**
   - Check payment succeeded in Stripe Dashboard
   - Verify PaymentIntent status is "succeeded"

4. **"Donation record not found"**
   - Check database connection
   - Verify donation was created in create-intent step

## Additional Resources

- Stripe API Documentation: https://stripe.com/docs/api
- Stripe Node.js Library: https://github.com/stripe/stripe-node
- Stripe Testing: https://stripe.com/docs/testing
- Stripe Webhooks: https://stripe.com/docs/webhooks
- PCI Compliance: https://stripe.com/docs/security

## Support

For issues or questions:
- Check Stripe Dashboard logs
- Review server logs
- Contact Stripe support: https://support.stripe.com

## Next Steps

1. Install Stripe package: `npm install stripe`
2. Configure environment variables
3. Test with Stripe test cards
4. Set up webhook endpoint
5. Test complete payment flow
6. Implement receipt email sending
7. Add error monitoring
8. Deploy to production with live keys
