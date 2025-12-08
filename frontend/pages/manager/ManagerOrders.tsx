import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotification } from '../../src/context/NotificationContext';
import Avatar from '../../src/components/common/Avatar';
import * as ordersService from '../../src/services/orders.service';
import * as staffService from '../../src/services/staff.service';
import { Order } from '../../src/services/orders.service';
import { Staff } from '../../src/services/staff.service';

const ManagerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state cho sửa hóa đơn
  const [editFormData, setEditFormData] = useState({
    tienHang: 0,
    tienCongGom: 0,
    phiDongHang: 0,
    tienHoaHong: 0,
    tienThem: 0,
    loaiTienThem: '',
  });

  // Filter states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStaffId, setFilterStaffId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'completed' | 'cancelled' | ''>('');

  const loadStaffList = useCallback(async () => {
    try {
      const data = await staffService.getStaffList();
      setStaffList(data.filter(s => s.isActive !== false));
    } catch (err: any) {
      console.error('Load staff list error:', err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;

      let ordersData = await ordersService.getOrdersList(params);

      // Filter by staffId ở frontend (API chưa hỗ trợ)
      if (filterStaffId) {
        ordersData = ordersData.filter(order => order.staffId === filterStaffId);
      }

      setOrders(ordersData);
    } catch (err: any) {
      console.error('Load orders error:', err);
      setError(err.message || 'Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStaffId, filterStatus]);

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleFilter = () => {
    loadOrders();
  };

  const handleViewOrder = (orderId: string) => {
    navigate(RoutePath.WORKER_ORDER_DETAIL.replace(':id', orderId));
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn hàng này?')) {
      return;
    }

    setApprovingOrderId(orderId);
    try {
      await ordersService.updateOrder(orderId, { status: 'completed' });
      showSuccess('Duyệt đơn hàng thành công');
      await loadOrders(); // Reload danh sách
    } catch (err: any) {
      console.error('Approve order error:', err);
      showError(err.message || 'Không thể duyệt đơn hàng. Vui lòng thử lại.');
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    setApprovingOrderId(orderId);
    try {
      await ordersService.updateOrder(orderId, { status: 'cancelled' });
      showSuccess('Hủy đơn hàng thành công');
      await loadOrders(); // Reload danh sách
    } catch (err: any) {
      console.error('Cancel order error:', err);
      showError(err.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditFormData({
      tienHang: order.tienHang,
      tienCongGom: order.tienCongGom,
      phiDongHang: order.phiDongHang,
      tienHoaHong: order.tienHoaHong || 0,
      tienThem: order.tienThem || 0,
      loaiTienThem: order.loaiTienThem || '',
    });
    setError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
    setEditFormData({
      tienHang: 0,
      tienCongGom: 0,
      phiDongHang: 0,
      tienHoaHong: 0,
      tienThem: 0,
      loaiTienThem: '',
    });
    setError(null);
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;

    // Validation
    if (editFormData.tienHang <= 0) {
      setError('Tiền hàng phải lớn hơn 0');
      return;
    }

    // Nếu có tienThem > 0 nhưng chưa nhập loaiTienThem
    if (editFormData.tienThem > 0 && !editFormData.loaiTienThem.trim()) {
      if (!confirm('Bạn chưa nhập loại tiền thêm. Bạn có muốn tiếp tục không?')) {
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    try {
      const updateData: any = {
        tienHang: editFormData.tienHang,
        tienCongGom: editFormData.tienCongGom,
        phiDongHang: editFormData.phiDongHang,
        tienHoaHong: editFormData.tienHoaHong || 0,
      };

      // Chỉ gửi tienThem và loaiTienThem nếu được nhập
      if (editFormData.tienThem !== undefined && editFormData.tienThem > 0) {
        updateData.tienThem = editFormData.tienThem;
        updateData.loaiTienThem = editFormData.loaiTienThem.trim() || null;
      } else {
        updateData.tienThem = 0;
        updateData.loaiTienThem = null;
      }

      await ordersService.updateOrder(editingOrder.id, updateData);
      showSuccess('Sửa hóa đơn thành công');
      await loadOrders();
      handleCloseEditModal();
    } catch (err: any) {
      console.error('Save order error:', err);
      setError(err.message || 'Lỗi sửa hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">dashboard</span>
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
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-light text-primary-dark font-semibold dark:bg-primary/20 dark:text-white w-full text-left">
              <span className="material-symbols-outlined fill text-2xl">receipt_long</span>
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

      <main className="flex-1 w-full pb-20 lg:pb-0" style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="sticky top-0 z-10 lg:hidden flex justify-between items-center p-4 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-800/60">
          <h1 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
            Đơn hàng
          </h1>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="hidden lg:flex flex-wrap justify-between gap-4 items-center mb-6">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Danh sách Đơn hàng
              </h1>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-[#111827] rounded-xl p-4 mb-6 border border-gray-200/80 dark:border-gray-800/60">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col lg:col-span-2">
                  <p className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal pb-2">
                    Chọn ngày
                  </p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      calendar_month
                    </span>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 p-3 pl-10 text-base font-normal leading-normal"
                    />
                  </div>
                </div>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal pb-2">
                    Nhân viên
                  </p>
                  <select
                    value={filterStaffId}
                    onChange={(e) => setFilterStaffId(e.target.value)}
                    className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 p-3 text-base font-normal leading-normal"
                  >
                    <option value="">Tất cả</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-300 text-sm font-medium leading-normal pb-2">
                    Trạng thái
                  </p>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 p-3 text-base font-normal leading-normal"
                  >
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="completed">Đã duyệt</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </label>
                <button
                  onClick={handleFilter}
                  className="flex items-center justify-center overflow-hidden rounded-lg h-12 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 w-full lg:w-auto hover:bg-primary/90 transition-colors col-span-1 md:col-span-2 lg:col-span-1"
                >
                  <span className="material-symbols-outlined fill text-xl">filter_list</span>
                  <span className="truncate">Lọc</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Table Section */}
            <div className="lg:bg-white lg:dark:bg-[#111827] lg:rounded-xl lg:overflow-hidden lg:border lg:border-gray-200/80 lg:dark:border-gray-800/60">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">receipt_long</span>
                  <p className="text-lg font-medium">Chưa có đơn hàng</p>
                  <p className="text-sm mt-2">Hãy thử chọn ngày khác hoặc xóa bộ lọc</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-3" scope="col">Mã đơn</th>
                          <th className="px-6 py-3" scope="col">Ngày giờ</th>
                          <th className="px-6 py-3" scope="col">Khách</th>
                          <th className="px-6 py-3" scope="col">Nhân viên</th>
                          <th className="px-6 py-3" scope="col">Quầy</th>
                          <th className="px-6 py-3 text-right" scope="col">Tổng tiền</th>
                          <th className="px-6 py-3 text-center" scope="col">Trạng thái</th>
                          <th className="px-6 py-3 text-center" scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          return (
                            <tr
                              key={order.id}
                              className="bg-white dark:bg-transparent border-b dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" scope="row">
                                #{order.id.slice(-8).toUpperCase()}
                              </th>
                              <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                              <td className="px-6 py-4">{order.customerName || 'N/A'}</td>
                              <td className="px-6 py-4">{order.staffName || 'N/A'}</td>
                              <td className="px-6 py-4">{order.counterName || 'N/A'}</td>
                              <td className="px-6 py-4 text-right">{formatCurrency(order.tongTienHoaDon)}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleViewOrder(order.id)}
                                    className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
                                  >
                                    Xem
                                  </button>
                                  {user?.role === 'admin' && (
                                    <button
                                      onClick={() => handleOpenEditModal(order)}
                                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Sửa
                                    </button>
                                  )}
                                  {order.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveOrder(order.id)}
                                        disabled={approvingOrderId === order.id}
                                        className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {approvingOrderId === order.id ? 'Đang xử lý...' : 'Duyệt'}
                                      </button>
                                      <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        disabled={approvingOrderId === order.id}
                                        className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Hủy
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="space-y-4 lg:hidden">
                    {orders.map((order) => {
                      return (
                        <div
                          key={order.id}
                          className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-base text-gray-900 dark:text-white">
                                #{order.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-800/60">
                            <div className="flex justify-between items-center text-sm">
                              <p className="text-gray-500 dark:text-gray-400">Khách hàng</p>
                              <p className="text-gray-900 dark:text-white font-medium">{order.customerName || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-2">
                              <p className="text-gray-500 dark:text-gray-400">Nhân viên</p>
                              <p className="text-gray-900 dark:text-white font-medium">{order.staffName || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-2">
                              <p className="text-gray-500 dark:text-gray-400">Quầy</p>
                              <p className="text-gray-900 dark:text-white font-medium">{order.counterName || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-2">
                              <p className="text-gray-500 dark:text-gray-400">Tổng tiền</p>
                              <p className="text-gray-900 dark:text-white font-bold">{formatCurrency(order.tongTienHoaDon)}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="flex-1 min-w-[100px] flex items-center justify-center h-10 px-4 rounded-lg bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light text-sm font-bold hover:bg-primary/20 transition-colors"
                            >
                              Chi tiết
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleOpenEditModal(order)}
                                className="flex-1 min-w-[100px] flex items-center justify-center h-10 px-4 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                Sửa
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveOrder(order.id)}
                                  disabled={approvingOrderId === order.id}
                                  className="flex-1 min-w-[100px] flex items-center justify-center h-10 px-4 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 text-sm font-bold hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {approvingOrderId === order.id ? 'Đang xử lý...' : 'Duyệt'}
                                </button>
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={approvingOrderId === order.id}
                                  className="flex-1 min-w-[100px] flex items-center justify-center h-10 px-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseEditModal}
        >
          <div 
            className="bg-white dark:bg-[#111827] rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Sửa hóa đơn</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2"
                disabled={isSaving}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Order Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mã đơn</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">#{editingOrder.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-1">Khách hàng</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{editingOrder.customerName || 'N/A'}</p>
              </div>

              {/* Money Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiền hàng (VNĐ) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editFormData.tienHang}
                    onChange={(e) => setEditFormData({ ...editFormData, tienHang: parseFloat(e.target.value) || 0 })}
                    className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiền công gom (VNĐ)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editFormData.tienCongGom}
                    onChange={(e) => setEditFormData({ ...editFormData, tienCongGom: parseFloat(e.target.value) || 0 })}
                    className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phí đóng hàng (VNĐ)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editFormData.phiDongHang}
                    onChange={(e) => setEditFormData({ ...editFormData, phiDongHang: parseFloat(e.target.value) || 0 })}
                    className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiền hoa hồng (VNĐ)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editFormData.tienHoaHong}
                    onChange={(e) => setEditFormData({ ...editFormData, tienHoaHong: parseFloat(e.target.value) || 0 })}
                    className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Additional Money Fields */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tiền thêm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Loại tiền (Ghi chú)
                    </label>
                    <input
                      type="text"
                      value={editFormData.loaiTienThem}
                      onChange={(e) => setEditFormData({ ...editFormData, loaiTienThem: e.target.value })}
                      placeholder="VD: Gửi xe, Phí khác..."
                      className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số tiền thêm (VNĐ)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={editFormData.tienThem}
                      onChange={(e) => setEditFormData({ ...editFormData, tienThem: parseFloat(e.target.value) || 0 })}
                      className="form-input w-full rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tổng tiền hóa đơn</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(
                      editFormData.tienHang + 
                      editFormData.tienCongGom + 
                      editFormData.phiDongHang + 
                      (editFormData.tienHoaHong || 0) + 
                      (editFormData.tienThem || 0)
                    ).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseEditModal}
                  className="flex-1 h-12 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="flex-1 h-12 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavAdmin />
    </div>
  );
};

export default ManagerOrdersPage;