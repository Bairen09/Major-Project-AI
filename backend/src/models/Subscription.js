const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');

const subscriptionSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    unique: true,
  },
  planKey: {
    type: String,
    enum: ['FREE', 'STARTER', 'PRO', 'AGENCY'],
    default: 'FREE',
  },
  status: {
    type: String,
    enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: [true, 'expiresAt is required'],
    default: function() {
      // Default 30 days from startDate
      const start = this.startDate || Date.now();
      return new Date(start.valueOf() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  postsUsedToday: {
    type: Number,
    default: 0,
  },
  postsCountResetAt: {
    type: Date,
    default: Date.now,
  },
  reminderSentAt: {
    type: Date,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
});

subscriptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

subscriptionSchema.plugin(basePlugin);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
