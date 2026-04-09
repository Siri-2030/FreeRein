import api from './index.js';

export const evidenceAPI = {
  getEvidence: () => api.get('/evidence'),
  createEvidence: (data) => api.post('/evidence', data),
  deleteEvidence: (id) => api.delete(`/evidence/${id}`),
  updateEvidence: (id, data) => api.put(`/evidence/${id}`, data),
};

export default evidenceAPI;

