import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generateInvoicePDF } from '../../src/services/pdf.service';
import * as ordersService from '../../src/services/orders.service';
import { Order } from '../../src/services/orders.service';

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const orderData = await ordersService.getOrderById(id);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Load order detail error:', err);
        setError(err.message || 'Không tìm thấy đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateStr = d.toLocaleDateString('vi-VN');
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${timeStr} - ${dateStr}`;
  };

  const handleExportPDF = async () => {
    if (!order) return;

    setIsGeneratingPDF(true);
    try {
      const orderDate = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt;
      
      await generateInvoicePDF({
        orderId: order.id,
        customerName: order.customerName || 'N/A',
        counterName: order.counterName || 'N/A',
        date: orderDate.toISOString(),
        time: orderDate.toISOString(), // Pass ISO string, formatTime will parse it
        tienHang: order.tienHang,
        tienCongGom: order.tienCongGom,
        phiDongHang: order.phiDongHang,
        tienHoaHong: order.tienHoaHong || 0,
        tienThem: order.tienThem,
        loaiTienThem: order.loaiTienThem,
        tongTienHoaDon: order.tongTienHoaDon,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8">
          <div className="layout-content-container flex flex-col w-full max-w-2xl flex-1">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 rounded-t-xl">
              <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                <button onClick={() => navigate(-1)} className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1">
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold leading-tight tracking-tight">Chi tiết Hóa đơn</h2>
              </div>
            </header>
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin đơn hàng...</p>
              </div>
            )}

            {error && (
              <div className="p-4 sm:p-6">
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            )}

            {!loading && order && (
              <>
            <main className="flex-grow p-4 sm:p-6 bg-white dark:bg-gray-800">
              <div className="flex flex-col items-stretch justify-start rounded-lg">
                <div className="flex w-full flex-col items-stretch justify-center gap-1 py-4 px-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    Khách hàng: {order.customerName || 'N/A'}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                        Mã đơn: #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                        Quầy: {order.counterName || 'N/A'}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                        Tạo lúc: {formatDateTime(order.createdAt)} | NV: {order.staffName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết các loại tiền */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Chi tiết tiền
                </h3>
                
                <div className="flex justify-between gap-x-6 py-2.5">
                  <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    Tiền hàng (trả cho quầy)
                  </p>
                  <p className="text-gray-900 dark:text-white text-base font-normal leading-normal text-right">
                    {order.tienHang.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                
                <div className="flex justify-between gap-x-6 py-2.5">
                  <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    Tiền công gom
                  </p>
                  <p className="text-gray-900 dark:text-white text-base font-normal leading-normal text-right">
                    {order.tienCongGom.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                
                <div className="flex justify-between gap-x-6 py-2.5">
                  <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                    Phí đóng hàng
                  </p>
                  <p className="text-gray-900 dark:text-white text-base font-normal leading-normal text-right">
                    {order.phiDongHang.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                
                {order.tienHoaHong > 0 && (
                  <div className="flex justify-between gap-x-6 py-2.5 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                      Tiền hoa hồng
                    </p>
                    <p className="text-gray-900 dark:text-white text-base font-normal leading-normal text-right">
                      {order.tienHoaHong.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
                
                {(order.tienThem !== undefined && order.tienThem !== null && order.tienThem > 0) && (
                  <div className="flex justify-between gap-x-6 py-2.5 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                      {order.loaiTienThem ? order.loaiTienThem : 'Tiền thêm'}
                    </p>
                    <p className="text-gray-900 dark:text-white text-base font-normal leading-normal text-right">
                      {order.tienThem.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between gap-x-6 py-2.5 mt-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-gray-500 dark:text-gray-400 text-base font-bold leading-normal">
                    Tổng tiền hóa đơn (khách phải trả)
                  </p>
                  <p className="text-gray-900 dark:text-white text-lg font-bold leading-normal text-right">
                    {order.tongTienHoaDon.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </main>
            <div className="px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl">
              <div className="flex flex-1 gap-3 flex-col items-stretch">
                <button
                  onClick={handleExportPDF}
                  disabled={isGeneratingPDF || !order}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span className="truncate">Đang tạo PDF...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
                      <span className="truncate">Xuất bill PDF</span>
                    </>
                  )}
                </button>
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary/20 text-primary text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-primary/30">
                  <span className="material-symbols-outlined mr-2">share</span>
                  <span className="truncate">Chia sẻ</span>
                </button>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
