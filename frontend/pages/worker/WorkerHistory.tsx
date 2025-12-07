import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import * as ordersService from '../../src/services/orders.service';
import { Order } from '../../src/services/orders.service';

const WorkerHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State cho lọc ngày
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Mặc định là ngày hôm nay
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await ordersService.getOrdersByDate(selectedDate);
        // Sắp xếp orders theo thời gian tạo (sớm nhất trước)
        const sortedOrders = ordersData.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeA - timeB;
        });
        setOrders(sortedOrders);
      } catch (err: any) {
        console.error('Load orders by date error:', err);
        setError(err.message || 'Lỗi tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [selectedDate]);

  // Format ngày hiển thị
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeWithPeriod = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Tính tổng tiền hàng từ orders
  const totalTienHang = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.tienHang, 0);
  }, [orders]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="flex flex-col w-full max-w-2xl flex-1 bg-surface-light dark:bg-surface-dark">
            
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(RoutePath.WORKER_HOME)}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
                  Lịch sử hóa đơn
                </h2>
              </div>
            </header>

            <main className="flex-grow pb-28">
              {/* Bộ lọc ngày */}
              <div className="p-4">
                <label className="flex flex-col w-full">
                  <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                    Chọn ngày
                  </p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      calendar_month
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 pl-10 pr-4 text-base font-normal leading-normal"
                      disabled={loading}
                    />
                  </div>
                  <p className="pt-2 text-sm text-gray-500 dark:text-gray-400">
                    Đang xem: <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                  </p>
                </label>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách đơn hàng...</p>
                </div>
              )}

              {error && (
                <div className="px-4 mb-4">
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Thống kê ngày */}
              {!loading && orders.length > 0 && (
                <div className="px-4 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tổng số hóa đơn:
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {orders.length} đơn
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tổng tiền hàng:
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {totalTienHang.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Danh sách hóa đơn */}
              <div className="px-4">
                {!loading && orders.length > 0 ? (
                  <>
                    <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] pb-2 text-gray-900 dark:text-white">
                      Hóa đơn ngày {formatDateDisplay(selectedDate)}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {orders.map((order, index) => (
                        <div 
                          key={order.id}
                          onClick={() => navigate(RoutePath.WORKER_ORDER_DETAIL.replace(':id', order.id))}
                          className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex flex-col items-center justify-center shrink-0">
                              <div className="flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg size-10 mb-1">
                                {index + 1}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeWithPeriod(order.createdAt)}</p>
                            </div>
                            <div className="flex flex-1 flex-col justify-center text-gray-900 dark:text-white">
                              <p className="text-base font-medium leading-normal">Khách: {order.customerName || 'N/A'}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                                Tổng tiền hóa đơn: <span className="font-medium">{order.tongTienHoaDon.toLocaleString('vi-VN')}đ</span>
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                                Tiền hàng: {order.tienHang.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <p className={`text-sm font-medium leading-normal rounded-full px-3 py-1 ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {order.status === 'completed' ? 'Đã thanh toán' : order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : !loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                      receipt_long
                    </span>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Không có hóa đơn nào
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Chọn ngày khác để xem lịch sử hóa đơn
                    </p>
                  </div>
                ) : null}
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
                <button className="flex flex-col items-center justify-center text-primary w-20 gap-1">
                  <span className="material-symbols-outlined fill">history</span>
                  <span className="text-xs font-bold">Lịch sử</span>
                </button>
                <button
                  onClick={() => navigate(RoutePath.WORKER_ACCOUNT)}
                  className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 w-20 gap-1 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-xs font-medium">Tài khoản</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHistoryPage;
