import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import { getStaffList, createStaff, updateStaff, deleteStaff, Staff } from '../../src/services/staff.service';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotification } from '../../src/context/NotificationContext';
import Avatar from '../../src/components/common/Avatar';

const AdminStaffPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  // Load danh sách nhân viên
  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setIsLoading(true);
      const data = await getStaffList();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhân viên');
      console.error('Load staff list error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin: Tên, Email và Mật khẩu');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await createStaff({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: 'worker', // Mặc định là worker
      });
      setShowCreateModal(false);
      setFormData({ name: '', phone: '', email: '', password: '' });
      await loadStaffList(); // Reload danh sách
    } catch (err: any) {
      setError(err.message || 'Không thể tạo nhân viên');
      console.error('Create staff error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      phone: staff.phone || '',
      email: staff.email,
      password: '',
    });
    setShowCreateModal(true);
    setError('');
  };

  const handleUpdateStaff = async () => {
    if (!formData.name || !formData.email) {
      setError('Vui lòng điền đầy đủ thông tin: Tên và Email');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!editingStaff) return;

    try {
      setIsLoading(true);
      setError('');
      await updateStaff(editingStaff.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password || undefined,
      });
      setShowCreateModal(false);
      setEditingStaff(null);
      setFormData({ name: '', phone: '', email: '', password: '' });
      await loadStaffList(); // Reload danh sách
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật nhân viên');
      console.error('Update staff error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${staffName}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteStaff(staffId);
      await loadStaffList();
      showSuccess('Xóa nhân viên thành công');
    } catch (err: any) {
      console.error('Delete staff error:', err);
      const errorMessage = err.message || 'Không thể xóa nhân viên';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingStaff(null);
    setFormData({ name: '', phone: '', email: '', password: '' });
    setError('');
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
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-light text-primary-dark font-semibold dark:bg-primary/20 dark:text-white w-full text-left"
            >
              <span className="material-symbols-outlined fill text-2xl">groups</span>
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
            <span className="truncate">Thêm nhân viên</span>
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
        <header className="lg:hidden sticky top-0 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm z-10 flex items-center justify-between p-4 border-b border-gray-200/80 dark:border-gray-800/60">
          <h1 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
            Nhân viên
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
                Quản lý Nhân viên
              </h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Thêm nhân viên</span>
              </button>
            </div>

            {error && !showCreateModal && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {isLoading && !showCreateModal && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-[#111827] rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800/60">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3" scope="col">Tên nhân viên</th>
                    <th className="px-6 py-3" scope="col">Email</th>
                    <th className="px-6 py-3" scope="col">Số điện thoại</th>
                    <th className="px-6 py-3" scope="col">Ngày tạo</th>
                    <th className="px-6 py-3 text-center" scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr
                      key={staff.id}
                      className="bg-white dark:bg-transparent border-b dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {staff.name}
                      </td>
                      <td className="px-6 py-4">{staff.email}</td>
                      <td className="px-6 py-4">{staff.phone || '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditStaff(staff)}
                            className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white"
                          >
                            Sửa
                          </button>
                          {user?.role === 'admin' && staff.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteStaff(staff.id, staff.name)}
                              className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              disabled={isLoading}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="space-y-3 sm:space-y-4 lg:hidden">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white dark:bg-[#111827] rounded-xl p-3 sm:p-4 border border-gray-200/80 dark:border-gray-800/60 active:bg-gray-50 dark:active:bg-gray-800/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 dark:text-white">
                        {staff.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {staff.email}
                      </p>
                      {staff.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {staff.phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Ngày tạo: {new Date(staff.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      {user?.role === 'admin' && staff.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          disabled={isLoading}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-[#111827] rounded-t-2xl sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {editingStaff ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 -mr-2 touch-manipulation"
                aria-label="Đóng"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên nhân viên *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên nhân viên"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                  disabled={isLoading || !!editingStaff}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0987654321"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {editingStaff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={editingStaff ? handleUpdateStaff : handleCreateStaff}
                  className="flex-1 h-12 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>{editingStaff ? 'Cập nhật' : 'Thêm'}</span>
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

export default AdminStaffPage;