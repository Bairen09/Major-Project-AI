// src/services/ticket.service.js
// Handles all ticket business logic for both user-facing and staff-facing operations.

const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');
const Staff = require('../models/Staff');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const AppError = require('../errors/AppError');
const { TICKET_STATUS, TICKET_HEADERS } = require('../constants/ticket');
const { createNotification } = require('./notification.service');

// ─── Audit Log Helper ─────────────────────────────────────────────────────────

const writeAuditLog = async ({ action, userId, entityId, meta = {} }) => {
  try {
    await AuditLog.create({
      action,
      userId: userId || null,
      entity: 'Ticket',
      entityId,
      ipAddress: meta.ip || '',
      userAgent: meta.userAgent || '',
      requestId: meta.requestId || '',
      status: 'success',
    });
  } catch (err) {
    console.error(`[AuditLog] Failed to write "${action}" ticket log:`, err.message);
  }
};

// ─── User-facing: Get headers ─────────────────────────────────────────────────

const getHeaders = () => TICKET_HEADERS;

// ─── User-facing: Create ticket ───────────────────────────────────────────────

const createTicket = async ({ userId, header, description }, meta = {}) => {
  const ticket = await Ticket.create({
    userId,
    header,
    description,
    status: TICKET_STATUS.OPEN,
    lastActivityAt: new Date(),
  });

  // Auto-assign to the single master support account
  const masterStaff = await Staff.findOne({ isActive: true });
  if (masterStaff) {
    ticket.assignedTo = masterStaff._id;
    ticket.status = TICKET_STATUS.IN_PROGRESS; // Auto-transition since it's assigned
    await ticket.save();
    
    await Staff.updateOne(
      { _id: masterStaff._id },
      { $inc: { assignedTicketCount: 1 } }
    );
  }

  // Add the first message (the description itself) so the thread has content
  await TicketMessage.create({
    ticketId: ticket._id,
    senderType: 'user',
    senderId: userId,
    message: description,
  });

  await writeAuditLog({ action: 'TICKET_CREATED', userId, entityId: ticket._id, meta });

  // Notify the user (ticket creator)
  await createNotification({
    userId,
    title: 'Support Ticket Created',
    message: `Your ticket "${header}" has been submitted. Our support team will respond shortly.`,
    type: 'info',
    entityType: 'Ticket',
    entityId: ticket._id,
  });

  return ticket.toJSON();
};

// ─── User-facing: List own tickets ───────────────────────────────────────────

const listUserTickets = async (userId, { page = 1, limit = 20, status } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const filter = { userId };
  if (status && TICKET_STATUS[status]) {
    filter.status = status;
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ lastActivityAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('assignedTo', 'name avatarUrl role'),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets: tickets.map(t => t.toJSON()),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// ─── User-facing: Get ticket + thread ─────────────────────────────────────────

const getUserTicketById = async (ticketId, userId) => {
  const ticket = await Ticket.findOne({ _id: ticketId, userId })
    .populate('assignedTo', 'name avatarUrl role');

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  const messages = await TicketMessage.find({ ticketId }).sort({ createdAt: 1 });

  return {
    ticket: ticket.toJSON(),
    messages: messages.map(m => m.toJSON()),
  };
};

// ─── User-facing: Add message ─────────────────────────────────────────────────

const addUserMessage = async ({ ticketId, userId, message }, meta = {}) => {
  const ticket = await Ticket.findOne({ _id: ticketId, userId });

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw new AppError('Cannot reply to a closed ticket.', 400);
  }

  const newMessage = await TicketMessage.create({
    ticketId,
    senderType: 'user',
    senderId: userId,
    message,
  });

  // Auto-flip PENDING_USER → IN_PROGRESS when user replies
  let statusChanged = false;
  if (ticket.status === TICKET_STATUS.PENDING_USER) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
    statusChanged = true;
  }

  // Also re-open if user replies to a RESOLVED ticket
  if (ticket.status === TICKET_STATUS.RESOLVED) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
    statusChanged = true;
  }

  ticket.lastActivityAt = new Date();
  await ticket.save();

  if (statusChanged) {
    await writeAuditLog({ action: 'TICKET_STATUS_CHANGED', userId, entityId: ticket._id, meta });
  }

  // Notify assigned staff
  if (ticket.assignedTo) {
    // Pull-based: we cannot notify a Staff document via Notification (userId → User ref).
    // Staff will see unread messages on their inbox on next login. V1 scope.
  }

  return newMessage.toJSON();
};

// ─── User-facing: Close ticket ────────────────────────────────────────────────

