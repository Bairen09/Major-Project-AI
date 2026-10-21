// src/services/supportAuth.service.js
// Staff authentication service — completely isolated from user auth.service.js

const Staff = require('../models/Staff');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');
const { signStaffToken } = require('../utils/jwt');

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, staffId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId: null, // staff is not a User document
      entity: 'Staff',
      entityId,
      ipAddress: meta.ip || '',
      userAgent: meta.userAgent || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    console.error(`[AuditLog] Failed to write "${action}" staff log:`, err.message);
  }
};

// ─── Staff Login ──────────────────────────────────────────────────────────────

const login = async ({ email, password }, meta = {}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const staff = await Staff.findOne({ email: normalizedEmail }).select('+password');

  if (!staff || !(await staff.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!staff.isActive) {
    throw new AppError('Your staff account has been deactivated. Please contact a superadmin.', 403);
  }

  staff.lastLoginAt = new Date();
  await staff.save({ validateBeforeSave: false });

  await writeAuditLog({
    action: 'STAFF_LOGIN',
    staffId: staff._id,
    entityId: staff._id,
    meta,
  });

  const token = signStaffToken({ id: staff._id, role: staff.role });

  return {
    staff: staff.toJSON(),
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
};

// ─── Get current staff profile ────────────────────────────────────────────────

const getMe = async (staffId) => {
  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new AppError('Staff account not found.', 404);
  }

  return staff.toJSON();
};

module.exports = { login, getMe };
