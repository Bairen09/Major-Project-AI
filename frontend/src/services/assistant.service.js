import api from './api';

export const sendChatMessage = async (businessId, messages) => {
  const response = await api.post(`/businesses/${businessId}/assistant/chat`, { messages });
  return response.data.data;
};
