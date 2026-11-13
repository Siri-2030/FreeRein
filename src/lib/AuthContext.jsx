import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, normalizeUser, unwrap } from '@/api/index.js';

const AuthContext = createContext(null);

const getStoredToken = () => {
  try { return localStorage.getItem('token'); } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(getStoredToken);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Current user: fetched from GET /api/auth/me whenever we hold a token
  const { data: user, isLoading, refetch: refreshUser } = useQuery({
    queryKey: ['user', token],
    queryFn: async () => normalizeUser(unwrap(await authAPI.me())),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const clearSession = useCallback(() => {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // The API client fires this when the server says our token is no longer valid
  useEffect(() => {
    const onExpired = () => clearSession();
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [clearSession]);

  const startSession = (payload) => {
    const { token: newToken, user: newUser } = payload;
    if (!newToken) throw new Error('Server did not return a token');
    localStorage.setItem('token', newToken);
    queryClient.setQueryData(['user', newToken], normalizeUser(newUser));
    setToken(newToken);
    return normalizeUser(newUser);
  };

  const login = async (credentials) => {
    setLoginLoading(true);
    try {
      return startSession(unwrap(await authAPI.login(credentials)));
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async (data) => {
    setRegisterLoading(true);
    try {
      return startSession(unwrap(await authAPI.register(data)));
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    try {
      await authAPI.logout().catch(() => {});   // server logout is stateless; never block the user
    } finally {
      clearSession();
      setLogoutLoading(false);
    }
  };

  const value = {
    user: token ? user ?? null : null,
    isAuthenticated: !!token && !!user,
    isLoading: !!token && isLoading,
    isLoadingAuth: !!token && isLoading,
    authError: null,
    login,
    register,
    logout,
    loginLoading,
    registerLoading,
    logoutLoading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
