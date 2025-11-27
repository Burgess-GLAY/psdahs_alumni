const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const donationController = require('../controllers/donationController');

// Create/process a donation (simulated)
router.post('/', protect, donationController.processDonation);

// Admin: list donations and stats
router.get('/', [protect, admin], donationController.getDonations);
router.get('/stats', [protect, admin], donationController.getDonationStats);

// FIXED: Current user donations (must come before /:id route)
router.get('/user/me', protect, donationController.getMyDonations);

// Get donation by id (donor or admin)
router.get('/:id', protect, donationController.getDonationById);

// Admin: update donation status
router.put('/:id/status', [protect, admin], donationController.updateDonationStatus);

// Stripe payment endpoints
router.post('/create-intent', donationController.createPaymentIntent);
router.post('/confirm', donationController.confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), donationController.handleStripeWebhook);

// PayPal payment endpoints
router.post('/paypal/create-order', donationController.createPayPalOrder);
router.post('/paypal/capture-order', donationController.capturePayPalOrder);

module.exports = router;
