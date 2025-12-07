import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import { useAuth } from '../../src/hooks/useAuth';
import * as shiftsService from '../../src/services/shifts.service';
import { Shift } from '../../src/services/shifts.service';

const StartShiftPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const loadCurrentShift = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentShift = await shiftsService.getCurrentShift();
        setShift(currentShift);
      } catch (err: any) {
        console.error('Load current shift error:', err);
        setError(err.message || 'Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentShift();
  }, []);

  const handleStartShift = async () => {
    if (!shift) return;

    setIsStarting(true);
    setError(null);
    try {
      await shiftsService.startShift(shift.id);
      navigate(RoutePath.WORKER_HOME);
    } catch (err: any) {
      console.error('Start shift error:', err);
      setError(err.message || 'Lỗi bắt đầu ca. Vui lòng thử lại.');
      setIsStarting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <main className="layout-content-container flex w-full flex-col max-w-lg flex-1">
            <div className="flex flex-col gap-3 py-4 text-center">
              <h1 className="text-3xl font-black leading-tight tracking-tighter sm:text-4xl text-gray-900 dark:text-white">
                Bắt đầu ca làm việc
              </h1>
              <p className="text-base font-normal leading-normal text-gray-500 dark:text-gray-400">
                Xác nhận thông tin ca làm việc của bạn.
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin ca...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && shift && (
              <>
                {/* Hiển thị thông tin ca */}
                <div className="flex flex-col gap-6 py-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Nhân viên:
                        </p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {user?.name || shift.staffName}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                          Ngày:
                        </p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {formatDate(shift.date)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          Tiền giao ca:
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {shift.tienGiaoCa.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center pt-8">
                  <button
                    onClick={handleStartShift}
                    disabled={isStarting}
                    className="flex h-12 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-base font-bold leading-normal tracking-[0.015em] text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStarting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span className="truncate">Đang bắt đầu...</span>
                      </>
                    ) : (
                      <span className="truncate">Bắt đầu ca</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {!loading && !shift && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.
                </p>
                <button
                  onClick={() => navigate(RoutePath.LOGIN)}
                  className="text-primary hover:text-primary-dark dark:text-primary-light"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StartShiftPage;
