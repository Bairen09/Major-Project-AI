const mongoose = require('mongoose');

// AuditLog intentionally does NOT use basePlugin
// Audit logs are never soft deleted and never filtered

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    entity: {
      type: String,
      required: [true, 'Entity is required'],
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    changes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    requestId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ businessId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

auditLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
