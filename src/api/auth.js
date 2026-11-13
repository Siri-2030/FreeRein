import { authAPI, normalizeUser, unwrap } from './index.js';

// Same names the pages already use, but now they return clean data (not raw axios responses).
export const authApi = {
  /** Current user in the shape the UI uses. */
  me: async () => normalizeUser(unwrap(await authAPI.me())),

  login: (data) => authAPI.login(data),
  register: (data) => authAPI.register(data),
  logout: () => authAPI.logout(),

  updateProfile: async (data) => normalizeUser(unwrap(await authAPI.updateProfile(data))),

  isAuthenticated: async () => {
    if (!localStorage.getItem('token')) return false;
    try {
      await authAPI.me();
      return true;
    } catch {
      return false;
    }
  },
};

export const { me, login, register, logout, isAuthenticated } = authApi;

export default authApi;
