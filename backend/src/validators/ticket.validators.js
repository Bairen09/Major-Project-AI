// src/validators/ticket.validators.js

const { body } = require('express-validator');
const { TICKET_HEADERS, TICKET_STATUS } = require('../constants/ticket');

const createTicketValidator = [
  body('header')
    .trim()
    .notEmpty()
    .withMessage('Ticket header is required')
    .isIn(TICKET_HEADERS)
    .withMessage(`Header must be one of: ${TICKET_HEADERS.join(', ')}`),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
];

const addMessageValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1 })
    .withMessage('Message cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Message cannot exceed 5000 characters'),
];

const updateStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(TICKET_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TICKET_STATUS).join(', ')}`),
];

const assignTicketValidator = [
  body('assigneeId')
    .trim()
    .notEmpty()
    .withMessage('Assignee ID is required')
    .isMongoId()
    .withMessage('Assignee ID must be a valid ID'),
];

module.exports = {
  createTicketValidator,
  addMessageValidator,
  updateStatusValidator,
  assignTicketValidator,
};