const closeTicket = async ({ ticketId, userId }, meta = {}) => {
  const ticket = await Ticket.findOne({ _id: ticketId, userId });

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw new AppError('Ticket is already closed.', 400);
  }

  ticket.status = TICKET_STATUS.CLOSED;
  ticket.closedAt = new Date();
  ticket.lastActivityAt = new Date();
  await ticket.save();

  await writeAuditLog({ action: 'TICKET_CLOSED_BY_USER', userId, entityId: ticket._id, meta });

  return ticket.toJSON();
};

// ─── Staff-facing: List tickets ───────────────────────────────────────────────

const listStaffTickets = async (staffId, { page = 1, limit = 20, status, assignedTo } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (status && TICKET_STATUS[status]) {
    filter.status = status;
  }

  if (assignedTo === 'me') {
    filter.assignedTo = staffId;
  } else if (assignedTo === 'unassigned') {
    filter.assignedTo = null;
  }
  // 'all' means no filter on assignedTo

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ lastActivityAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('userId', 'name email avatarUrl')
      .populate('assignedTo', 'name avatarUrl role'),
    Ticket.countDocuments(filter),
  ]);

  return {
    tickets: tickets.map(t => t.toJSON()),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

// ─── Staff-facing: Get ticket + thread ────────────────────────────────────────

const getStaffTicketById = async (ticketId) => {
  const ticket = await Ticket.findById(ticketId)
    .populate('userId', 'name email avatarUrl')
    .populate('assignedTo', 'name avatarUrl role');

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  const messages = await TicketMessage.find({ ticketId }).sort({ createdAt: 1 });

  return {
    ticket: ticket.toJSON(),
    messages: messages.map(m => m.toJSON()),
  };
};

// ─── Staff-facing: Assign ticket ──────────────────────────────────────────────

const assignTicket = async ({ ticketId, assigneeId, requestingStaff }, meta = {}) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  const { STAFF_ROLES } = require('../constants/ticket');

  // Only LEAD_SUPPORT can assign to others; regular support can only assign to self
  if (
    assigneeId.toString() !== requestingStaff.id.toString() &&
    requestingStaff.role !== STAFF_ROLES.LEAD_SUPPORT
  ) {
    throw new AppError('Only lead support staff can reassign tickets to others.', 403);
  }

  const targetStaff = await Staff.findById(assigneeId);
  if (!targetStaff || !targetStaff.isActive) {
    throw new AppError('Target staff member not found or inactive.', 404);
  }

  // Decrement old assignee's count
  if (ticket.assignedTo && ticket.assignedTo.toString() !== assigneeId.toString()) {
    await Staff.updateOne(
      { _id: ticket.assignedTo },
      { $inc: { assignedTicketCount: -1 } }
    );
  }

  // Auto-transition OPEN → IN_PROGRESS on assignment
  if (ticket.status === TICKET_STATUS.OPEN) {
    ticket.status = TICKET_STATUS.IN_PROGRESS;
  }

  ticket.assignedTo = assigneeId;
  ticket.lastActivityAt = new Date();
  await ticket.save();

  // Increment new assignee's count
  await Staff.updateOne({ _id: assigneeId }, { $inc: { assignedTicketCount: 1 } });

  await writeAuditLog({
    action: 'TICKET_ASSIGNED',
    userId: requestingStaff.id,
    entityId: ticket._id,
    meta,
  });

  // Notify the user
  await createNotification({
    userId: ticket.userId,
    title: 'Support Agent Assigned',
    message: `A support agent has been assigned to your ticket: "${ticket.header}".`,
    type: 'info',
    entityType: 'Ticket',
    entityId: ticket._id,
  });

  return ticket.toJSON();
};

// ─── Staff-facing: Update status ──────────────────────────────────────────────

