import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/index.js';  // ✅ Your API service
import { authAPI } from '@/api/index.js';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // ✅ User query - automatically checks token & fetches /auth/me
  const { 
    data: user, 
    isLoading, 
    refetch: refreshUser 
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => authAPI.me().then(res => res.data.data || res.data),
    enabled: !!localStorage.getItem('token'), // Only run if token exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// ✅ Register mutation - FIXED response handling
const registerMutation = useMutation({
  mutationFn: async (userData) => {
    const response = await authAPI.register(userData);
    // ✅ Backend returns: {success: true, data: {token, user, role, message}}
    const { token, user } = response.data.data; // ✅ Match ApiResponse structure
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    await queryClient.refetchQueries({ queryKey: ['user'] });
    return user;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },
});

// ✅ Login mutation - FIXED
const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data.data; // ✅ Match ApiResponse structure
    
    if (token) {
      localStorage.setItem('token', token);
    }
    
    await queryClient.refetchQueries({ queryKey: ['user'] });
    return user;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },
});

  // ✅ Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authAPI.logout();
      localStorage.removeItem('token');
      queryClient.clear();
    },
    onSuccess: () => {
      // Redirect handled by ProtectedRoute
    },
  });

  // ✅ Computed values
  const isAuthenticated = !!user && !isLoading;

  // ✅ Check initial auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isLoading) {
      refreshUser();
    }
  }, [isLoading, refreshUser]);

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Mutations (async functions)
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    
    // Helpers
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    logoutLoading: logoutMutation.isPending,
    
    // Refresh
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};