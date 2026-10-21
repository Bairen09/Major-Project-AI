// src/models/Ticket.js

const mongoose = require('mongoose');
const basePlugin = require('./plugins/basePlugin');
const { TICKET_HEADERS, TICKET_STATUS } = require('../constants/ticket');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  header: {
    type: String,
    enum: {
      values: TICKET_HEADERS,
      message: 'Invalid ticket header. Please select from the provided list.',
    },
    required: [true, 'Ticket header is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.OPEN,
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null,
    index: true,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  lastActivityAt: {
    type: Date,
    default: () => new Date(),
    index: true,
  },
});

// Compound indexes for common queries
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, lastActivityAt: -1 });

ticketSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

ticketSchema.plugin(basePlugin);

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
