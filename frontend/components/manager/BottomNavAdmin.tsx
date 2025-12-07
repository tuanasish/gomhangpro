import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from '../../types';

const BottomNavAdmin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: RoutePath.MANAGER_DASHBOARD,
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      path: RoutePath.ADMIN_SHIFTS,
      icon: 'work_history',
      label: 'Ca làm việc',
    },
    {
      path: RoutePath.ADMIN_STAFF,
      icon: 'groups',
      label: 'Nhân viên',
    },
    {
      path: RoutePath.MANAGER_ORDERS,
      icon: 'receipt_long',
      label: 'Đơn hàng',
    },
    {
      path: RoutePath.ADMIN_CUSTOMERS,
      icon: 'menu',
      label: 'Thêm',
      isMenu: true,
    },
  ];

  const isActive = (path: string, isMenu?: boolean) => {
    if (isMenu) {
      return location.pathname === RoutePath.ADMIN_CUSTOMERS || location.pathname === RoutePath.ADMIN_COUNTERS;
    }
    return location.pathname === path;
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111827] border-t border-gray-200/80 dark:border-gray-800/60 z-40 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const active = isActive(item.path, item.isMenu);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] sm:min-w-[60px] h-full rounded-lg transition-all duration-200 touch-manipulation active:scale-95 ${
                active
                  ? 'text-primary'
                  : 'text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-300'
              }`}
              style={{
                minHeight: '44px', // Touch target size
              }}
            >
              <span
                className={`material-symbols-outlined text-[22px] sm:text-2xl transition-transform ${
                  active ? 'fill' : ''
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight transition-all ${
                  active ? 'font-semibold' : 'font-normal'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavAdmin;
