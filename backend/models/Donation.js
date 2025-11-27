const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'mobile_money', 'other']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true
  },
  receiptUrl: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    enum: ['general', 'scholarship', 'infrastructure', 'event', 'other'],
    default: 'general'
  },
  notes: String,
  metadata: {}
}, {
  timestamps: true
});

// Indexes for better query performance
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
