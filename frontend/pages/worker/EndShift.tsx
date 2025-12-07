import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import * as shiftsService from '../../src/services/shifts.service';
import * as ordersService from '../../src/services/orders.service';
import { Shift } from '../../src/services/shifts.service';
import { Order } from '../../src/services/orders.service';

const EndShiftPage: React.FC = () => {
  const navigate = useNavigate();
  const [shift, setShift] = useState<Shift | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentShift = await shiftsService.getCurrentShift();
      if (currentShift) {
        setShift(currentShift);
        const shiftOrders = await ordersService.getOrdersByShift(currentShift.id);
        setOrders(shiftOrders);
      } else {
        setError('Bạn chưa có ca làm việc active. Không thể kết thúc ca.');
      }
    } catch (err: any) {
      console.error('Load end shift data error:', err);
      // Nếu là lỗi 404, hiển thị thông báo không có ca
      if (err.response?.status === 404 || err.response?.statusCode === 404) {
        setError('Bạn chưa có ca làm việc active. Không thể kết thúc ca.');
      } else {
        setError(err.message || 'Lỗi tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tính toán từ shift - Số dư cuối ca = Tiền giao ca - Tổng tiền hàng đã trả
  const calculations = useMemo(() => {
    if (!shift) return null;

    const tienGiaoCaBanDau = shift.tienGiaoCa;
    const tongTienHangDaTra = shift.tongTienHangDaTra;
    const soDuCuoiCa = tienGiaoCaBanDau - tongTienHangDaTra;

    return {
      tienGiaoCaBanDau,
      tongTienHangDaTra,
      soDuCuoiCa,
    };
  }, [shift]);

  const handleEndShift = async () => {
    if (!shift) return;

    if (!confirm('Bạn có chắc chắn muốn kết thúc ca làm việc này?')) {
      return;
    }

    setIsEnding(true);
    setError(null);
    try {
      await shiftsService.endShift(shift.id);
      navigate(RoutePath.LOGIN);
    } catch (err: any) {
      console.error('End shift error:', err);
      setError(err.message || 'Lỗi kết thúc ca. Vui lòng thử lại.');
      setIsEnding(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center items-center py-10">
          <div className="layout-content-container flex flex-col w-full max-w-[560px] flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.03em]">
                  Báo Cáo và Kết Thúc Ca
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 text-base font-normal leading-normal">
                  Tóm tắt hiệu suất và dòng tiền trong ca làm việc.
                </p>
              </div>
            </div>
            {loading && (
              <div className="p-6 md:p-8 flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-6 md:p-8">
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!loading && calculations && (
              <>
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-y-3">
                {/* Tiền giao ca */}
                <div className="flex justify-between gap-x-6 py-2">
                  <p className="text-gray-500 dark:text-zinc-400 text-sm font-normal leading-normal">
                    Tiền giao ca ban đầu
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal text-right">
                    {calculations.tienGiaoCaBanDau.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                
                {/* Tổng tiền hàng đã trả */}
                <div className="flex justify-between gap-x-6 py-2">
                  <p className="text-gray-500 dark:text-zinc-400 text-sm font-normal leading-normal">
                    Tổng tiền hàng đã trả (đã mua)
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium leading-normal text-right">
                    -{calculations.tongTienHangDaTra.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                
                {/* Số dư cuối ca */}
                <div className="flex justify-between gap-x-6 py-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <p className="text-gray-600 dark:text-zinc-300 text-sm font-bold leading-normal">
                    Số dư cuối ca
                  </p>
                  <p className="text-gray-900 dark:text-white text-lg font-bold leading-normal text-right">
                    {calculations.soDuCuoiCa.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-b-xl p-6 md:p-8">
              <div className="flex pt-2">
                <button
                  onClick={handleEndShift}
                  disabled={isEnding || !shift}
                  className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/80 dark:focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnding ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span className="truncate">Đang xử lý...</span>
                    </>
                  ) : (
                    <span className="truncate">Xác nhận kết ca</span>
                  )}
                </button>
              </div>
            </div>
              </>
            )}

            {!loading && !shift && !error && (
              <div className="p-6 md:p-8">
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.
                  </p>
                  <button
                    onClick={() => navigate(RoutePath.WORKER_HOME)}
                    className="text-primary hover:text-primary-dark dark:text-primary-light"
                  >
                    Quay lại trang chính
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndShiftPage;