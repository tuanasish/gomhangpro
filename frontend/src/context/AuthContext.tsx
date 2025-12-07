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
      // Check if there's a valid token first
      if (!checkAuth()) {
        // No token, ensure everything is cleared
        clearAuthData();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Has token, verify with API
      try {
        const userData = await getCurrentUser(true); // Force refresh to ensure correct user data
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Token might be invalid, clear everything
        clearAuthData();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuthData();
      setUser(null);
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
      // Clear any old user data before login
      setUser(null);
      clearAuthData();
      
      const response = await loginService(credentials);
      // Set new user - this will trigger re-render and navigation
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      // Ensure state is cleared on error
      setUser(null);
      clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      // Clear user state first to prevent race conditions
      setUser(null);
      // Clear all auth data from storage
      clearAuthData();
      // Call logout service (fire and forget)
      await logoutService().catch((error) => {
        console.error('Logout API error:', error);
        // Continue even if API call fails
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure state and storage are cleared
      setUser(null);
      clearAuthData();
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
