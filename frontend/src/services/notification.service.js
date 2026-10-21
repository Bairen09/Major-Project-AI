import api from './api';

export const getNotifications = (page = 1, limit = 20, status, search) => {
    const params = { page, limit };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    return api.get('/notifications', { params });
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
