import api from './client.js';

const entities = ['User', 'Resource', 'SupportRequest', 'SupportMessage', 'SafetyPlan'];

export const entitiesApi = {
  async list(entity, sort = '-created_date', limit = undefined) {
    const params = { sort };
    if (limit) params.limit = limit;
    const response = await api.get(`/entities/${entity}/list`, { params });
    return response.data; // array
  },

  async filter(entity, filter, sort = '-created_date', limit = undefined) {
    const params = { filter: JSON.stringify(filter), sort };
    if (limit) params.limit = limit;
    const response = await api.get(`/entities/${entity}/filter`, { params });
    return response.data; // array
  },

  async get(entity, id) {
    const response = await api.get(`/entities/${entity}/${id}`);
    return response.data;
  },

  async create(entity, data) {
    const response = await api.post(`/entities/${entity}`, data);
    return response.data;
  },

  async update(entity, id, data) {
    const response = await api.put(`/entities/${entity}/${id}`, data);
    return response.data;
  },

  async delete(entity, id) {
    await api.delete(`/entities/${entity}/${id}`);
  },
};

// Dynamic per entity
export const createEntityApi = (entity) => ({
  list: (sort, limit) => entitiesApi.list(entity, sort, limit),
  filter: (filter, sort, limit) => entitiesApi.filter(entity, filter, sort, limit),
  get: (id) => entitiesApi.get(entity, id),
  create: (data) => entitiesApi.create(entity, data),
  update: (id, data) => entitiesApi.update(entity, id, data),
  delete: (id) => entitiesApi.delete(entity, id),
});

export default entitiesApi;

