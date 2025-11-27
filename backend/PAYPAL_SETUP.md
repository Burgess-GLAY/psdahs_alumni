# PayPal Backend Setup Guide

## Overview

This guide explains how to set up PayPal payment processing on the backend for the donation system.

## Prerequisites

1. Node.js and npm installed
2. MongoDB database running
3. PayPal Business account (sign up at https://www.paypal.com/business)
4. PayPal Developer account (https://developer.paypal.com)

## Installation

### 1. Install PayPal SDK

```bash
cd backend
npm install @paypal/checkout-server-sdk
```

### 2. Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
NODE_ENV=development
```

### Getting Your PayPal Credentials

1. **Create a PayPal App:**
   - Log in to https://developer.paypal.com
   - Navigate to Dashboard > My Apps & Credentials
   - Click "Create App"
   - Enter an app name (e.g., "Alumni Platform Donations")
   - Click "Create App"

2. **Get Credentials:**
   - **Sandbox (Development):**
     - Copy the "Client ID" from the Sandbox section
     - Click "Show" next to "Secret" and copy it
     - Use these for development/testing
   
   - **Live (Production):**
     - Copy the "Client ID" from the Live section
     - Click "Show" next to "Secret" and copy it
     - Use these for production only

3. **Important:**
   - **NEVER** commit these credentials to version control
   - Store them in `.env` file only
   - Add `.env` to `.gitignore`

## API Endpoints

### 1. Create PayPal Order

**Endpoint:** `POST /api/donations/paypal/create-order`

**Access:** Public (no authentication required for guest donations)

**Request Body:**
```json
{
  "amount": 100,
  "currency": "USD",
  "type": "one-time",
  "category": "scholarships",
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
  "orderId": "8XY12345AB678901C",
  "donationId": "64abc123def456789"
}
```

**What it does:**
- Validates the donation amount
- Creates a PayPal order
- Creates a pending donation record in the database
- Returns the order ID for frontend to complete payment

### 2. Capture PayPal Order

**Endpoint:** `POST /api/donations/paypal/capture-order`

**Access:** Public

**Request Body:**
```json
{
  "orderId": "8XY12345AB678901C"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "8XY12345AB678901C",
  "receiptUrl": "https://www.paypal.com/activity/payment/xxx",
  "donation": {
    "_id": "64abc123def456789",
    "amount": 100,
    "paymentStatus": "completed",
    ...
  }
}
```

**What it does:**
- Captures the authorized PayPal payment
- Verifies the payment was completed
- Updates the donation record to "completed"
- Updates user's donation history (if authenticated)
- Returns transaction details and receipt URL

## PayPal SDK Setup

The backend uses the PayPal Checkout Server SDK which provides:

- Order creation and capture
- Sandbox and Live environment support
- Automatic authentication
- Error handling

### Environment Configuration

```javascript
const paypal = require('@paypal/checkout-server-sdk');

// Sandbox for development
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

// Live for production
const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);
```

## Database Schema

The Donation model supports PayPal with the following fields:

```javascript
{
  donor: ObjectId,              // User ID (null for guest donations)
  amount: Number,               // Donation amount
  currency: String,             // Currency code (default: USD)
  paymentMethod: String,        // 'paypal' for PayPal
  paymentStatus: String,        // 'pending', 'completed', 'failed', 'refunded'
  transactionId: String,        // PayPal Order ID
  receiptUrl: String,           // PayPal receipt URL
  isAnonymous: Boolean,         // True for guest donations
  purpose: String,              // Donation category
  metadata: Object,             // Additional data (orderId, captureId, etc.)
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

### 1. API Credentials Security

- **Never** expose your client secret in frontend code
- Store credentials in environment variables only
- Use `.env` file and add it to `.gitignore`
- Use Sandbox credentials for development, Live for production

### 2. Amount Validation

- Validate amounts on the backend (don't trust frontend)
- Enforce minimum ($1) and maximum amounts
- Check for negative or invalid values
- Validate currency codes

### 3. Order Verification

- Always verify order status before marking as complete
- Check that capture was successful
- Validate order belongs to your application

### 4. Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const paypalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many payment attempts, please try again later'
});

router.post('/paypal/create-order', paypalLimiter, donationController.createPayPalOrder);
```

## Testing

### Sandbox Testing

PayPal provides a Sandbox environment for testing:

1. **Create Sandbox Accounts:**
   - Go to https://developer.paypal.com/dashboard/accounts
   - Create a "Personal" account (buyer)
   - Create a "Business" account (seller)
   - Note the email and password for each

2. **Test Payments:**
   - Use Sandbox credentials in your `.env`
   - Make a test donation
   - Log in with Sandbox buyer account
   - Complete the payment
   - Verify in Sandbox Dashboard

3. **Sandbox Test Accounts:**
   - Personal (Buyer): Use generated email/password
   - Business (Seller): Your app receives payments here
   - View transactions in Sandbox Dashboard

### Testing Checklist

- [ ] Create PayPal order with valid amount
- [ ] Create PayPal order with invalid amount (should fail)
- [ ] Capture successful payment
- [ ] Handle cancelled payment
- [ ] Handle payment errors
- [ ] Verify donation record created
- [ ] Verify user donation history updated
- [ ] Test guest donation (no user logged in)
- [ ] Test authenticated user donation
- [ ] Verify receipt URL returned

## Error Handling

The endpoints handle various error scenarios:

1. **Invalid Amount:**
   - Response: 400 Bad Request
   - Message: "Invalid donation amount"

2. **Amount Too High:**
   - Response: 400 Bad Request
   - Message: "Maximum donation amount is $X"

3. **PayPal API Error:**
   - Response: 500 Internal Server Error
   - Message: "Failed to create PayPal order"

4. **Payment Not Completed:**
   - Response: 400 Bad Request
   - Message: "Payment not completed"

5. **Order Not Found:**
   - Response: 404 Not Found
   - Message: "Donation record not found"

## Common PayPal Error Codes

- `INSTRUMENT_DECLINED`: Payment method declined
- `PAYER_ACTION_REQUIRED`: Additional action needed
- `INTERNAL_SERVER_ERROR`: PayPal server error
- `INVALID_REQUEST`: Invalid request format
- `RESOURCE_NOT_FOUND`: Order not found or expired
- `UNPROCESSABLE_ENTITY`: Cannot process payment

## Monitoring and Logging

### Logging

All payment operations are logged:

```javascript
console.log('PayPal order created:', order.result.id);
console.error('Error creating PayPal order:', err);
```

### PayPal Dashboard

Monitor payments in the PayPal Dashboard:
- View all transactions
- Check payment status
- View refunds
- Download reports
- Manage disputes

## Production Deployment

### Before Going Live:

1. **Switch to Live Credentials:**
   - Replace Sandbox credentials with Live credentials
   - Update `PAYPAL_CLIENT_ID` in production environment
   - Update `PAYPAL_CLIENT_SECRET` in production environment
   - Set `NODE_ENV=production`

2. **SSL Certificate:**
   - Ensure your domain has a valid SSL certificate
   - PayPal requires HTTPS for production

3. **Business Account Verification:**
   - Verify your PayPal Business account
   - Complete all required business information
   - Link bank account for withdrawals

4. **Testing:**
   - Test with real PayPal accounts (small amounts)
   - Verify payments are received
   - Check email notifications work
   - Verify receipts are accessible

5. **Monitoring:**
   - Set up error monitoring (e.g., Sentry)
   - Monitor PayPal Dashboard for issues
   - Set up alerts for failed payments
   - Review transaction logs regularly

## Refunds

To process refunds (requires additional implementation):

```javascript
const paypal = require('@paypal/checkout-server-sdk');

const request = new paypal.payments.CapturesRefundRequest(captureId);
request.requestBody({
  amount: {
    value: '100.00',
    currency_code: 'USD'
  }
});

const refund = await client.execute(request);
```

## Webhooks (Optional)

For real-time payment notifications, set up webhooks:

1. **Create Webhook:**
   - Go to PayPal Developer Dashboard
   - Navigate to Webhooks
   - Add webhook URL: `https://yourdomain.com/api/donations/paypal/webhook`
   - Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

2. **Verify Webhook Signature:**
   - Use PayPal SDK to verify webhook signatures
   - Reject unverified webhooks

## Troubleshooting

### Common Issues:

1. **"PayPal is not configured"**
   - Check `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set in `.env`
   - Restart the server after adding environment variables

2. **"Failed to create PayPal order"**
   - Check credentials are correct
   - Verify you're using correct environment (Sandbox vs Live)
   - Check PayPal API status

3. **"Payment not completed"**
   - Check order was approved by user
   - Verify capture was successful
   - Check PayPal Dashboard for order status

4. **"Donation record not found"**
   - Check database connection
   - Verify donation was created in create-order step
   - Check order ID matches

## Currency Support

PayPal supports multiple currencies:

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- And many more...

Update the currency in the order creation:

```javascript
amount: {
  currency_code: 'EUR', // Change currency here
  value: amount.toFixed(2),
}
```

## Additional Resources

- PayPal Developer Docs: https://developer.paypal.com/docs
- PayPal Checkout SDK: https://github.com/paypal/Checkout-NodeJS-SDK
- PayPal Sandbox: https://developer.paypal.com/dashboard/accounts
- PayPal API Reference: https://developer.paypal.com/api/rest/
- PayPal Support: https://www.paypal.com/us/smarthelp/contact-us

## Support

For issues or questions:
- Check PayPal Dashboard logs
- Review server logs
- Contact PayPal Developer Support
- Check PayPal API status page

## Next Steps

1. Install PayPal SDK: `npm install @paypal/checkout-server-sdk`
2. Configure environment variables
3. Create Sandbox test accounts
4. Test payment flow
5. Implement receipt email sending
6. Add error monitoring
7. Deploy to production with Live credentials
8. Set up webhooks (optional)
