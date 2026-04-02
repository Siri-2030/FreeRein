import api from './client.js';

export const authApi = {
  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // {token, user?}
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {} // ignore errors
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
  },

  async isAuthenticated() {
    try {
      await me();
      return true;
    } catch {
      return false;
    }
  },
};

export const { me, login, register, logout, isAuthenticated } = authApi;

