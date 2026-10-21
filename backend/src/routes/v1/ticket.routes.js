// src/routes/v1/ticket.routes.js
// User-facing ticket routes. All require existing `protect` middleware.

const express = require('express');
const router = express.Router();

const ticketController = require('../../controllers/ticket.controller');
const protect = require('../../middleware/protect');
const validateRequest = require('../../middleware/validateRequest');
const {
  createTicketValidator,
  addMessageValidator,
} = require('../../validators/ticket.validators');

// All ticket routes require a logged-in user
router.use(protect);

// GET /tickets/headers — static list for the dropdown (no body needed)
router.get('/headers', ticketController.getHeaders);

// POST /tickets — create a new ticket
router.post('/', createTicketValidator, validateRequest, ticketController.createTicket);

// GET /tickets — list user's own tickets
router.get('/', ticketController.listUserTickets);

// GET /tickets/:id — get ticket + thread
router.get('/:id', ticketController.getUserTicketById);

// POST /tickets/:id/messages — add a message
router.post('/:id/messages', addMessageValidator, validateRequest, ticketController.addUserMessage);

// PATCH /tickets/:id/close — user confirms resolution → CLOSED
router.patch('/:id/close', ticketController.closeTicket);

module.exports = router;
