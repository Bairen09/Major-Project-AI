import api from './api';

export const generatePost = (businessId, data) => api.post(`/businesses/${businessId}/posts/generate`, data);

export const savePost = (businessId, data) => api.post(`/businesses/${businessId}/posts`, data);

export const getPosts = (businessId, params = {}) => api.get(`/businesses/${businessId}/posts`, { params });

export const getPostById = (businessId, postId) => api.get(`/businesses/${businessId}/posts/${postId}`);

export const updatePost = (businessId, postId, data) => api.patch(`/businesses/${businessId}/posts/${postId}`, data);

export const duplicatePost = (businessId, postId) => api.post(`/businesses/${businessId}/posts/${postId}/duplicate`);

export const deletePost = (businessId, postId) => api.delete(`/businesses/${businessId}/posts/${postId}`);

export const schedulePost = (businessId, postId, data) => api.patch(`/businesses/${businessId}/posts/${postId}/schedule`, data);

export const unschedulePost = (businessId, postId) => api.patch(`/businesses/${businessId}/posts/${postId}/unschedule`);

// Media Upload endpoints
export const uploadMedia = (businessId, postId, formData) => api.post(`/businesses/${businessId}/posts/${postId}/media`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteMedia = (businessId, postId, publicId) => {
  // Ensure publicId is URL encoded as it contains slashes from Cloudinary folders
  const encodedPublicId = encodeURIComponent(publicId);
  return api.delete(`/businesses/${businessId}/posts/${postId}/media/${encodedPublicId}`);
};

export const generateImage = (businessId, postId, data = {}) => api.post(`/businesses/${businessId}/posts/${postId}/generate-image`, data);

export const regenerateImage = (businessId, postId, data = {}) => api.post(`/businesses/${businessId}/posts/${postId}/regenerate-image`, data);
