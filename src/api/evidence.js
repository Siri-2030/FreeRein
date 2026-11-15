import api, { unwrap } from './index.js';

const fromApi = (e) => ({
  id: e.id,
  title: e.title,
  description: e.description,
  date_of_incident: e.dateOfIncident,
  file_name: e.fileName,
  file_type: e.fileType || 'other',
  created_date: e.createdAt,
});

const toApi = (d) => ({
  title: d.title,
  description: d.description,
  dateOfIncident: d.date_of_incident || null,
  fileName: d.file_name,
  fileType: d.file_type,
});

export const evidenceAPI = {
  getEvidence: async () => {
    const list = unwrap(await api.get('/evidence'));
    return (Array.isArray(list) ? list : []).map(fromApi);
  },
  createEvidence: async (data) => fromApi(unwrap(await api.post('/evidence', toApi(data)))),
  updateEvidence: async (id, data) => fromApi(unwrap(await api.put(`/evidence/${id}`, toApi(data)))),
  deleteEvidence: async (id) => { await api.delete(`/evidence/${id}`); },
};

export default evidenceAPI;
