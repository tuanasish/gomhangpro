import apiClient from './api.service';
import { saveAccessToken, saveRefreshToken, saveUser, getAccessToken, getRefreshToken, getUser } from '../utils/storage.utils';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'worker' | 'manager' | 'admin';
    phone?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email: credentials.email,
    password: credentials.password,
    rememberMe: credentials.rememberMe,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Đăng nhập thất bại');
  }

  const { accessToken, refreshToken, user } = response.data.data;

  // Save tokens and user data
  saveAccessToken(accessToken);
  saveRefreshToken(refreshToken);
  saveUser(user);

  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    const { clearAuthData } = await import('../utils/storage.utils');
    clearAuthData();
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>('/auth/refresh', {
    refreshToken,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Refresh token failed');
  }

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;

  saveAccessToken(accessToken);
  if (newRefreshToken) {
    saveRefreshToken(newRefreshToken);
  }

  return accessToken;
}

// Cache for user data with timestamp
let userCache: { user: LoginResponse['user']; timestamp: number } | null = null;
const USER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current user info
 */
export async function getCurrentUser(forceRefresh = false): Promise<LoginResponse['user']> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedUser = getUser();
    if (cachedUser && userCache && Date.now() - userCache.timestamp < USER_CACHE_DURATION) {
      return cachedUser;
    }
  }

  // If not in cache or expired, fetch from API
  const response = await apiClient.get<ApiResponse<LoginResponse['user']>>('/auth/me');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to get user info');
  }

  saveUser(response.data.data);
  userCache = { user: response.data.data, timestamp: Date.now() };
  return response.data.data;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