const updateTicketStatus = async ({ ticketId, status, staffId }, meta = {}) => {
  const ALLOWED_STAFF_STATUSES = [
    TICKET_STATUS.IN_PROGRESS,
    TICKET_STATUS.PENDING_USER,
    TICKET_STATUS.RESOLVED,
  ];

  if (!ALLOWED_STAFF_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Staff can set: ${ALLOWED_STAFF_STATUSES.join(', ')}.`,
      400
    );
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw new AppError('Cannot change status of a closed ticket.', 400);
  }

  const previousStatus = ticket.status;
  ticket.status = status;
  ticket.lastActivityAt = new Date();

  // If the ticket is currently unassigned, auto-assign it to the staff updating its status
  if (!ticket.assignedTo && staffId) {
    ticket.assignedTo = staffId;
    // We only increment the count if it's not immediately being resolved/closed
    if (status !== TICKET_STATUS.RESOLVED && status !== TICKET_STATUS.CLOSED) {
      await Staff.updateOne({ _id: staffId }, { $inc: { assignedTicketCount: 1 } });
    }
  }

  if (status === TICKET_STATUS.RESOLVED) {
    ticket.resolvedAt = new Date();

    // Decrement staff counter if it was previously assigned
    // (If it was just auto-assigned above, we didn't increment it, so no need to decrement)
    if (ticket.assignedTo && previousStatus !== TICKET_STATUS.OPEN) {
      await Staff.updateOne(
        { _id: ticket.assignedTo },
        { $inc: { assignedTicketCount: -1 } }
      );
    }

    // Notify user
    await createNotification({
      userId: ticket.userId,
      title: 'Ticket Resolved',
      message: `Your support ticket "${ticket.header}" has been resolved. You can confirm by closing it or reply to reopen.`,
      type: 'success',
      entityType: 'Ticket',
      entityId: ticket._id,
    });
  }

  await ticket.save();

  await writeAuditLog({
    action: `TICKET_STATUS_CHANGED_TO_${status}`,
    userId: staffId,
    entityId: ticket._id,
    meta,
  });

  return ticket.toJSON();
};

// ─── Staff-facing: Add message ────────────────────────────────────────────────

const addStaffMessage = async ({ ticketId, staffId, message }, meta = {}) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found.', 404);
  }

  if (ticket.status === TICKET_STATUS.CLOSED) {
    throw new AppError('Cannot reply to a closed ticket.', 400);
  }

  const newMessage = await TicketMessage.create({
    ticketId,
    senderType: 'staff',
    senderId: staffId,
    message,
  });

  ticket.lastActivityAt = new Date();
  await ticket.save();

  // Notify the ticket owner
  await createNotification({
    userId: ticket.userId,
    title: 'New Reply on Your Ticket',
    message: `A support agent replied to your ticket: "${ticket.header}".`,
    type: 'info',
    entityType: 'Ticket',
    entityId: ticket._id,
  });

  return newMessage.toJSON();
};

// ─── Staff-facing: Own stats ──────────────────────────────────────────────────

const getStaffStats = async (staffId) => {
  const mongoose = require('mongoose');
  const staffObjectId = new mongoose.Types.ObjectId(staffId);

  const [byCounts, ticketsToday, avgResolutionDocs] = await Promise.all([
    // Count by status for this staff member
    Ticket.aggregate([
      { $match: { assignedTo: staffObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // Tickets assigned to this staff today
    Ticket.countDocuments({
      assignedTo: staffId,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    // Average resolution time (in hours) for resolved tickets by this staff
    Ticket.aggregate([
      {
        $match: {
          assignedTo: staffObjectId,
          status: { $in: [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] },
          resolvedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionMs: { $subtract: ['$resolvedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionMs: { $avg: '$resolutionMs' },
        },
      },
    ]),
  ]);

  const statusCounts = {};
  byCounts.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  const avgResolutionHours =
    avgResolutionDocs.length > 0
      ? Math.round(avgResolutionDocs[0].avgResolutionMs / 1000 / 60 / 60)
      : null;

  return {
    statusCounts,
    ticketsToday,
    avgResolutionHours,
  };
};

// ─── Admin-facing: Platform ticket stats ──────────────────────────────────────

const getAdminTicketStats = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalCounts,
    unassignedCount,
    perStaff,
    last7Days,
    last30Days,
    avgResolution,
  ] = await Promise.all([
    // Total by status
    Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // Unassigned open tickets
    Ticket.countDocuments({ assignedTo: null, status: TICKET_STATUS.OPEN }),
    // Tickets per staff member
    Ticket.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', total: { $sum: 1 } } },
      {
        $lookup: {
          from: 'staffs',
          localField: '_id',
          foreignField: '_id',
          as: 'staff',
        },
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          staffName: '$staff.name',
          staffEmail: '$staff.email',
          total: 1,
        },
      },
    ]),
    // Tickets created last 7 days (daily breakdown)
    Ticket.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Tickets created last 30 days total
    Ticket.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    // Platform-wide avg resolution
    Ticket.aggregate([
      {
        $match: {
          status: { $in: [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED] },
          resolvedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionMs: { $subtract: ['$resolvedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionMs: { $avg: '$resolutionMs' },
        },
      },
    ]),
  ]);

  const statusCounts = {};
  totalCounts.forEach(({ _id, count }) => {
    statusCounts[_id] = count;
  });

  const avgResolutionHours =
    avgResolution.length > 0
      ? Math.round(avgResolution[0].avgResolutionMs / 1000 / 60 / 60)
      : null;

  return {
    statusCounts,
    unassignedCount,
    perStaff,
    last7Days,
    last30DaysTotal: last30Days,
    avgResolutionHours,
  };
};

module.exports = {
  getHeaders,
  createTicket,
  listUserTickets,
  getUserTicketById,
  addUserMessage,
  closeTicket,
  listStaffTickets,
  getStaffTicketById,
  assignTicket,
  updateTicketStatus,
  addStaffMessage,
  getStaffStats,
  getAdminTicketStats,
};
