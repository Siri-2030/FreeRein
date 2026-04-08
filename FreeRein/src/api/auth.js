import { authAPI } from './index.js';

// Backwards compatibility - extend authAPI with isAuthenticated (since index.js authAPI lacks it)
export const authApi = {
  ...authAPI,
  isAuthenticated: async () => {
    try {
      await authAPI.me();
      return true;
    } catch {
      return false;
    }
  }
};

// Destructure for direct usage
export const { me, login, register, logout, isAuthenticated } = authApi;

export default authApi;
