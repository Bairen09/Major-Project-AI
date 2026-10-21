// src/services/adminStaff.service.js
// Superadmin operations for managing staff accounts.

const Staff = require('../models/Staff');
const AuditLog = require('../models/AuditLog');
const AppError = require('../errors/AppError');

const writeAuditLog = async ({ action, adminUserId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId: adminUserId || null,
      entity: 'Staff',
      entityId,
      ipAddress: meta.ip || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    console.error(`[AuditLog] Failed to write admin staff log:`, err.message);
  }
};

// ─── Create staff account ──────────────────────────────────────────────────────

const createStaff = async ({ name, email, password, role }, adminUserId, meta = {}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await Staff.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('A staff account with this email already exists.', 409);
  }

  const { STAFF_ROLES } = require('../constants/ticket');
  const validRole = role && Object.values(STAFF_ROLES).includes(role) ? role : STAFF_ROLES.SUPPORT;

  const staff = await Staff.create({
    name,
    email: normalizedEmail,
    password,
    role: validRole,
    createdBy: adminUserId,
  });

  await writeAuditLog({
    action: 'STAFF_ACCOUNT_CREATED',
    adminUserId,
    entityId: staff._id,
    meta,
  });

  return staff.toJSON();
};

// ─── List all staff ────────────────────────────────────────────────────────────

const listStaff = async ({ page = 1, limit = 20, isActive } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};
  if (isActive === 'true') filter.isActive = true;
  if (isActive === 'false') filter.isActive = false;

  const [staff, total] = await Promise.all([
    Staff.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('createdBy', 'name email'),
    Staff.countDocuments(filter),
  ]);

  return {
    staff: staff.map(s => s.toJSON()),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// ─── Update staff status (activate / suspend) ─────────────────────────────────

const updateStaffStatus = async (staffId, isActive, adminUserId, meta = {}) => {
  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new AppError('Staff account not found.', 404);
  }

  staff.isActive = isActive;
  await staff.save();

  await writeAuditLog({
    action: isActive ? 'STAFF_ACCOUNT_ACTIVATED' : 'STAFF_ACCOUNT_SUSPENDED',
    adminUserId,
    entityId: staff._id,
    meta,
  });

  return staff.toJSON();
};

// ─── Soft-delete staff account ─────────────────────────────────────────────────

const deleteStaff = async (staffId, adminUserId, meta = {}) => {
  const staff = await Staff.findById(staffId);

  if (!staff) {
    throw new AppError('Staff account not found.', 404);
  }

  staff.email = `${staff.email}_deleted_${Date.now()}`;
  staff.isActive = false;
  await staff.save({ validateBeforeSave: false });

  await staff.softDelete(adminUserId);

  await writeAuditLog({
    action: 'STAFF_ACCOUNT_DELETED',
    adminUserId,
    entityId: staff._id,
    meta,
  });

  return { success: true };
};

module.exports = {
  createStaff,
  listStaff,
  updateStaffStatus,
  deleteStaff,
};
