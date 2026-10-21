import api from './api';

export const getAdminDashboard = () => api.get('/admin/dashboard');

export const getAdminPlatformStatus = () => api.get('/admin/platform');

export const getAdminUsers = (params) => api.get('/admin/users', { params });

export const createAdminUser = (data) => api.post('/admin/users', data);

export const getAdminUserDetails = (id) => api.get(`/admin/users/${id}`);

export const updateAdminUserStatus = (id, status) => api.patch(`/admin/users/${id}/status`, { status });

export const getAdminBusinesses = (params) => api.get('/admin/businesses', { params });

export const getAdminBusinessDetails = (id) => api.get(`/admin/businesses/${id}`);

export const updateAdminBusinessStatus = (id, isActive) => api.patch(`/admin/businesses/${id}/status`, { isActive });

export const deleteAdminBusiness = (id) => api.delete(`/admin/businesses/${id}`);

export const getAdminAnalytics = () => api.get('/admin/analytics');

export const getAdminAuditLogs = (params) => api.get('/admin/audit-logs', { params });

export const getAdminSubscriptions = (params) => api.get('/admin/subscriptions', { params });
export const getAdminSubscriptionStats = () => api.get('/admin/subscriptions/stats');
export const updateAdminSubscriptionPlan = (id, data) => api.patch(`/admin/subscriptions/${id}/plan`, data);
