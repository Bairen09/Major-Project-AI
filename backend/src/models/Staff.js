// src/models/Staff.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const basePlugin = require('./plugins/basePlugin');
const { STAFF_ROLES } = require('../constants/ticket');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(STAFF_ROLES),
    default: STAFF_ROLES.SUPPORT,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastActive: {
    type: Date,
    default: null,
  },
  assignedTicketCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// Indexes
staffSchema.index({ isActive: 1 });

// Hash password before saving
staffSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Remove sensitive fields from JSON output
staffSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  },
});

// Compare password instance method
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

staffSchema.plugin(basePlugin);

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
