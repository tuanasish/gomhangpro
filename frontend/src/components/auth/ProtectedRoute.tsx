import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoutePath } from '../../../types';
import { getDefaultRouteByRole, hasAccessToRoute } from '../../utils/route.utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'worker' | 'manager' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED ROUTE]', {
    path: location.pathname,
    requiredRole,
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email
  });

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[PROTECTED ROUTE] Loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('[PROTECTED ROUTE] Not authenticated, redirecting to login');
    return <Navigate to={RoutePath.LOGIN} state={{ from: location }} replace />;
  }

  // Check role if required - user chỉ được truy cập route của role mình
  if (requiredRole) {
    const hasAccess = hasAccessToRoute(user.role, requiredRole);
    console.log('[PROTECTED ROUTE] Role check', {
      userRole: user.role,
      requiredRole,
      hasAccess
    });
    
    // Kiểm tra xem user có quyền truy cập route không
    if (!hasAccess) {
      // User không có quyền, redirect về trang home của role họ
      const defaultRoute = getDefaultRouteByRole(user.role);
      console.log('[PROTECTED ROUTE] No access, redirecting to', defaultRoute);
      return <Navigate to={defaultRoute} replace />;
    }
  }

  console.log('[PROTECTED ROUTE] Access granted');
  return <>{children}</>;
}
