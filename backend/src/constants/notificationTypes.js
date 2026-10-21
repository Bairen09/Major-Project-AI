const NOTIFICATION_TYPES = {
  CAMPAIGN_GENERATED: 'campaign_generated',
  POST_PUBLISHED: 'post_published',
  POST_FAILED: 'post_failed',
  AI_FINISHED: 'ai_finished',
  SCHEDULE_UPDATED: 'schedule_updated',
  SYSTEM: 'system',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  // Ticket-related
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_REPLY: 'ticket_reply',
  TICKET_RESOLVED: 'ticket_resolved',
  TICKET_CLOSED: 'ticket_closed',
};

module.exports = NOTIFICATION_TYPES;

