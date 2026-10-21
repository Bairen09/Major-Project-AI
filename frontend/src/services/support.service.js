// frontend/src/services/support.service.js
// Staff-facing API calls using a separate axios instance that reads staffToken.

import axios from 'axios';

const supportApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : ''),
  headers: { 'Content-Type': 'application/json' },
});

// Inject staffToken from localStorage (different key from user token)
supportApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 redirect to support login
supportApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('staffToken');
      if (window.location.pathname !== '/support/login') {
        window.location.href = '/support/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const staffLogin = (data) => supportApi.post('/support/auth/login', data);
export const staffGetMe = () => supportApi.get('/support/auth/me');

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const listSupportTickets = (params = {}) =>
  supportApi.get('/support/tickets', { params });

export const getSupportTicketById = (id) =>
  supportApi.get(`/support/tickets/${id}`);

export const assignTicket = (id, assigneeId) =>
  supportApi.patch(`/support/tickets/${id}/assign`, { assigneeId });

export const updateTicketStatus = (id, status) =>
  supportApi.patch(`/support/tickets/${id}/status`, { status });

export const sendStaffMessage = (id, message) =>
  supportApi.post(`/support/tickets/${id}/messages`, { message });

export const getStaffStats = () => supportApi.get('/support/stats');

// ─── Admin ────────────────────────────────────────────────────────────────────
// Admin routes use the regular api instance (not supportApi) because admins are Users.

import api from './api';

export const createStaffAccount = (data) => api.post('/admin/support-staff', data);
export const listStaffAccounts = (params = {}) =>
  api.get('/admin/support-staff', { params });
export const updateStaffAccountStatus = (id, isActive) =>
  api.patch(`/admin/support-staff/${id}/status`, { isActive });
export const deleteStaffAccount = (id) => api.delete(`/admin/support-staff/${id}`);
export const getAdminSupportStats = () => api.get('/admin/support-stats');
