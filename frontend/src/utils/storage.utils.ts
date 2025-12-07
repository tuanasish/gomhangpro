/**
 * Storage utilities for managing tokens and user data in localStorage
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'remember_me';

/**
 * Save access token
 */
export function saveAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Save refresh token
 */
export function saveRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Save user data
 */
export function saveUser(user: any): void {
  console.log('[STORAGE] saveUser', { role: user?.role, email: user?.email, userId: user?.id });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data
 */
export function getUser(): any | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) {
    console.log('[STORAGE] getUser - No user in storage');
    return null;
  }
  try {
    const user = JSON.parse(userStr);
    console.log('[STORAGE] getUser', { role: user?.role, email: user?.email, userId: user?.id });
    return user;
  } catch (e) {
    console.log('[STORAGE] getUser - Parse error', e);
    return null;
  }
}

/**
 * Save remember me flag
 */
export function saveRememberMe(remember: boolean): void {
  localStorage.setItem(REMEMBER_ME_KEY, String(remember));
}

/**
 * Get remember me flag
 */
export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

/**
 * Remove all auth data
 */
export function clearAuthData(): void {
  console.log('[STORAGE] clearAuthData - Clearing all auth data');
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Keep remember me preference
  console.log('[STORAGE] clearAuthData - Done');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

