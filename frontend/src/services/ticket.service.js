// frontend/src/services/ticket.service.js
// User-facing ticket API calls using the shared axios instance.

import api from './api';

export const getTicketHeaders = () => api.get('/tickets/headers');

export const createTicket = (data) => api.post('/tickets', data);

export const listMyTickets = (params = {}) => api.get('/tickets', { params });

export const getTicketById = (id) => api.get(`/tickets/${id}`);

export const sendUserMessage = (id, message) =>
  api.post(`/tickets/${id}/messages`, { message });

export const closeTicket = (id) => api.patch(`/tickets/${id}/close`);
