import api from './api';

export const getNotifications = async (page = 1, limit = 20) => {
  return await api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const getUnreadCount = async () => {
  return await api.get('/notifications/unread-count');
};

export const markAsRead = async (id) => {
  return await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
  return await api.patch('/notifications/read-all');
};

export const deleteNotification = async (id) => {
  return await api.delete(`/notifications/${id}`);
};
