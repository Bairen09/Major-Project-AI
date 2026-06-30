const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null,
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: [true, 'Notification type is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  entityType: {
    type: String,
    default: null,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

notificationSchema.plugin(basePlugin);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
