import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { useAuth } from '../src/hooks/useAuth';
import { getDefaultRouteByRole } from '../src/utils/route.utils';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Tự động redirect theo role - không cho chọn role khác
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // Chưa đăng nhập, redirect về login
        navigate(RoutePath.LOGIN, { replace: true });
      } else {
        // Đã đăng nhập, tự động redirect về trang home theo role
        const defaultRoute = getDefaultRouteByRole(user.role);
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Hiển thị loading trong lúc redirect
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Đang chuyển hướng...</p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;