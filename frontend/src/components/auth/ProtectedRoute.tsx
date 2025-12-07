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

  // Show loading state while checking authentication
  if (isLoading) {
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
    return <Navigate to={RoutePath.LOGIN} state={{ from: location }} replace />;
  }

  // Check role if required - user chỉ được truy cập route của role mình
  if (requiredRole) {
    // Kiểm tra xem user có quyền truy cập route không
    if (!hasAccessToRoute(user.role, requiredRole)) {
      // User không có quyền, redirect về trang home của role họ
      const defaultRoute = getDefaultRouteByRole(user.role);
      return <Navigate to={defaultRoute} replace />;
    }
  }

  return <>{children}</>;
}
