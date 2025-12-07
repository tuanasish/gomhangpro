import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { login as loginService, logout as logoutService, getCurrentUser, isAuthenticated as checkAuth, LoginResponse } from '../services/auth.service';
import { LoginCredentials } from '../services/auth.service';
import { getUser, clearAuthData } from '../utils/storage.utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'manager' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (checkAuth()) {
        // Try to get user from cache first
        const cachedUser = getUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
          // Fetch from API in background (non-blocking)
          getCurrentUser()
            .then((userData) => {
              setUser(userData);
            })
            .catch((error) => {
              console.error('Failed to fetch user:', error);
              // Only logout if no cached user
              if (!cachedUser) {
                clearAuthData();
                setUser(null);
              }
            });
          return; // Return early to show UI faster
        }

        // If no cached user, fetch from API (blocking)
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await loginService(credentials);
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutService();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might be logged out
      setUser(null);
      clearAuthData();
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
