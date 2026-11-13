import axios from 'axios';

/**
 * Backend base URL.
 *  - Local dev:   leave VITE_API_URL empty -> '/api' (Vite proxies it to http://localhost:8080)
 *  - Production:  set VITE_API_URL=https://<your-backend-host>/api at build time
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expired / invalid token -> clear it and tell the app (AuthContext listens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthCall && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

/** Backend wraps everything as { success, data, message } - return just the payload. */
export const unwrap = (response) => response?.data?.data ?? response?.data;

/** Nice message for toasts from any axios error. */
export const errorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.errors) {
    const first = Object.values(error.response.data.errors)[0];
    if (first) return String(first);
  }
  return error?.response?.data?.message
    || (error?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please try again.' : null)
    || error?.message
    || fallback;
};

/**
 * Backend user {id, name, email, role: 'VICTIM'} -> the shape the pages use
 * {id, full_name, email, role: 'victim', user_type: 'victim', ...}
 */
export const normalizeUser = (u) => {
  if (!u) return null;
  const role = String(u.role || 'VICTIM').toLowerCase();
  return {
    ...u,
    full_name: u.name,
    role,
    user_type: role,
    backend_role: String(u.role || 'VICTIM').toUpperCase(),
    is_available: u.available !== false,
    created_date: u.createdAt,
  };
};

// ---------- Auth ----------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// ---------- Public app settings ----------
export const appAPI = {
  getPublicSettings: (appId) => api.get(`/apps/public/prod/public-settings/by-id/${appId}`),
};

// ---------- Resources (raw) ----------
export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getByCategory: (category) => api.get(`/resources/category/${category}`),
  search: (query) => api.get('/resources/search', { params: { q: query } }),
};

// ---------- Users ----------
export const usersAPI = {
  getAll: () => api.get('/admin/users'),
  getById: (id) => api.get(`/entities/users/${id}`),
  create: (user) => api.post('/entities/users', user),
  update: (id, user) => api.put(`/entities/users/${id}`, user),
  delete: (id) => api.delete(`/entities/users/${id}`),
  /** People the logged-in user may chat with (any role). */
  contacts: () => api.get('/users/contacts'),
};

export default api;
