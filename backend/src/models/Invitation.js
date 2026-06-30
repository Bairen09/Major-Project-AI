const mongoose = require('mongoose');
const ROLES = require('../constants/roles');

const invitationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.VIEWER,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'pending_registration'],
    default: 'pending',
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Invitation = mongoose.model('Invitation', invitationSchema);
module.exports = Invitation;
