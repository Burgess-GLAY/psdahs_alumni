const Donation = require('../models/Donation');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Process a new donation
// @route   POST /api/donations
// @access  Private
exports.processDonation = async (req, res, next) => {
  try {
    const { amount, paymentMethod, purpose, isAnonymous, notes } = req.body;

    // In a real app, you would integrate with a payment processor here
    // For now, we'll simulate a successful payment
    const paymentResult = {
      success: true,
      transactionId: `txn_${Date.now()}`,
      receiptUrl: `https://example.com/receipts/txn_${Date.now()}`
    };

    const donation = await Donation.create({
      donor: isAnonymous ? null : req.user.id,
      amount,
      paymentMethod,
      purpose,
      isAnonymous,
      notes,
      transactionId: paymentResult.transactionId,
      receiptUrl: paymentResult.receiptUrl,
      paymentStatus: paymentResult.success ? 'completed' : 'failed'
    });

    // Update user's donation history if not anonymous
    if (!isAnonymous) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: { donations: donation._id },
        $inc: { totalDonated: amount }
      });
    }

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all donations (admin only)
// @route   GET /api/donations
// @access  Private/Admin
exports.getDonations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method, purpose } = req.query;
    const query = {};

    if (status) query.paymentStatus = status;
    if (method) query.paymentMethod = method;
    if (purpose) query.purpose = purpose;

    const donations = await Donation.find(query)
      .populate('donor', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Donation.countDocuments(query);

    res.json({
      success: true,
      count: donations.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: donations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
exports.getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName email');

    if (!donation) {
      return next(new ErrorResponse('Donation not found', 404));
    }

    // Only the donor or admin can view the donation
    if (donation.donor && donation.donor._id.toString() !== req.user.id && !req.user.isAdmin) {
      return next(new ErrorResponse('Not authorized to view this donation', 403));
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/user/me
// @access  Private
exports.getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .sort({ createdAt: -1 });

    const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

    res.json({
      success: true,
      count: donations.length,
      totalDonated,
      data: donations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update donation status (admin only)
// @route   PUT /api/donations/:id/status
// @access  Private/Admin
exports.updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true, runValidators: true }
    );

    if (!donation) {
      return next(new ErrorResponse('Donation not found', 404));
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Private/Admin
exports.getDonationStats = async (req, res, next) => {
  try {
    const stats = await Donation.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgDonation: { $avg: '$amount' },
          byMethod: { $push: { method: '$paymentMethod', amount: '$amount' } },
          byPurpose: { $push: { purpose: '$purpose', amount: '$amount' } }
        }
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          totalDonations: '$count',
          averageDonation: { $round: ['$avgDonation', 2] },
          byMethod: {
            $reduce: {
              input: '$byMethod',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        as: 'item',
                        cond: { $eq: ['$$item._id', '$$this.method'] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$existing' }, 0] },
                      {
                        $map: {
                          input: '$$value',
                          as: 'item',
                          in: {
                            $cond: [
                              { $eq: ['$$item._id', '$$this.method'] },
                              {
                                _id: '$$item._id',
                                count: { $add: ['$$item.count', 1] },
                                amount: { $add: ['$$item.amount', '$$this.amount'] }
                              },
                              '$$item'
                            ]
                          }
                        }
                      },
                      {
                        $concatArrays: [
                          '$$value',
                          [{
                            _id: '$$this.method',
                            count: 1,
                            amount: '$$this.amount'
                          }]
                        ]
                      }
                    ]
                  }
                }
              }
            }
          },
          byPurpose: {
            $reduce: {
              input: '$byPurpose',
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    existing: {
                      $filter: {
                        input: '$$value',
                        as: 'item',
                        cond: { $eq: ['$$item._id', '$$this.purpose'] }
                      }
                    }
                  },
                  in: {
                    $cond: [
                      { $gt: [{ $size: '$$existing' }, 0] },
                      {
                        $map: {
                          input: '$$value',
                          as: 'item',
                          in: {
                            $cond: [
                              { $eq: ['$$item._id', '$$this.purpose'] },
                              {
                                _id: '$$item._id',
                                count: { $add: ['$$item.count', 1] },
                                amount: { $add: ['$$item.amount', '$$this.amount'] }
                              },
                              '$$item'
                            ]
                          }
                        }
                      },
                      {
                        $concatArrays: [
                          '$$value',
                          [{
                            _id: '$$this.purpose',
                            count: 1,
                            amount: '$$this.amount'
                          }]
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        averageDonation: 0,
        byMethod: [],
        byPurpose: []
      }
    });
  } catch (err) {
    next(err);
  }
};

// Stripe Integration Endpoints

// @desc    Create Stripe payment intent
// @route   POST /api/donations/create-intent
// @access  Public
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', type, category, metadata } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return next(new ErrorResponse('Invalid donation amount', 400));
    }

    // Validate maximum amounts
    const maxOneTime = 10000;
    const maxRecurring = 5000;
    const maxAmount = type === 'recurring' ? maxRecurring : maxOneTime;

    if (amount > maxAmount) {
      return next(new ErrorResponse(`Maximum ${type} donation amount is $${maxAmount}`, 400));
    }

    // Initialize Stripe (requires stripe package)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        type,
        category,
        ...metadata,
      },
      description: `Donation - ${category || 'General'}`,
    });

    // Create pending donation record
    const donation = await Donation.create({
      donor: req.user?.id || null,
      amount,
      currency,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      transactionId: paymentIntent.id,
      purpose: category || 'general',
      isAnonymous: !req.user,
      metadata: {
        type,
        category,
        paymentIntentId: paymentIntent.id,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    next(new ErrorResponse('Failed to initialize payment', 500));
  }
};

// @desc    Confirm Stripe payment
// @route   POST /api/donations/confirm
// @access  Public
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, donationId, donorInfo } = req.body;

    if (!paymentIntentId || !donationId) {
      return next(new ErrorResponse('Missing required payment information', 400));
    }

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    // Update donation record
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        paymentStatus: 'completed',
        transactionId: paymentIntent.id,
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url || null,
        metadata: {
          ...donorInfo,
          paymentIntentId: paymentIntent.id,
          chargeId: paymentIntent.charges?.data[0]?.id,
        },
      },
      { new: true }
    );

    if (!donation) {
      return next(new ErrorResponse('Donation record not found', 404));
    }

    // Update user's donation history if authenticated
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $push: { donations: donation._id },
        $inc: { totalDonated: donation.amount },
      });
    }

    // TODO: Send receipt email
    // await sendReceiptEmail(donorInfo.email, donation);

    res.status(200).json({
      success: true,
      transactionId: donation.transactionId,
      receiptUrl: donation.receiptUrl,
      donation,
    });
  } catch (err) {
    console.error('Error confirming payment:', err);
    next(new ErrorResponse('Failed to confirm payment', 500));
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/donations/webhook
// @access  Public (Stripe webhook)
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        // Update donation status
        await Donation.findOneAndUpdate(
          { transactionId: paymentIntent.id },
          { paymentStatus: 'completed' }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log('PaymentIntent failed:', failedIntent.id);

        // Update donation status
        await Donation.findOneAndUpdate(
          { transactionId: failedIntent.id },
          { paymentStatus: 'failed' }
        );
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        console.log('Charge refunded:', refund.id);

        // Update donation status
        await Donation.findOneAndUpdate(
          { 'metadata.chargeId': refund.id },
          { paymentStatus: 'refunded' }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    next(err);
  }
};

// PayPal Integration Endpoints

// @desc    Create PayPal order
// @route   POST /api/donations/paypal/create-order
// @access  Public
exports.createPayPalOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', type, category, donorInfo } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return next(new ErrorResponse('Invalid donation amount', 400));
    }

    // Validate maximum amounts
    const maxOneTime = 10000;
    const maxRecurring = 5000;
    const maxAmount = type === 'recurring' ? maxRecurring : maxOneTime;

    if (amount > maxAmount) {
      return next(new ErrorResponse(`Maximum ${type} donation amount is $${maxAmount}`, 400));
    }

    // Initialize PayPal SDK
    const paypal = require('@paypal/checkout-server-sdk');

    // PayPal environment setup
    const environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
      : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

    const client = new paypal.core.PayPalHttpClient(environment);

    // Create order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Donation - ${category || 'General'}`,
        },
      ],
      application_context: {
        brand_name: 'Alumni Platform',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    });

    // Execute request
    const order = await client.execute(request);

    // Create pending donation record
    const donation = await Donation.create({
      donor: req.user?.id || null,
      amount,
      currency,
      paymentMethod: 'paypal',
      paymentStatus: 'pending',
      transactionId: order.result.id,
      purpose: category || 'general',
      isAnonymous: !req.user,
      metadata: {
        type,
        category,
        orderId: order.result.id,
        donorInfo,
      },
    });

    res.status(200).json({
      success: true,
      orderId: order.result.id,
      donationId: donation._id,
    });
  } catch (err) {
    console.error('Error creating PayPal order:', err);
    next(new ErrorResponse('Failed to create PayPal order', 500));
  }
};

