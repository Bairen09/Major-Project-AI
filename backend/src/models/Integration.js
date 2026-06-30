const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');

// OAuth tokens and credentials deferred to Sprint 8
// This model is a placeholder skeleton only

const integrationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required'],
    index: true,
  },
  provider: {
    type: String,
    enum: ['instagram', 'facebook', 'google'],
    required: [true, 'Provider is required'],
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'pending'],
    default: 'disconnected',
  },
  connectedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Indexes
integrationSchema.index({ businessId: 1, provider: 1 }, { unique: true });

integrationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

integrationSchema.plugin(basePlugin);

const Integration = mongoose.model('Integration', integrationSchema);
module.exports = Integration;
