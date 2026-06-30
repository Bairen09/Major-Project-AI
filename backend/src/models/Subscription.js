const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const PLANS = require('../constants/plans');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required'],
    index: true,
  },
  plan: {
    type: String,
    enum: Object.values(PLANS),
    default: PLANS.STARTER,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'trial',
  },
  // Stripe fields — empty for now, populated in Sprint 9
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  currentPeriodStart: {
    type: Date,
    default: null,
  },
  currentPeriodEnd: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
});

// Indexes
subscriptionSchema.index({ userId: 1, businessId: 1 });

subscriptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

subscriptionSchema.plugin(basePlugin);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
