const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const CAMPAIGN_GOALS = require('../constants/campaignGoals');

const campaignSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required'],
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  goal: {
    type: String,
    enum: Object.values(CAMPAIGN_GOALS),
    required: [true, 'Campaign goal is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft',
    index: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  postCount: {
    type: Number,
    default: 0,
  },
});

// Indexes
campaignSchema.index({ businessId: 1, status: 1 });
campaignSchema.index({ businessId: 1, createdAt: -1 });

campaignSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

campaignSchema.plugin(basePlugin);

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;
