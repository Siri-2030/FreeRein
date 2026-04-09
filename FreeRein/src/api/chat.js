import api from './index.js';

export const chatAPI = {
  getMessages: (conversationId, page = 0, size = 50) => api.get(`/chat/messages/${conversationId}?page=${page}&size=${size}`),
  sendMessage: (conversationId, content, receiverEmail) => api.post(`/chat/messages/${conversationId}`, { content, receiverEmail }),
  getConversations: () => api.get('/chat/conversations'),
  markRead: (messageId) => api.patch(`/chat/messages/${messageId}/read`),
};

export default chatAPI;

