import api, { unwrap } from './index.js';

const fromApi = (m) => ({
  id: m.id,
  conversation_id: m.conversationId,
  sender_email: m.senderEmail,
  receiver_email: m.receiverEmail,
  content: m.content,
  read: m.read,
  created_date: m.createdAt,
});

const asArray = (v) => (Array.isArray(v) ? v : []);

export const chatAPI = {
  getMessages: async (conversationId) =>
    asArray(unwrap(await api.get(`/chat/messages/${encodeURIComponent(conversationId)}`))).map(fromApi),

  sendMessage: async (conversationId, content, receiverEmail) =>
    fromApi(unwrap(await api.post(`/chat/messages/${encodeURIComponent(conversationId)}`, { content, receiverEmail }))),

  getConversations: async () =>
    asArray(unwrap(await api.get('/chat/conversations'))).map(fromApi),

  markRead: (messageId) => api.patch(`/chat/messages/${messageId}/read`),

  /** People I am allowed to chat with: [{id, name, email, role}] */
  getContacts: async () => asArray(unwrap(await api.get('/users/contacts'))),
};

export default chatAPI;
