import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ✅ App APIs
export const appAPI = {
  getPublicSettings: (appId) =>
    api.get(`/apps/public/prod/public-settings/by-id/${appId}`),
}

// ✅ Resources APIs
export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getByCategory: (category) =>
    api.get(`/resources/category/${category}`),
  search: (query) =>
    api.post('/resources/search', { search: query }),
}

// ✅ Users APIs (ONLY ONE)
export const usersAPI = {
  getAll: () => api.get('/entities/users'),
  getById: (id) => api.get(`/entities/users/${id}`),
  create: (user) => api.post('/entities/users', user),
  update: (id, user) => api.put(`/entities/users/${id}`, user),
  delete: (id) => api.delete(`/entities/users/${id}`),
}

export default api
