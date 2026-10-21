// src/routes/v1/support.routes.js
// Staff-facing routes: auth + ticket management + stats.
// Protected by protectStaff — completely isolated from user routes.

const express = require('express');
const router = express.Router();

const supportAuthController = require('../../controllers/supportAuth.controller');
const ticketController = require('../../controllers/ticket.controller');
const protectStaff = require('../../middleware/protectStaff');
const requireStaffRole = require('../../middleware/requireStaffRole');
const validateRequest = require('../../middleware/validateRequest');
const { STAFF_ROLES } = require('../../constants/ticket');
const {
  addMessageValidator,
  updateStatusValidator,
  assignTicketValidator,
} = require('../../validators/ticket.validators');
const { staffLoginValidator } = require('../../validators/supportAuth.validators');

// ─── Auth (public for staff) ──────────────────────────────────────────────────

// POST /support/auth/login
router.post('/auth/login', staffLoginValidator, validateRequest, supportAuthController.login);

// GET /support/auth/me — requires staff JWT
router.get('/auth/me', protectStaff, supportAuthController.getMe);

// ─── Ticket management (all require protectStaff) ─────────────────────────────

router.use('/tickets', protectStaff);

// GET /support/tickets
router.get('/tickets', ticketController.listStaffTickets);

// GET /support/tickets/:id
router.get('/tickets/:id', ticketController.getStaffTicketById);

// PATCH /support/tickets/:id/assign
router.patch(
  '/tickets/:id/assign',
  assignTicketValidator,
  validateRequest,
  ticketController.assignTicket
);

// PATCH /support/tickets/:id/status
router.patch(
  '/tickets/:id/status',
  updateStatusValidator,
  validateRequest,
  ticketController.updateTicketStatus
);

// POST /support/tickets/:id/messages
router.post(
  '/tickets/:id/messages',
  addMessageValidator,
  validateRequest,
  ticketController.addStaffMessage
);

// ─── Stats ────────────────────────────────────────────────────────────────────

// GET /support/stats — own stats scoped to this staff member
router.get('/stats', protectStaff, ticketController.getStaffStats);

module.exports = router;
