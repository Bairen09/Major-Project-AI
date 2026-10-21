// src/constants/ticket.js

const TICKET_HEADERS = [
  'Billing Issue',
  'AI Generation Not Working',
  'Post Scheduling Problem',
  'Login / Account Access',
  'Integration / Connection Issue',
  'Bug Report',
  'Feature Request',
  'Other',
];

const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_USER: 'PENDING_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

const STAFF_ROLES = {
  SUPPORT: 'support',
  LEAD_SUPPORT: 'lead_support',
};

module.exports = { TICKET_HEADERS, TICKET_STATUS, STAFF_ROLES };
