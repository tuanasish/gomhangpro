import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from '../types';
import { useAuth } from '../src/hooks/useAuth';
import { useNotification } from '../src/context/NotificationContext';
import { getDefaultRouteByRole } from '../src/utils/route.utils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated - tự động điều hướng theo role
  React.useEffect(() => {
    console.log('[LOGIN PAGE] useEffect - Auth status', { 
      isAuthenticated, 
      hasUser: !!user,
      userRole: user?.role,
      userEmail: user?.email 
    });
    
    if (isAuthenticated && user) {
      // Lấy route mặc định theo role của user
      const defaultRoute = getDefaultRouteByRole(user.role);
      const fromPath = (location.state as any)?.from?.pathname;
      
      console.log('[LOGIN PAGE] Redirecting', { 
        userRole: user.role, 
        defaultRoute,
        fromPath,
        locationState: location.state 
      });
      
      // QUAN TRỌNG: Chỉ dùng 'from' path nếu nó là route hợp lệ cho role hiện tại
      // Nếu 'from' là route của role cũ (ví dụ: /worker/account khi login với admin),
      // thì phải dùng defaultRoute thay vì 'from'
      let targetRoute = defaultRoute;
      
      if (fromPath) {
        // Kiểm tra xem fromPath có phải là worker route không
        const isWorkerRoute = fromPath.startsWith('/worker/');
        // Nếu user là admin/manager nhưng fromPath là worker route, thì bỏ qua fromPath
        if (isWorkerRoute && (user.role === 'admin' || user.role === 'manager')) {
          console.log('[LOGIN PAGE] Ignoring worker route for admin/manager, using defaultRoute');
          targetRoute = defaultRoute;
        } else {
          // Có thể dùng fromPath nếu nó hợp lệ
          targetRoute = fromPath;
        }
      }
      
      console.log('[LOGIN PAGE] Final target route', { targetRoute, userRole: user.role });
      
      // Use setTimeout to ensure navigation happens after state updates
      const timer = setTimeout(() => {
        console.log('[LOGIN PAGE] Navigating to', targetRoute);
        navigate(targetRoute, { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!email || !password) {
      const errorMsg = 'Vui lòng nhập email và mật khẩu';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login({ email, password, rememberMe });
      // Show success toast
      showSuccess('Đăng nhập thành công!');
      // Redirect sẽ được xử lý bởi useEffect khi user được set
    } catch (err: any) {
      // Nếu lỗi 401 (Unauthorized), hiển thị thông báo về email/mật khẩu
      if (err.response?.status === 401 || err.response?.statusCode === 401) {
        const errorMsg = 'Email hoặc mật khẩu không chính xác. Vui lòng liên hệ admin để được hỗ trợ.';
        setError(errorMsg);
        showError(errorMsg);
      } else {
        // Các lỗi khác hiển thị message từ API hoặc message mặc định
        const errorMsg = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setError(errorMsg);
        showError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="layout-container flex h-full grow flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-gray-700/50 dark:bg-surface-dark sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-gray-900 dark:text-white tracking-light text-2xl font-bold leading-tight">
                Quản lý gom hàng
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Chào mừng trở lại! Vui lòng đăng nhập.
              </p>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              <label className="flex flex-col flex-1">
                <p className="text-gray-900 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                  Email
                </p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary/50 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal transition-all"
                  placeholder="Nhập email của bạn"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </label>
              <label className="flex flex-col flex-1">
                <p className="text-gray-900 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                  Mật khẩu
                </p>
                <div className="relative flex w-full flex-1 items-stretch">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary/50 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-[15px] pr-12 text-base font-normal leading-normal transition-all"
                    placeholder="Nhập mật khẩu của bạn"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div
                    className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
                />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-fixed-height flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="truncate">Đang đăng nhập...</span>
                  </>
                ) : (
                  <span className="truncate">Đăng nhập</span>
                )}
              </button>
              <p 
                className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal text-center underline hover:text-primary cursor-pointer"
                onClick={() => showInfo('Vui lòng liên hệ admin để lấy lại mật khẩu')}
              >
                Quên mật khẩu?
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
