const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const sendEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/jwt');
const { PASSWORD_RESET_EXPIRY_MINUTES } = require('../constants/auth');

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, userId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId,
      entity: 'User',
      entityId,
      ipAddress: meta.ip || '',
      userAgent: meta.userAgent || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    console.error(`[AuditLog] Failed to write "${action}" log:`, err.message);
  }
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = async ({ name, email, password }, meta = {}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email: normalizedEmail, password });

  await writeAuditLog({
    action: 'USER_REGISTERED',
    userId: user._id,
    entityId: user._id,
    meta,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: user.toJSON(),
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async ({ email, password }, meta = {}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'DELETED') {
    throw new AppError('Your account has been deactivated or suspended.', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  await writeAuditLog({
    action: 'USER_LOGIN',
    userId: user._id,
    entityId: user._id,
    meta,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return {
    user: user.toJSON(),
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
};

// ─── Forgot Password ─────────────────────────────────────────────────────────

const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Always resolve — never reveal whether the email exists
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000
  );

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'LocalBoost AI — Password Reset Request',
      text: `You requested a password reset.\n\nClick the link below to reset your password. This link expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes.\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'Failed to send password reset email. Please try again later.',
      500
    );
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = async ({ token, password }, meta = {}) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Reset token is invalid or has expired.', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await writeAuditLog({
    action: 'PASSWORD_RESET',
    userId: user._id,
    entityId: user._id,
    meta,
  });

  return { message: 'Password has been reset successfully.' };
};

// ─── Me ──────────────────────────────────────────────────────────────────────

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user.toJSON();
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
