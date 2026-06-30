import api from './api';

export const createBusiness = (data) => api.post('/businesses', data);

export const getBusinesses = () => api.get('/businesses/mine');

export const getBusinessById = (id) => api.get(`/businesses/${id}`);

export const updateBusiness = (id, data) => api.patch(`/businesses/${id}`, data);

export const deleteBusiness = (id) => api.delete(`/businesses/${id}`);

export const getDashboardSummary = (id) => api.get(`/businesses/${id}/dashboard/summary`);

export const getCalendar = (id) => api.get(`/businesses/${id}/calendar`);

export const getSettings = (id) => api.get(`/businesses/${id}/settings`);

export const updateSettings = (id, data) => api.patch(`/businesses/${id}/settings`, data);

export const getAnalytics = (id) => api.get(`/businesses/${id}/analytics`);

export const uploadLogo = (id, data) => api.post(`/businesses/${id}/logo`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteLogo = (id) => api.delete(`/businesses/${id}/logo`);

export const uploadCoverImage = (id, data) => api.post(`/businesses/${id}/cover`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteCoverImage = (id) => api.delete(`/businesses/${id}/cover`);
// Force Vite HMR
