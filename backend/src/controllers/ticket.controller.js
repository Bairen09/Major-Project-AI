// src/controllers/ticket.controller.js

const ticketService = require('../services/ticket.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ─── User-facing ──────────────────────────────────────────────────────────────

exports.getHeaders = (req, res, next) => {
  try {
    const headers = ticketService.getHeaders();
    sendSuccess(res, 'Ticket headers retrieved', { headers });
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const meta = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.requestId,
    };
    const ticket = await ticketService.createTicket(
      { userId: req.user.id, ...req.body },
      meta
    );
    sendCreated(res, 'Support ticket created successfully', { ticket });
  } catch (err) {
    next(err);
  }
};

exports.listUserTickets = async (req, res, next) => {
  try {
    const data = await ticketService.listUserTickets(req.user.id, req.query);
    sendSuccess(res, 'Tickets retrieved', data);
  } catch (err) {
    next(err);
  }
};

exports.getUserTicketById = async (req, res, next) => {
  try {
    const data = await ticketService.getUserTicketById(req.params.id, req.user.id);
    sendSuccess(res, 'Ticket retrieved', data);
  } catch (err) {
    next(err);
  }
};

exports.addUserMessage = async (req, res, next) => {
  try {
    const meta = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.requestId,
    };
    const message = await ticketService.addUserMessage(
      { ticketId: req.params.id, userId: req.user.id, message: req.body.message },
      meta
    );
    sendCreated(res, 'Message sent', { message });
  } catch (err) {
    next(err);
  }
};

exports.closeTicket = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const ticket = await ticketService.closeTicket(
      { ticketId: req.params.id, userId: req.user.id },
      meta
    );
    sendSuccess(res, 'Ticket closed', { ticket });
  } catch (err) {
    next(err);
  }
};

// ─── Staff-facing ─────────────────────────────────────────────────────────────

exports.listStaffTickets = async (req, res, next) => {
  try {
    const data = await ticketService.listStaffTickets(req.staff.id, req.query);
    sendSuccess(res, 'Tickets retrieved', data);
  } catch (err) {
    next(err);
  }
};

exports.getStaffTicketById = async (req, res, next) => {
  try {
    const data = await ticketService.getStaffTicketById(req.params.id);
    sendSuccess(res, 'Ticket retrieved', data);
  } catch (err) {
    next(err);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const assigneeId = req.body.assigneeId || req.staff.id;
    const ticket = await ticketService.assignTicket(
      { ticketId: req.params.id, assigneeId, requestingStaff: req.staff },
      meta
    );
    sendSuccess(res, 'Ticket assigned successfully', { ticket });
  } catch (err) {
    next(err);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const ticket = await ticketService.updateTicketStatus(
      { ticketId: req.params.id, status: req.body.status, staffId: req.staff.id },
      meta
    );
    sendSuccess(res, 'Ticket status updated', { ticket });
  } catch (err) {
    next(err);
  }
};

exports.addStaffMessage = async (req, res, next) => {
  try {
    const meta = { ip: req.ip, requestId: req.requestId };
    const message = await ticketService.addStaffMessage(
      { ticketId: req.params.id, staffId: req.staff.id, message: req.body.message },
      meta
    );
    sendCreated(res, 'Reply sent', { message });
  } catch (err) {
    next(err);
  }
};

exports.getStaffStats = async (req, res, next) => {
  try {
    const data = await ticketService.getStaffStats(req.staff.id);
    sendSuccess(res, 'Stats retrieved', data);
  } catch (err) {
    next(err);
  }
};

// ─── Admin-facing ─────────────────────────────────────────────────────────────

exports.getAdminTicketStats = async (req, res, next) => {
  try {
    const data = await ticketService.getAdminTicketStats();
    sendSuccess(res, 'Platform ticket stats retrieved', data);
  } catch (err) {
    next(err);
  }
};
