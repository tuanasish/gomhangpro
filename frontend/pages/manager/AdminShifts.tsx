import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotification } from '../../src/context/NotificationContext';
import Avatar from '../../src/components/common/Avatar';
import * as shiftsService from '../../src/services/shifts.service';
import * as staffService from '../../src/services/staff.service';
import * as ordersService from '../../src/services/orders.service';
import { Shift, ShiftMoneyAddition } from '../../src/services/shifts.service';
import { Staff } from '../../src/services/staff.service';

const AdminShiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedShiftForMoney, setSelectedShiftForMoney] = useState<Shift | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyNote, setAddMoneyNote] = useState('');
  const [moneyAdditions, setMoneyAdditions] = useState<ShiftMoneyAddition[]>([]);
  const [loadingAdditions, setLoadingAdditions] = useState(false);
  const [editingAddition, setEditingAddition] = useState<ShiftMoneyAddition | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [shifts, setShifts] = useState<(Shift & { soDonHang?: number; tongTienHoaDon?: number })[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingMoney, setIsProcessingMoney] = useState(false);

  // Filter states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStaffId, setFilterStaffId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'ended' | ''>('');

  const formatMoneyInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseMoneyValue = (value: string) => {
    const normalized = value.replace(/\./g, '');
    return normalized ? parseFloat(normalized) : NaN;
  };

  // Form state cho tạo ca mới
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    date: new Date().toISOString().split('T')[0],
    tienGiaoCa: '',
  });

  const loadStaffList = useCallback(async () => {
    try {
      const data = await staffService.getStaffList();
      setStaffList(data.filter(s => s.isActive !== false));
    } catch (err: any) {
      console.error('Load staff list error:', err);
    }
  }, []);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filterDate) params.date = filterDate;
      if (filterStaffId) params.staffId = filterStaffId;
      if (filterStatus) params.status = filterStatus;

      const shiftsData = await shiftsService.getShiftsList(params);
      
      // Load tất cả orders cho ngày được filter (tối ưu: một lần thay vì N lần)
      let allOrders: any[] = [];
      if (filterDate) {
        try {
          allOrders = await ordersService.getOrdersList({ date: filterDate });
        } catch (err) {
          console.error('Load orders error:', err);
          // Nếu không load được orders, vẫn hiển thị shifts nhưng không có số đơn
        }
      } else {
        // Nếu không filter theo ngày, load orders cho từng shift (fallback)
        const ordersPromises = shiftsData.map((shift) =>
          ordersService.getOrdersByShift(shift.id).catch(() => [])
        );
        const ordersArrays = await Promise.all(ordersPromises);
        allOrders = ordersArrays.flat();
      }
      
      // Group orders theo shiftId
      const ordersByShiftId = new Map<string, any[]>();
      allOrders.forEach((order) => {
        const existing = ordersByShiftId.get(order.shiftId) || [];
        existing.push(order);
        ordersByShiftId.set(order.shiftId, existing);
      });

      // Merge orders data vào shifts
      const shiftsWithOrders = shiftsData.map((shift) => {
        const orders = ordersByShiftId.get(shift.id) || [];
        const tongTienHoaDon = orders.reduce((sum, order) => sum + order.tongTienHoaDon, 0);
        return {
          ...shift,
          soDonHang: orders.length,
          tongTienHoaDon,
        };
      });

      setShifts(shiftsWithOrders);
    } catch (err: any) {
      console.error('Load shifts error:', err);
      setError(err.message || 'Lỗi tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStaffId, filterStatus]);

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleCreateShift = async () => {
    if (!formData.staffId || !formData.tienGiaoCa) {
      showWarning('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const tienGiaoCa = parseMoneyValue(formData.tienGiaoCa);
    if (isNaN(tienGiaoCa) || tienGiaoCa <= 0) {
      showWarning('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await shiftsService.createShift({
        staffId: formData.staffId,
        date: formData.date,
        tienGiaoCa,
        // counterId không cần khi tạo ca
      });
      await loadShifts();
      handleCloseModal();
      showSuccess('Tạo ca làm việc thành công');
    } catch (err: any) {
      console.error('Create shift error:', err);
      const errorMessage = err.message || 'Lỗi tạo ca làm việc';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setFormData({
        ...formData,
        staffId: staff.id,
        staffName: staff.name,
      });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      staffId: '',
      staffName: '',
      date: new Date().toISOString().split('T')[0],
      tienGiaoCa: '',
    });
    setError(null);
  };

  const loadMoneyAdditions = useCallback(async (shiftId: string) => {
    setLoadingAdditions(true);
    try {
      const additions = await shiftsService.getShiftMoneyAdditions(shiftId);
      setMoneyAdditions(additions);
    } catch (err: any) {
      console.error('Load money additions error:', err);
      setError(err.message || 'Lỗi tải lịch sử thêm tiền');
    } finally {
      setLoadingAdditions(false);
    }
  }, []);

  const handleOpenMoneyModal = async (shift: Shift) => {
    setSelectedShiftForMoney(shift);
    setShowMoneyModal(true);
    setError(null);
    setEditingAddition(null);
    setEditAmount('');
    setEditNote('');
    setAddMoneyAmount('');
    setAddMoneyNote('');
    await loadMoneyAdditions(shift.id);
  };

  const handleCloseMoneyModal = () => {
    setShowMoneyModal(false);
    setSelectedShiftForMoney(null);
    setMoneyAdditions([]);
    setEditingAddition(null);
    setEditAmount('');
    setEditNote('');
    setAddMoneyAmount('');
    setAddMoneyNote('');
    setError(null);
  };

  const handleAddMoney = async () => {
    if (!selectedShiftForMoney || !addMoneyAmount) {
      showWarning('Vui lòng nhập số tiền');
      return;
    }

    const amount = parseMoneyValue(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) {
      showWarning('Số tiền phải lớn hơn 0');
      return;
    }

    setIsProcessingMoney(true);
    setError(null);
    try {
      await shiftsService.addMoneyToShift(selectedShiftForMoney.id, amount, addMoneyNote.trim() || undefined);
      await loadShifts();
      await loadMoneyAdditions(selectedShiftForMoney.id);
      setAddMoneyAmount('');
      setAddMoneyNote('');
      showSuccess(`Đã cộng thêm ${amount.toLocaleString('vi-VN')}đ vào ca`);
    } catch (err: any) {
      console.error('Add money error:', err);
      const errorMessage = err.message || 'Lỗi cập nhật tiền';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsProcessingMoney(false);
    }
  };


  const handleStartEditAddition = (addition: ShiftMoneyAddition) => {
    setEditingAddition(addition);
    setEditAmount(formatMoneyInput(addition.amount.toString()));
    setEditNote(addition.note || '');
  };

  const handleCancelEditAddition = () => {
    setEditingAddition(null);
    setEditAmount('');
    setEditNote('');
  };

  const handleSaveEditAddition = async () => {
    if (!selectedShiftForMoney || !editingAddition || !editAmount) {
      showWarning('Vui lòng nhập số tiền');
      return;
    }

    const amount = parseMoneyValue(editAmount);
    if (isNaN(amount) || amount <= 0) {
      showWarning('Số tiền phải lớn hơn 0');
      return;
    }

    setIsProcessingMoney(true);
    setError(null);
    try {
      await shiftsService.updateShiftMoneyAddition(selectedShiftForMoney.id, editingAddition.id, {
        amount,
        note: editNote.trim() || undefined,
      });
      await loadShifts();
      await loadMoneyAdditions(selectedShiftForMoney.id);
      handleCancelEditAddition();
      
      const oldAmount = editingAddition.amount;
      const diff = amount - oldAmount;
      if (diff > 0) {
        showSuccess(`Đã cộng thêm ${diff.toLocaleString('vi-VN')}đ (sửa từ ${oldAmount.toLocaleString('vi-VN')}đ thành ${amount.toLocaleString('vi-VN')}đ)`);
      } else if (diff < 0) {
        showSuccess(`Đã trừ ${Math.abs(diff).toLocaleString('vi-VN')}đ (sửa từ ${oldAmount.toLocaleString('vi-VN')}đ thành ${amount.toLocaleString('vi-VN')}đ)`);
      } else {
        showSuccess('Đã cập nhật ghi chú');
      }
    } catch (err: any) {
      console.error('Edit addition error:', err);
      const errorMessage = err.message || 'Lỗi cập nhật lần thêm tiền';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsProcessingMoney(false);
    }
  };

  const handleDeleteAddition = async (addition: ShiftMoneyAddition) => {
    if (!selectedShiftForMoney) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa lần thêm ${addition.amount.toLocaleString('vi-VN')}đ?`)) {
      return;
    }

    setIsProcessingMoney(true);
    setError(null);
    try {
      await shiftsService.deleteShiftMoneyAddition(selectedShiftForMoney.id, addition.id);
      await loadShifts();
      await loadMoneyAdditions(selectedShiftForMoney.id);
      showSuccess(`Đã xóa lần thêm tiền (trừ ${addition.amount.toLocaleString('vi-VN')}đ)`);
    } catch (err: any) {
      console.error('Delete addition error:', err);
      const errorMessage = err.message || 'Lỗi xóa lần thêm tiền';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsProcessingMoney(false);
    }
  };

  const handleEndShift = async (shiftId: string, staffName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn kết thúc ca làm việc của ${staffName} không?`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await shiftsService.endShift(shiftId);
      showSuccess(`Đã kết thúc ca của ${staffName}`);
      await loadShifts();
    } catch (err: any) {
      console.error('End shift error:', err);
      showError(err.message || 'Lỗi kết thúc ca');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'Đang làm';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const addAmountNumber = parseMoneyValue(addMoneyAmount);
  const editAmountNumber = parseMoneyValue(editAmount);

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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-light text-primary-dark font-semibold dark:bg-primary/20 dark:text-white w-full text-left"
            >
              <span className="material-symbols-outlined fill text-2xl">work_history</span>
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
            onClick={() => setShowCreateModal(true)}
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
        <header className="lg:hidden sticky top-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-800/60">
          <h1 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
            Ca làm việc
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/50"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex-wrap justify-between gap-4 items-center mb-6 hidden lg:flex">
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Quản lý Ca làm việc
              </h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Tạo ca mới</span>
              </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-[#111827] rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200/80 dark:border-gray-800/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base font-medium leading-normal pb-2">
                    Chọn ngày
                  </p>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-11 sm:h-12 p-3 text-base font-normal leading-normal touch-manipulation"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base font-medium leading-normal pb-2">
                    Nhân viên
                  </p>
                  <select
                    value={filterStaffId}
                    onChange={(e) => setFilterStaffId(e.target.value)}
                    className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-11 sm:h-12 p-3 text-base font-normal leading-normal touch-manipulation"
                  >
                    <option value="">Tất cả</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base font-medium leading-normal pb-2">
                    Trạng thái
                  </p>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'active' | 'ended' | '')}
                    className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-11 sm:h-12 p-3 text-base font-normal leading-normal touch-manipulation"
                  >
                    <option value="">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="ended">Đã kết thúc</option>
                  </select>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách ca làm việc...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && shifts.length === 0 && !error && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có ca làm việc nào.
              </div>
            )}

            {!loading && shifts.length > 0 && (
              <>

            {/* Shifts List - Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-[#111827] rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800/60">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3" scope="col">Nhân viên</th>
                    <th className="px-6 py-3" scope="col">Ngày</th>
                    <th className="px-6 py-3" scope="col">Giờ làm việc</th>
                    <th className="px-6 py-3 text-right" scope="col">Tiền giao ca</th>
                    <th className="px-6 py-3 text-right" scope="col">Đã trả hàng</th>
                    <th className="px-6 py-3 text-right" scope="col">Quỹ còn lại</th>
                    <th className="px-6 py-3 text-center" scope="col">Số đơn</th>
                    <th className="px-6 py-3 text-center" scope="col">Trạng thái</th>
                    <th className="px-6 py-3 text-center" scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className="bg-white dark:bg-transparent border-b dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {shift.staffName}
                      </td>
                      <td className="px-6 py-4">{formatDate(shift.date)}</td>
                      <td className="px-6 py-4">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {shift.tienGiaoCa.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-right">
                        {shift.tongTienHangDaTra.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-primary">
                        {shift.quyConLai.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-center">{shift.soDonHang || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            shift.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          {shift.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {shift.status === 'active' && (
                            <button
                              onClick={() => handleEndShift(shift.id, shift.staffName || 'N/A')}
                              className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Kết thúc ca"
                            >
                              Kết thúc
                            </button>
                          )}
                          {shift.status === 'active' ? (
                            <button
                              onClick={() => handleOpenMoneyModal(shift)}
                              className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
                              title="Quản lý tiền giao ca"
                            >
                              Sửa tiền
                            </button>
                          ) : (
                            <span
                              className="font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              title="Ca đã kết thúc"
                            >
                              Sửa tiền
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedShift(shift.id)}
                            className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="space-y-3 sm:space-y-4 lg:hidden">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white dark:bg-[#111827] rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-gray-800/60 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <p className="font-bold text-base text-gray-900 dark:text-white">
                        {shift.staffName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(shift.date)} • {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        shift.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}
                    >
                      {shift.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/80 dark:border-gray-800/60">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tiền giao ca</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {shift.tienGiaoCa.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quỹ còn lại</p>
                      <p className="text-sm font-bold text-primary">
                        {shift.quyConLai.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Đã trả hàng</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {shift.tongTienHangDaTra.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Số đơn</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {shift.soDonHang || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {shift.status === 'active' && (
                      <button
                        onClick={() => handleEndShift(shift.id, shift.staffName || 'N/A')}
                        className="flex-1 min-w-[80px] flex items-center justify-center h-10 px-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Kết thúc
                      </button>
                    )}
                    {shift.status === 'active' ? (
                      <button
                        onClick={() => handleOpenMoneyModal(shift)}
                        className="flex-1 min-w-[80px] flex items-center justify-center h-10 px-4 rounded-lg bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light text-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        Sửa tiền
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 min-w-[80px] flex items-center justify-center h-10 px-4 rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 text-sm font-bold cursor-not-allowed"
                      >
                        Sửa tiền
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedShift(shift.id)}
                      className="flex-1 min-w-[80px] flex items-center justify-center h-10 px-4 rounded-lg bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light text-sm font-bold hover:bg-primary/20 transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-[#111827] rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Tạo ca mới</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2 touch-manipulation"
                aria-label="Đóng"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn nhân viên *
                </label>
                <select
                  value={formData.staffId}
                  onChange={(e) => handleSelectStaff(e.target.value)}
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 sm:h-14 p-3 sm:p-4 text-base sm:text-lg font-normal leading-normal touch-manipulation"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngày làm việc *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 sm:h-14 p-3 sm:p-4 text-base sm:text-lg font-normal leading-normal touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tiền giao ca (VNĐ) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.tienGiaoCa}
                  onChange={(e) => setFormData({ ...formData, tienGiaoCa: formatMoneyInput(e.target.value) })}
                  placeholder="Nhập số tiền giao ca"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 sm:h-14 p-3 sm:p-4 text-base sm:text-lg font-normal leading-normal touch-manipulation"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-3 pt-2 sm:pt-4 pb-2">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 h-12 sm:h-14 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-base sm:text-lg hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateShift}
                  className="flex-1 h-12 sm:h-14 px-4 rounded-lg bg-primary text-white font-bold text-base sm:text-lg hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Tạo ca'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Money Management Modal - Gộp thêm tiền và sửa lịch sử */}
      {showMoneyModal && selectedShiftForMoney && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseMoneyModal}
        >
          <div 
            className="bg-white dark:bg-[#111827] rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Quản lý tiền giao ca</h2>
              <button
                onClick={handleCloseMoneyModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2 touch-manipulation"
                aria-label="Đóng"
                disabled={isProcessingMoney}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nhân viên</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedShiftForMoney.staffName}</p>
              </div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tiền giao ca hiện tại</p>
                <p className="text-lg font-bold text-primary dark:text-primary-light">
                  {selectedShiftForMoney.tienGiaoCa.toLocaleString('vi-VN')}đ
                </p>
              </div>

              {/* Form thêm tiền mới */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Thêm tiền mới
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số tiền (VNĐ) *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={addMoneyAmount}
                      onChange={(e) => setAddMoneyAmount(formatMoneyInput(e.target.value))}
                      placeholder="Nhập số tiền cộng thêm"
                      min="1"
                      step="1"
                      className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 text-sm"
                      disabled={isProcessingMoney}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      value={addMoneyNote}
                      onChange={(e) => setAddMoneyNote(e.target.value)}
                      placeholder="Nhập ghi chú (tùy chọn)"
                      className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 text-sm"
                      disabled={isProcessingMoney}
                    />
                  </div>
                  {addMoneyAmount && !isNaN(addAmountNumber) && addAmountNumber > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tiền giao ca sau khi cộng</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {(selectedShiftForMoney.tienGiaoCa + addAmountNumber).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleAddMoney}
                    disabled={isProcessingMoney || !addMoneyAmount || isNaN(addAmountNumber) || addAmountNumber <= 0}
                    className="w-full h-10 px-4 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessingMoney ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Thêm tiền'
                    )}
                  </button>
                </div>
              </div>

              {/* Lịch sử thêm tiền */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Lịch sử đã thêm ({moneyAdditions.length} lần)
                </h3>
                {loadingAdditions ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Đang tải...</p>
                  </div>
                ) : moneyAdditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm">Chưa có lần thêm tiền nào</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {moneyAdditions.map((addition) => (
                      <div
                        key={addition.id}
                        className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 sm:p-4 border ${
                          editingAddition?.id === addition.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {editingAddition?.id === addition.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Số tiền (VNĐ) *
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={editAmount}
                                onChange={(e) => setEditAmount(formatMoneyInput(e.target.value))}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 text-sm"
                                disabled={isProcessingMoney}
                                min="1"
                                step="1"
                              />
                              {editAmount && !isNaN(editAmountNumber) && editAmountNumber !== editingAddition.amount && (
                                <p className="text-xs mt-1">
                                  {editAmountNumber > editingAddition.amount ? (
                                    <span className="text-green-600 dark:text-green-400">
                                      Sẽ cộng thêm: +{(editAmountNumber - editingAddition.amount).toLocaleString('vi-VN')}đ
                                    </span>
                                  ) : (
                                    <span className="text-orange-600 dark:text-orange-400">
                                      Sẽ trừ đi: -{(editingAddition.amount - editAmountNumber).toLocaleString('vi-VN')}đ
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Ghi chú
                              </label>
                              <input
                                type="text"
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                placeholder="Nhập ghi chú (tùy chọn)"
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 text-sm"
                                disabled={isProcessingMoney}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEditAddition}
                                disabled={isProcessingMoney || !editAmount || isNaN(editAmountNumber) || editAmountNumber <= 0}
                                className="flex-1 h-9 px-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {isProcessingMoney ? (
                                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  'Lưu'
                                )}
                              </button>
                              <button
                                onClick={handleCancelEditAddition}
                                disabled={isProcessingMoney}
                                className="flex-1 h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                  +{addition.amount.toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                              {addition.note && (
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  {addition.note}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(addition.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEditAddition(addition)}
                                disabled={isProcessingMoney}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                                title="Sửa"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAddition(addition)}
                                disabled={isProcessingMoney}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 sm:pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCloseMoneyModal}
                  className="flex-1 h-12 sm:h-14 px-4 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-base sm:text-lg hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessingMoney}
                >
                  Đóng
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

export default AdminShiftsPage;
