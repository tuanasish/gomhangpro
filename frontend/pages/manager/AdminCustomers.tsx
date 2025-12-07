import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import BottomNavAdmin from '../../components/manager/BottomNavAdmin';
import { useAuth } from '../../src/hooks/useAuth';
import Avatar from '../../src/components/common/Avatar';
import * as customersService from '../../src/services/customers.service';
import { Customer } from '../../src/services/customers.service';

const AdminCustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customersService.getCustomersList();
      setCustomers(data);
    } catch (err: any) {
      console.error('Load customers error:', err);
      setError(err.message || 'Lỗi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await customersService.createCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      });
      await loadCustomers();
      handleCloseModal();
    } catch (err: any) {
      console.error('Create customer error:', err);
      setError(err.message || 'Lỗi tạo khách hàng');
      alert(err.message || 'Lỗi tạo khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowCreateModal(true);
    setError(null);
  };

  const handleUpdateCustomer = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    if (!editingCustomer) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await customersService.updateCustomer(editingCustomer.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      });
      await loadCustomers();
      handleCloseModal();
    } catch (err: any) {
      console.error('Update customer error:', err);
      setError(err.message || 'Lỗi cập nhật khách hàng');
      alert(err.message || 'Lỗi cập nhật khách hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    try {
      await customersService.deleteCustomer(customerId);
      await loadCustomers();
    } catch (err: any) {
      console.error('Delete customer error:', err);
      alert(err.message || 'Lỗi xóa khách hàng');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', address: '' });
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
            <button
              onClick={() => navigate(RoutePath.MANAGER_ORDERS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 w-full text-left"
            >
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              <p className="text-sm font-medium leading-normal">Đơn hàng</p>
            </button>
            <button
              onClick={() => navigate(RoutePath.ADMIN_CUSTOMERS)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary-light text-primary-dark font-semibold dark:bg-primary/20 dark:text-white w-full text-left"
            >
              <span className="material-symbols-outlined fill text-2xl">people</span>
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
            <span className="truncate">Thêm khách hàng</span>
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
            Khách hàng
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
                Quản lý Khách hàng
              </h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                <span>Thêm khách hàng</span>
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách khách hàng...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 mb-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && customers.length === 0 && !error && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có khách hàng nào.
              </div>
            )}

            {!loading && customers.length > 0 && (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white dark:bg-[#111827] rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800/60">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3" scope="col">Tên khách hàng</th>
                        <th className="px-6 py-3" scope="col">Số điện thoại</th>
                        <th className="px-6 py-3" scope="col">Địa chỉ</th>
                        <th className="px-6 py-3" scope="col">Ngày tạo</th>
                        <th className="px-6 py-3 text-center" scope="col">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="bg-white dark:bg-transparent border-b dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4">{customer.phone || '-'}</td>
                      <td className="px-6 py-4">{customer.address || '-'}</td>
                      <td className="px-6 py-4">
                        {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-white mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

                {/* Mobile Card List */}
                <div className="space-y-4 lg:hidden">
                  {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white dark:bg-[#111827] rounded-xl p-4 border border-gray-200/80 dark:border-gray-800/60"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-base text-gray-900 dark:text-white">
                        {customer.name}
                      </p>
                      {customer.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {customer.phone}
                        </p>
                      )}
                      {customer.address && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.address}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Ngày tạo: {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCustomer(customer)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
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
                  placeholder="0901234567"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-gray-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 p-3 text-base font-normal leading-normal"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
                  className="flex-1 h-12 px-4 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    editingCustomer ? 'Cập nhật' : 'Thêm'
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

export default AdminCustomersPage;
