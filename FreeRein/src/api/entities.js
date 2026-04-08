import { usersAPI } from './index.js';

const entities = ['User', 'Resource', 'SupportRequest', 'SupportMessage', 'SafetyPlan'];

// Main entitiesApi - User uses usersAPI, others warn unimplemented
export const entitiesApi = {
  list: async (entity, sort = '-created_date', limit) => {
    if (entity === 'User') {
      const response = await usersAPI.getAll();
      return response.data || response; // Adapt to data
    } else {
      console.warn(`Entity ${entity} list not implemented`);
      return [];
    }
  },

  filter: async (entity, filter, sort = '-created_date', limit) => {
    if (entity === 'User') {
      console.warn('User filter not implemented');
      return [];
    } else {
      console.warn(`Entity ${entity} filter not implemented`);
      return [];
    }
  },

  get: async (entity, id) => {
    if (entity === 'User') {
      const response = await usersAPI.getById(id);
      return response.data || response;
    } else {
      console.warn(`Entity ${entity} get not implemented`);
      return null;
    }
  },

  create: async (entity, data) => {
    if (entity === 'User') {
      const response = await usersAPI.create(data);
      return response.data || response;
    } else {
      console.warn(`Entity ${entity} create not implemented`);
      return null;
    }
  },

  update: async (entity, id, data) => {
    if (entity === 'User') {
      const response = await usersAPI.update(id, data);
      return response.data || response;
    } else {
      console.warn(`Entity ${entity} update not implemented`);
      return null;
    }
  },

  delete: async (entity, id) => {
    if (entity === 'User') {
      await usersAPI.delete(id);
    } else {
      console.warn(`Entity ${entity} delete not implemented`);
    }
  },
};

// Dynamic per entity API creator
export const createEntityApi = (entity) => ({
  list: (sort, limit) => entitiesApi.list(entity, sort, limit),
  filter: (filter, sort, limit) => entitiesApi.filter(entity, filter, sort, limit),
  get: (id) => entitiesApi.get(entity, id),
  create: (data) => entitiesApi.create(entity, data),
  update: (id, data) => entitiesApi.update(entity, id, data),
  delete: (id) => entitiesApi.delete(entity, id),
});

// Backwards compatibility
export { usersAPI };

export default entitiesApi;
