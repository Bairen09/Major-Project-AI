import api from './api';

export const uploadAvatar = (data) => api.post('/users/avatar', data, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const deleteAvatar = () => api.delete('/users/avatar');
