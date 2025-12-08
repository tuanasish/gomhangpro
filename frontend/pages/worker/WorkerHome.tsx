import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavWorker from '../../components/worker/BottomNavWorker';
import { useAuth } from '../../src/hooks/useAuth';
import Avatar from '../../src/components/common/Avatar';
import * as shiftsService from '../../src/services/shifts.service';
import * as ordersService from '../../src/services/orders.service';
import { Shift } from '../../src/services/shifts.service';
import { Order } from '../../src/services/orders.service';

const WorkerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shift, setShift] = useState<Shift | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentShift = await shiftsService.getCurrentShift();
      setShift(currentShift);

      if (currentShift) {
        const shiftOrders = await ordersService.getOrdersByShift(currentShift.id);
        // Sắp xếp orders theo thời gian tạo (sớm nhất trước)
        const sortedOrders = shiftOrders.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return timeA - timeB;
        });
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Load worker home data error:', err);
      // Nếu là lỗi 404 (không tìm thấy ca), coi như không có ca thay vì hiển thị lỗi
      if (err.response?.status === 404 || err.response?.statusCode === 404) {
        setShift(null);
        setOrders([]);
      } else {
        // Các lỗi khác thì hiển thị error message
        setError(err.message || 'Lỗi tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeWithPeriod = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="flex flex-col w-full max-w-2xl flex-1 bg-surface-light dark:bg-surface-dark">
            
            {/* Header */}
            <header className="flex items-center whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-4">
                <Avatar size={40} name={user?.name} />
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">
                  {user?.name || 'Nhân viên'}
                </h2>
              </div>
            </header>

            <main className="flex-grow pb-28">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
              )}

              {error && (
                <div className="px-4 py-4">
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    <button
                      onClick={loadData}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              )}

              {!loading && shift && (
                <>
                  {/* Stats - Hiển thị thông tin tiền giao ca */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                    <div className="flex flex-col gap-2 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">
                        Giờ bắt đầu ca
                      </p>
                      <p className="tracking-light text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                        {formatTimeWithPeriod(shift.startTime)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">
                        Tiền giao ca ban đầu
                      </p>
                      <p className="tracking-light text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                        {shift.tienGiaoCa.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <p className="text-base font-medium leading-normal text-gray-500 dark:text-gray-400">
                        Quỹ còn lại
                      </p>
                      <p className={`tracking-light text-2xl font-bold leading-tight ${
                        shift.quyConLai >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {shift.quyConLai.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="px-4 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tổng tiền hàng đã trả (đã mua):
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {shift.tongTienHangDaTra.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>

              {/* Action */}
              <div className="flex px-4 py-3">
                <button
                  onClick={() => navigate(RoutePath.WORKER_CREATE_ORDER)}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-primary text-white gap-3 text-lg font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-3xl">add_circle</span>
                  <span className="truncate">Tạo hóa đơn mới</span>
                </button>
              </div>

                  {/* Order List */}
                  <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 text-gray-900 dark:text-white">
                    Hóa đơn trong ca
                  </h3>
                  {orders.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">Chưa có hóa đơn nào trong ca này.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-4">
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
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {order.status === 'completed' ? 'Đã thanh toán' : order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </>
              )}

              {!loading && !shift && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="mb-6">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                      schedule
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Chưa có ca làm việc
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                    Bạn chưa có ca làm việc hôm nay. Vui lòng liên hệ quản lý để được tạo ca hoặc đợi quản lý tạo ca cho bạn.
                  </p>
                  <button
                    onClick={() => navigate(RoutePath.WORKER_START_SHIFT)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                    <span>Xem ca làm việc</span>
                  </button>
                </div>
              )}
            </main>

            {/* Bottom Nav */}
            <BottomNavWorker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHomePage;