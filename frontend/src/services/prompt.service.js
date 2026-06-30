import api from './api';

export const getPromptHistory = (businessId) => {
  return api.get(`/businesses/${businessId}/prompts`);
};

export const toggleFavoritePrompt = (businessId, promptId) => {
  return api.patch(`/businesses/${businessId}/prompts/${promptId}/favorite`);
};

export const reusePrompt = (businessId, promptId) => {
  return api.post(`/businesses/${businessId}/prompts/${promptId}/reuse`);
};
