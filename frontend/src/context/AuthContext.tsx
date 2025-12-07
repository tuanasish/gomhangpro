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
    console.log('[AUTH CONTEXT] checkAuthStatus - Starting');
    try {
      // Check if there's a valid token first
      const hasToken = checkAuth();
      console.log('[AUTH CONTEXT] checkAuthStatus - Has token:', hasToken);
      
      if (!hasToken) {
        // No token, ensure everything is cleared
        console.log('[AUTH CONTEXT] checkAuthStatus - No token, clearing');
        clearAuthData();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Has token, verify with API
      try {
        console.log('[AUTH CONTEXT] checkAuthStatus - Fetching user from API');
        const userData = await getCurrentUser(true); // Force refresh to ensure correct user data
        console.log('[AUTH CONTEXT] checkAuthStatus - User fetched', { 
          role: userData.role,
          email: userData.email,
          userId: userData.id 
        });
        setUser(userData);
        console.log('[AUTH CONTEXT] checkAuthStatus - User state set', { role: userData.role });
      } catch (error) {
        console.error('[AUTH CONTEXT] checkAuthStatus - Failed to fetch user:', error);
        // Token might be invalid, clear everything
        clearAuthData();
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH CONTEXT] checkAuthStatus - Error:', error);
      clearAuthData();
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('[AUTH CONTEXT] checkAuthStatus - Complete');
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    console.log('[AUTH CONTEXT] login - Starting', { email: credentials.email });
    try {
      setIsLoading(true);
      // Clear any old user data before login
      console.log('[AUTH CONTEXT] login - Step 1: Clearing old user data');
      setUser(null);
      clearAuthData();
      
      // Verify localStorage is cleared
      const { getUser: checkGetUser } = await import('../utils/storage.utils');
      const checkUser = checkGetUser();
      console.log('[AUTH CONTEXT] login - Step 2: Verified localStorage cleared', { 
        hasUserAfterClear: !!checkUser,
        userRole: checkUser?.role 
      });
      
      // Wait for login to complete and get new user data
      console.log('[AUTH CONTEXT] login - Step 3: Calling loginService');
      const response = await loginService(credentials);
      console.log('[AUTH CONTEXT] login - Step 4: Login service returned', { 
        role: response.user.role,
        email: response.user.email,
        userId: response.user.id 
      });
      
      // Verify what's in localStorage now
      const userAfterLogin = checkGetUser();
      console.log('[AUTH CONTEXT] login - Step 5: User in localStorage after login', { 
        hasUser: !!userAfterLogin,
        role: userAfterLogin?.role,
        email: userAfterLogin?.email 
      });
      
      // Small delay to ensure state updates properly
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Set new user - this will trigger re-render and navigation
      console.log('[AUTH CONTEXT] login - Step 6: Setting user state', { role: response.user.role });
      setUser(response.user);
      console.log('[AUTH CONTEXT] login - Step 7: User state set, current state:', { 
        role: response.user.role,
        email: response.user.email 
      });
    } catch (error: any) {
      console.error('[AUTH CONTEXT] login - Error:', error);
      // Ensure state is cleared on error
      setUser(null);
      clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
      console.log('[AUTH CONTEXT] login - Complete');
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[AUTH CONTEXT] logout - Starting');
    try {
      setIsLoading(true);
      // Clear user state first to prevent race conditions
      console.log('[AUTH CONTEXT] logout - Clearing user state');
      setUser(null);
      // Clear all auth data from storage
      clearAuthData();
      // Call logout service (fire and forget)
      await logoutService().catch((error) => {
        console.error('[AUTH CONTEXT] logout - API error:', error);
        // Continue even if API call fails
      });
      console.log('[AUTH CONTEXT] logout - Complete');
    } catch (error) {
      console.error('[AUTH CONTEXT] logout - Error:', error);
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
