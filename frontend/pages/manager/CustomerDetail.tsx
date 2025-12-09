import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import BottomNavWorker from '../../components/worker/BottomNavWorker';
import { useAuth } from '../../src/hooks/useAuth';
import * as customersService from '../../src/services/customers.service';
import { Customer } from '../../src/services/customers.service';
import * as ordersService from '../../src/services/orders.service';
import { Order } from '../../src/services/orders.service';
import { generateInvoicePDF } from '../../src/services/pdf.service';

const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho lọc theo ngày
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) {
        setError('Không tìm thấy mã khách hàng');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const customerData = await customersService.getCustomerById(id);
        setCustomer(customerData);
      } catch (err: any) {
        console.error('Load customer error:', err);
        setError(err.message || 'Không tìm thấy khách hàng');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  // Load đơn hàng của khách hàng theo ngày
  useEffect(() => {
    const loadOrders = async () => {
      if (!id) return;

      setLoadingOrders(true);
      try {
        const ordersData = await ordersService.getOrdersList({
          customerId: id,
          date: selectedDate,
        });
        setOrders(ordersData);
      } catch (err: any) {
        console.error('Load orders error:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [id, selectedDate]);

  // Format ngày hiển thị
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tính tổng tiền và số lượng đơn hàng
  const stats = {
    count: orders.length,
    totalAmount: orders.reduce((sum, order) => sum + order.tongTienHoaDon, 0),
    totalTienHang: orders.reduce((sum, order) => sum + order.tienHang, 0),
    totalTienCongGom: orders.reduce((sum, order) => sum + order.tienCongGom, 0),
    totalPhiDongHang: orders.reduce((sum, order) => sum + order.phiDongHang, 0),
    totalTienHoaHong: orders.reduce((sum, order) => sum + (order.tienHoaHong || 0), 0),
  };

  // Xuất hóa đơn tổng hợp
  const handleExportInvoice = async () => {
    if (!customer || orders.length === 0) {
      alert('Khách hàng này không có hóa đơn trong ngày được chọn.');
      return;
    }

    try {
      const orderDate = new Date(selectedDate + 'T00:00:00');
      
      // Tạo danh sách items từ các hóa đơn
      const items = orders.map((order) => {
        return {
          description: `${order.counterName || 'Quầy'}`,
          quantity: 1,
          price: order.tongTienHoaDon,
          counterName: order.counterName || 'Quầy',
        };
      });

      // Tạo hóa đơn tổng hợp - chế độ đơn giản
      await generateInvoicePDF({
        orderId: `CUSTOMER_${customer.id}_${selectedDate.replace(/-/g, '')}`,
        customerName: customer.name,
        customerPhone: customer.phone,
        date: orderDate.toISOString(),
        time: orderDate.toISOString(),
        tienHang: stats.totalTienHang,
        tienCongGom: stats.totalTienCongGom,
        phiDongHang: stats.totalPhiDongHang,
        tienHoaHong: stats.totalTienHoaHong,
        tongTienHoaDon: stats.totalAmount,
        items: items,
        simpleMode: true,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    }
  };

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateStr = d.toLocaleDateString('vi-VN');
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${timeStr} - ${dateStr}`;
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <main className="flex-1 pb-20 lg:pb-8" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <header className="sticky top-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(RoutePath.ADMIN_CUSTOMERS)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
              Chi tiết khách hàng
            </h1>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!loading && customer && (
            <>
              {/* Thông tin khách hàng */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-6 mb-6 border border-gray-200/80 dark:border-gray-800/60">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {customer.name}
                </h2>
                <div className="space-y-2">
                  {customer.phone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Số điện thoại:</span> {customer.phone}
                    </p>
                  )}
                  {customer.address && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Địa chỉ:</span> {customer.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Bộ lọc ngày */}
              <div className="mb-6">
                <label className="flex flex-col w-full max-w-xs">
                  <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                    Chọn ngày để xem hóa đơn
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
                      disabled={loadingOrders}
                    />
                  </div>
                  <p className="pt-2 text-sm text-gray-500 dark:text-gray-400">
                    Đang xem: <span className="font-medium">{formatDateDisplay(selectedDate)}</span>
                  </p>
                </label>
              </div>

              {/* Thống kê hóa đơn */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-6 mb-6 border border-gray-200/80 dark:border-gray-800/60">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Hóa đơn ngày {formatDateDisplay(selectedDate)}
                </h3>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Số lượng hóa đơn</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền</p>
                        <p className="text-2xl font-bold text-primary dark:text-primary-light">
                          {stats.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>

                    {stats.count > 0 && (
                      <button
                        onClick={handleExportInvoice}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined">receipt_long</span>
                        <span>Xuất hóa đơn PDF</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Danh sách hóa đơn */}
              {loadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] rounded-xl p-6 border border-gray-200/80 dark:border-gray-800/60 text-center text-gray-500 dark:text-gray-400">
                  Không có hóa đơn nào trong ngày này
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {order.counterName || 'Quầy'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary dark:text-primary-light">
                          {order.tongTienHoaDon.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {user?.role === 'worker' ? <BottomNavWorker /> : <BottomNavAdmin />}
    </div>
  );
};

export default CustomerDetailPage;

