const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const basePlugin = require('./plugins/basePlugin');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema({
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
    enum: Object.values(ROLES),
    default: ROLES.OWNER,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'DELETED'],
    default: 'ACTIVE',
  },
  platformRole: {
    type: String,
    enum: ['USER', 'SUPER_ADMIN'],
    default: 'USER',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  avatar: {
    url: String,
    publicId: String
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  lastActive: {
    type: Date,
    default: null,
  },
});



// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Remove sensitive fields from JSON output automatically
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    delete ret.isDeleted;
    delete ret.createdBy;
    delete ret.updatedBy;
    return ret;
  },
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.plugin(basePlugin);

const User = mongoose.model('User', userSchema);
module.exports = User;
