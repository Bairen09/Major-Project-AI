// src/models/PromptHistory.js

const mongoose = require('mongoose');
const PLATFORMS = require('../constants/platforms');

const promptHistorySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    platform: {
      type: String,
      enum: Object.values(PLATFORMS),
      required: [true, 'Platform is required'],
    },
    goal: {
      type: String,
      required: [true, 'Goal is required'],
      trim: true,
    },
    tone: {
      type: String,
      required: [true, 'Tone is required'],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    count: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    reuseCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
promptHistorySchema.index({ businessId: 1, createdAt: -1 });
promptHistorySchema.index({ businessId: 1, favorite: 1 });
promptHistorySchema.index({ userId: 1, createdAt: -1 });

promptHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const PromptHistory = mongoose.model('PromptHistory', promptHistorySchema);
module.exports = PromptHistory;
