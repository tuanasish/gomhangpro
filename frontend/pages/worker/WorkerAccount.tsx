import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import { useAuth } from '../../src/hooks/useAuth';
import Avatar from '../../src/components/common/Avatar';

const WorkerAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate(RoutePath.LOGIN, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if API call fails
      navigate(RoutePath.LOGIN, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="flex flex-col w-full max-w-2xl flex-1 bg-surface-light dark:bg-surface-dark">
            
            {/* Header */}
            <header className="flex items-center whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(RoutePath.WORKER_HOME)}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
                  Tài khoản
                </h2>
              </div>
            </header>

            <main className="flex-grow pb-28">
              {/* Thông tin người dùng */}
              <div className="p-4 sm:p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar size={80} name={user.name} />
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      {user.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tên đăng nhập
                      </p>
                      <p className="text-sm font-normal text-gray-900 dark:text-white">
                        {user.username || '-'}
                      </p>
                    </div>
                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số điện thoại
                        </p>
                        <p className="text-sm font-normal text-gray-900 dark:text-white">
                          {user.phone}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vai trò
                      </p>
                      <p className="text-sm font-normal text-gray-900 dark:text-white">
                        {user.role === 'worker' ? 'Nhân viên' : user.role === 'manager' ? 'Quản lý' : 'Quản trị viên'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút đăng xuất */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-3 h-14 rounded-lg bg-red-500 text-white font-bold text-base hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang đăng xuất...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">logout</span>
                      <span>Đăng xuất</span>
                    </>
                  )}
                </button>
              </div>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex h-16 justify-around items-center px-4">
                <button
                  onClick={() => navigate(RoutePath.WORKER_HOME)}
                  className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 w-20 gap-1 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">home</span>
                  <span className="text-xs font-medium">Trang chính</span>
                </button>
                <button
                  onClick={() => navigate(RoutePath.WORKER_HISTORY)}
                  className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 w-20 gap-1 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">history</span>
                  <span className="text-xs font-medium">Lịch sử</span>
                </button>
                <button className="flex flex-col items-center justify-center text-primary w-20 gap-1">
                  <span className="material-symbols-outlined fill">person</span>
                  <span className="text-xs font-bold">Tài khoản</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerAccountPage;