// @desc    Capture PayPal order
// @route   POST /api/donations/paypal/capture-order
// @access  Public
exports.capturePayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return next(new ErrorResponse('Order ID is required', 400));
    }

    // Initialize PayPal SDK
    const paypal = require('@paypal/checkout-server-sdk');

    const environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
      : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

    const client = new paypal.core.PayPalHttpClient(environment);

    // Capture order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return next(new ErrorResponse('Payment not completed', 400));
    }

    // Find and update donation record
    const donation = await Donation.findOneAndUpdate(
      { transactionId: orderId },
      {
        paymentStatus: 'completed',
        receiptUrl: capture.result.purchase_units[0]?.payments?.captures[0]?.links?.find(
          link => link.rel === 'receipt'
        )?.href || null,
        metadata: {
          captureId: capture.result.purchase_units[0]?.payments?.captures[0]?.id,
          payerId: capture.result.payer?.payer_id,
          payerEmail: capture.result.payer?.email_address,
        },
      },
      { new: true }
    );

    if (!donation) {
      return next(new ErrorResponse('Donation record not found', 404));
    }

    // Update user's donation history if authenticated
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $push: { donations: donation._id },
        $inc: { totalDonated: donation.amount },
      });
    }

    // TODO: Send receipt email
    // await sendReceiptEmail(donation.metadata.donorInfo?.email, donation);

    res.status(200).json({
      success: true,
      transactionId: donation.transactionId,
      receiptUrl: donation.receiptUrl,
      donation,
    });
  } catch (err) {
    console.error('Error capturing PayPal order:', err);
    next(new ErrorResponse('Failed to capture PayPal payment', 500));
  }
};
