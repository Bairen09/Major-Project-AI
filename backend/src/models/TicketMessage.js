// src/models/TicketMessage.js

const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');

const ticketMessageSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: [true, 'Ticket is required'],
    index: true,
  },
  senderType: {
    type: String,
    enum: ['user', 'staff'],
    required: [true, 'Sender type is required'],
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Sender is required'],
    // Refs dynamically to either User or Staff depending on senderType
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [1, 'Message cannot be empty'],
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
  },
});

// Index for paginating message threads efficiently
ticketMessageSchema.index({ ticketId: 1, createdAt: 1 });

ticketMessageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

ticketMessageSchema.plugin(basePlugin);

const TicketMessage = mongoose.model('TicketMessage', ticketMessageSchema);
module.exports = TicketMessage;
