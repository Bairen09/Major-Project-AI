import api from './api';

const getBaseUrl = (businessId) => businessId === 'localboost' ? '/admin' : `/businesses/${businessId}`;

export const getBlogs = (businessId, params = {}) => {
  return api.get(`${getBaseUrl(businessId)}/blogs`, { params });
};

export const getBlogById = (businessId, blogId) => {
  return api.get(`${getBaseUrl(businessId)}/blogs/${blogId}`);
};

export const createBlog = (businessId, data) => {
  return api.post(`${getBaseUrl(businessId)}/blogs`, data);
};

export const generateBlog = (businessId, data) => {
  return api.post(`${getBaseUrl(businessId)}/blogs/generate`, data);
};

export const updateBlog = (businessId, blogId, data) => {
  return api.patch(`${getBaseUrl(businessId)}/blogs/${blogId}`, data);
};

export const deleteBlog = (businessId, blogId) => {
  return api.delete(`${getBaseUrl(businessId)}/blogs/${blogId}`);
};

export const uploadBlogCover = (businessId, blogId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(`${getBaseUrl(businessId)}/blogs/${blogId}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const generateBlogCover = (businessId, blogId, prompt) => {
  return api.post(`${getBaseUrl(businessId)}/blogs/${blogId}/cover/generate`, { prompt });
};

// ─── Public SEO Routes ───
export const getPublicBlogs = (params = {}) => {
  return api.get('/public/blogs', { params });
};

export const getPublicBlogById = (id) => {
  return api.get(`/public/blogs/${id}`);
};
