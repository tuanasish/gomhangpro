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
  console.log('[AUTH SERVICE] Login - Clearing cache');
  // Clear any existing cache before login
  clearUserCache();
  
  console.log('[AUTH SERVICE] Login - Calling API', { email: credentials.email });
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email: credentials.email,
    password: credentials.password,
    rememberMe: credentials.rememberMe,
  });

  if (!response.data.success || !response.data.data) {
    console.error('[AUTH SERVICE] Login - API failed', response.data);
    throw new Error(response.data.error || 'Đăng nhập thất bại');
  }

  const { accessToken, refreshToken, user } = response.data.data;
  console.log('[AUTH SERVICE] Login - Success', { 
    userId: user.id, 
    email: user.email, 
    role: user.role,
    name: user.name 
  });

  // Save tokens and user data
  saveAccessToken(accessToken);
  saveRefreshToken(refreshToken);
  saveUser(user);
  
  // Update cache with new user data
  userCache = { user, timestamp: Date.now() };
  console.log('[AUTH SERVICE] Login - Cache updated', { role: user.role });

  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  console.log('[AUTH SERVICE] Logout - Starting');
  try {
    await apiClient.post('/auth/logout');
    console.log('[AUTH SERVICE] Logout - API success');
  } catch (error: any) {
    // Không log error nếu là lỗi 401 (token đã hết hạn - điều này là bình thường khi logout)
    // Hoặc lỗi network (không có response) - có thể là do đã mất kết nối
    if (error.response?.status === 401 || error.response?.status === 403 || !error.response) {
      console.log('[AUTH SERVICE] Logout - API failed (normal case)', error.response?.status || 'no response');
    } else {
      // Các lỗi khác (500, etc.) thì log để debug
      console.error('[AUTH SERVICE] Logout - API error:', error);
    }
  } finally {
    // Clear user cache in memory
    console.log('[AUTH SERVICE] Logout - Clearing cache and storage');
    clearUserCache();
    // Clear local storage regardless of API call success
    const { clearAuthData } = await import('../utils/storage.utils');
    clearAuthData();
    console.log('[AUTH SERVICE] Logout - Complete');
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
 * Clear user cache (internal use)
 */
export function clearUserCache(): void {
  userCache = null;
}

/**
 * Get current user info
 */
export async function getCurrentUser(forceRefresh = false): Promise<LoginResponse['user']> {
  console.log('[AUTH SERVICE] getCurrentUser', { forceRefresh, hasCache: !!userCache });
  
  // Check localStorage first to see what's stored
  const storedUser = getUser();
  console.log('[AUTH SERVICE] getCurrentUser - Stored user in localStorage', { 
    hasStoredUser: !!storedUser,
    storedRole: storedUser?.role 
  });
  
  // If force refresh, always fetch from API and clear cache first
  if (forceRefresh) {
    console.log('[AUTH SERVICE] getCurrentUser - Force refresh, clearing memory cache');
    userCache = null;
    // Don't clear localStorage - we'll update it after fetching fresh data
    // This ensures we always get the latest user from API
  } else {
    // Check cache first (unless force refresh)
    if (storedUser && userCache && Date.now() - userCache.timestamp < USER_CACHE_DURATION) {
      console.log('[AUTH SERVICE] getCurrentUser - Returning cached user', { 
        role: storedUser.role,
        email: storedUser.email 
      });
      return storedUser;
    }
  }

  // If not in cache or expired, fetch from API
  console.log('[AUTH SERVICE] getCurrentUser - Fetching from API');
  const response = await apiClient.get<ApiResponse<LoginResponse['user']>>('/auth/me');

  if (!response.data.success || !response.data.data) {
    console.error('[AUTH SERVICE] getCurrentUser - API failed', response.data);
    throw new Error(response.data.error || 'Failed to get user info');
  }

  const userData = response.data.data;
  console.log('[AUTH SERVICE] getCurrentUser - API success', { 
    role: userData.role,
    email: userData.email,
    userId: userData.id 
  });

  console.log('[AUTH SERVICE] getCurrentUser - Saving user to storage');
  saveUser(userData);
  userCache = { user: userData, timestamp: Date.now() };
  console.log('[AUTH SERVICE] getCurrentUser - Returning user', { role: userData.role });
  return userData;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
