import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import { useAuth } from '../../src/hooks/useAuth';
import Avatar from '../../src/components/common/Avatar';
import { getDashboardStats, DashboardStats } from '../../src/services/dashboard.service';

const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeShifts: 0,
    totalTienGiaoCa: 0,
    ordersToday: 0,
    totalRevenueToday: 0,
    totalTienGiaoCaTheoNgay: 0,
    totalTienHangDaTraTheoNgay: 0,
    totalTienHoaHongTheoNgay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardStats(selectedDate);
        setStats(data);
      } catch (err: any) {
        console.error('Load dashboard stats error:', err);
        setError(err.message || 'Lỗi tải thống kê');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [selectedDate]);

  const { activeShifts, totalTienGiaoCa, ordersToday, totalRevenueToday, totalTienGiaoCaTheoNgay, totalTienHangDaTraTheoNgay, totalTienHoaHongTheoNgay } = stats;

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Sidebar - Desktop */}
      <aside className="sticky top-0 h-screen w-64 flex-col border-r border-gray-200/60 bg-white p-4 dark:border-gray-800/60 dark:bg-[#111827] hidden lg:flex">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size={40} name={user?.name} />
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-gray-100 text-base font-medium leading-normal">
                {user?.name || 'Admin'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                {user?.role === 'admin' ? 'Quản trị viên' : 'Quản lý'}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => navigate(RoutePath.MANAGER_DASHBOARD)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-light text-primary-dark font-semibold dark:bg-primary/20 dark:text-white w-full text-left"
            >
              <span className="material-symbols-outlined fill text-2xl">dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.ADMIN_SHIFTS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">work_history</span>
              <p className="text-sm font-medium leading-normal">Ca làm việc</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.ADMIN_STAFF)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">groups</span>
              <p className="text-sm font-medium leading-normal">Nhân viên</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.MANAGER_ORDERS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              <p className="text-sm font-medium leading-normal">Đơn hàng</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.ADMIN_CUSTOMERS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">people</span>
              <p className="text-sm font-medium leading-normal">Khách hàng</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.ADMIN_COUNTERS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">store</span>
              <p className="text-sm font-medium leading-normal">Quầy</p>
            </button>
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => navigate(RoutePath.ADMIN_SHIFTS)}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">add</span>
            <span className="truncate">Tạo ca mới</span>
          </button>
          <div className="flex flex-col gap-1">
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await logout();
                  navigate(RoutePath.LOGIN, { replace: true });
                } catch (error) {
                  console.error('Logout error:', error);
                  navigate(RoutePath.LOGIN, { replace: true });
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-2xl">logout</span>
              <p className="text-sm font-medium leading-normal">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</p>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-8" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm z-10 flex flex-col gap-3 p-4 border-b border-gray-200/80 dark:border-gray-800/60">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
              Dashboard
            </h1>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Chọn ngày:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 py-1.5 px-3 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex-wrap justify-between gap-4 items-center mb-6 hidden lg:flex">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Dashboard Quản lý
              </h1>
              <div className="flex items-center gap-2">
                <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Chọn ngày:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 py-1.5 px-3 text-sm focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải thống kê...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white dark:bg-[#111827] rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-gray-800/60 flex flex-col">
                    <div className="flex justify-between items-start">
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                        Ca đang hoạt động
                      </p>
                      <span className="material-symbols-outlined text-primary text-lg sm:text-xl">work_history</span>
                    </div>
                    <p className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mt-2">
                      {activeShifts}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      Nhân viên đang làm việc
                    </p>
                  </div>
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60 flex flex-col">
                <div className="flex justify-between items-start">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Tổng tiền giao ca
                  </p>
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                </div>
                <p className="text-gray-900 dark:text-white text-2xl font-bold mt-2">
                  {totalTienGiaoCa.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Tiền đã đưa cho nhân viên
                </p>
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60 flex flex-col">
                <div className="flex justify-between items-start">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Đơn hàng
                  </p>
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                </div>
                <p className="text-gray-900 dark:text-white text-2xl font-bold mt-2">
                  {ordersToday}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Tổng số đơn đã tạo
                </p>
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60 flex flex-col">
                <div className="flex justify-between items-start">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Doanh thu
                  </p>
                  <span className="material-symbols-outlined text-primary">monitoring</span>
                </div>
                <p className="text-gray-900 dark:text-white text-2xl font-bold mt-2">
                  {totalRevenueToday.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Tổng tiền hóa đơn
                </p>
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800/60 flex flex-col">
                <div className="flex justify-between items-start">
                  <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">
                    Tiền hoa hồng
                  </p>
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg sm:text-xl">savings</span>
                </div>
                <p className="text-green-600 dark:text-green-400 text-xl sm:text-2xl font-bold mt-2">
                  {totalTienHoaHongTheoNgay.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Công ty sẽ nhận
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-gray-900 dark:text-white text-lg font-semibold">
                    Doanh thu
                  </h2>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 text-sm">
                    <select className="form-select rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-200 py-1.5 text-sm focus:ring-primary focus:border-primary">
                      <option>Tháng này</option>
                      <option>Tháng trước</option>
                      <option>Năm nay</option>
                    </select>
                  </div>
                </div>
                <div className="w-full h-64 md:h-80 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 dark:text-gray-500">
                    Biểu đồ đang được tải...
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60">
                <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">
                  Thống kê theo ngày
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Đã giao cho nhân viên</p>
                    <p className="text-gray-900 dark:text-white font-bold">
                      {totalTienGiaoCaTheoNgay.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Nhân viên đã chi</p>
                    <p className="text-primary font-bold">
                      {totalTienHangDaTraTheoNgay.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tiền hoa hồng công ty</p>
                    <p className="text-green-600 dark:text-green-400 font-bold">
                      {totalTienHoaHongTheoNgay.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </main>

      <BottomNavAdmin />
    </div>
  );
};

export default ManagerDashboardPage;
