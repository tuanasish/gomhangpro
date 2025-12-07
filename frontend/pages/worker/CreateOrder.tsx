import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import * as shiftsService from '../../src/services/shifts.service';
import * as ordersService from '../../src/services/orders.service';
import * as customersService from '../../src/services/customers.service';
import * as countersService from '../../src/services/counters.service';
import { Customer } from '../../src/services/customers.service';
import { Counter } from '../../src/services/counters.service';

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();

  // State cho shift
  const [shiftId, setShiftId] = useState<string>('');
  const [loadingShift, setLoadingShift] = useState(true);
  
  // State cho thông tin khách hàng và quầy
  const [customerName, setCustomerName] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [counterName, setCounterName] = useState<string>('');
  const [counterId, setCounterId] = useState<string>('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState<boolean>(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState<boolean>(false);
  const [showCreateCounterModal, setShowCreateCounterModal] = useState<boolean>(false);
  
  // State cho suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [counterSuggestions, setCounterSuggestions] = useState<Counter[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  
  // State cho form tạo mới
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newCounterName, setNewCounterName] = useState<string>('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isCreatingCounter, setIsCreatingCounter] = useState(false);

  // State cho các loại tiền
  const [tienHang, setTienHang] = useState<number>(0);
  const [tienCongGom, setTienCongGom] = useState<number>(0);
  const [phiDongHang, setPhiDongHang] = useState<number>(0);
  const [tienHoaHong, setTienHoaHong] = useState<number>(0);
  
  // State cho save
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current shift
  useEffect(() => {
    const loadShift = async () => {
      setLoadingShift(true);
      try {
        const currentShift = await shiftsService.getCurrentShift();
        setShiftId(currentShift.id);
      } catch (err: any) {
        console.error('Load shift error:', err);
        setError('Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.');
      } finally {
        setLoadingShift(false);
      }
    };

    loadShift();
  }, []);

  // Load counters list
  useEffect(() => {
    const loadCounters = async () => {
      try {
        const counters = await countersService.getCountersList(true);
        setCounterSuggestions(counters);
      } catch (err) {
        console.error('Load counters error:', err);
      }
    };

    loadCounters();
  }, []);

  // Search customers với debounce
  useEffect(() => {
    if (!customerName || customerName.length < 2) {
      setCustomerSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchingCustomers(true);
      try {
        const customers = await customersService.searchCustomers(customerName);
        setCustomerSuggestions(customers);
      } catch (err) {
        console.error('Search customers error:', err);
        setCustomerSuggestions([]);
      } finally {
        setSearchingCustomers(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [customerName]);

  // Tính toán tự động
  const tongTienHoaDon = tienHang + tienCongGom + phiDongHang;

  const handleSave = async () => {
    if (!shiftId) {
      setError('Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.');
      return;
    }

    if (!customerName || !counterName || tienHang <= 0) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await ordersService.createOrder({
        shiftId,
        customerId: customerId || undefined,
        customerName: customerId ? undefined : customerName.trim(),
        customerPhone: customerPhone || undefined,
        counterId: counterId || undefined,
        counterName: counterId ? undefined : counterName.trim(),
        tienHang,
        tienCongGom,
        phiDongHang,
        tienHoaHong: tienHoaHong || undefined,
      });
      navigate(RoutePath.WORKER_HOME);
    } catch (err: any) {
      console.error('Create order error:', err);
      setError(err.message || 'Lỗi tạo đơn hàng. Vui lòng thử lại.');
      setIsSaving(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || '');
    setShowCustomerSuggestions(false);
  };

  const handleCounterSelect = (counter: Counter) => {
    setCounterId(counter.id);
    setCounterName(counter.name);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      return;
    }

    setIsCreatingCustomer(true);
    setError(null);
    try {
      const newCustomer = await customersService.createCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim() || undefined,
      });
      setCustomerId(newCustomer.id);
      setCustomerName(newCustomer.name);
      setCustomerPhone(newCustomer.phone || '');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setShowCreateCustomerModal(false);
      setShowCustomerSuggestions(false);
    } catch (err: any) {
      console.error('Create customer error:', err);
      setError(err.message || 'Lỗi tạo khách hàng. Vui lòng thử lại.');
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const handleCreateCounter = async () => {
    if (!newCounterName.trim()) {
      setError('Vui lòng nhập tên quầy');
      return;
    }

    setIsCreatingCounter(true);
    setError(null);
    try {
      const newCounter = await countersService.createCounter({
        name: newCounterName.trim(),
      });
      setCounterId(newCounter.id);
      setCounterName(newCounter.name);
      setNewCounterName('');
      setShowCreateCounterModal(false);
    } catch (err: any) {
      console.error('Create counter error:', err);
      setError(err.message || 'Lỗi tạo quầy. Vui lòng thử lại.');
    } finally {
      setIsCreatingCounter(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-lg h-full sm:h-auto flex flex-col">
        <header className="flex items-center justify-between border-b border-solid border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tạo hóa đơn mới</h1>
          <div className="w-10"></div>
        </header>
        <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">
          {loadingShift && (
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

          {!loadingShift && (
            <>
          {/* Thông tin khách hàng */}
          <div>
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white pb-3">
              Thông tin khách hàng
            </h3>
            <div className="flex flex-col relative">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Tên khách hàng <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={customerName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerName(value);
                      setShowCustomerSuggestions(value.length >= 2);
                      setCustomerId(''); // Reset ID khi người dùng gõ mới
                      setCustomerPhone(''); // Reset phone
                    }}
                    onFocus={() => customerName.length > 0 && setShowCustomerSuggestions(true)}
                    className="form-input flex flex-1 min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                    placeholder="Nhập tên khách hàng"
                  />
                  <button
                    onClick={() => setShowCreateCustomerModal(true)}
                    className="flex items-center justify-center px-4 h-14 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Tạo khách hàng mới"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </label>
              {showCustomerSuggestions && customerName && customerName.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchingCustomers ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      Đang tìm kiếm...
                    </div>
                  ) : customerSuggestions.length > 0 ? (
                    <>
                      {customerSuggestions.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setNewCustomerName(customerName);
                          setShowCreateCustomerModal(true);
                          setShowCustomerSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary font-medium border-t border-gray-200 dark:border-gray-700"
                      >
                        + Tạo mới: "{customerName}"
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setNewCustomerName(customerName);
                        setShowCreateCustomerModal(true);
                        setShowCustomerSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary font-medium"
                    >
                      + Tạo mới: "{customerName}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin quầy */}
          <div>
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white pb-3">
              Thông tin quầy
            </h3>
            <div className="flex flex-col relative">
              <label className="flex flex-col w-full">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Tên quầy <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={counterName}
                    onChange={(e) => {
                      setCounterName(e.target.value);
                      setCounterId(''); // Reset ID khi người dùng gõ mới
                    }}
                    onFocus={() => {
                      // Load counters khi focus nếu chưa có
                      if (counterSuggestions.length === 0) {
                        countersService.getCountersList(true).then(setCounterSuggestions).catch(console.error);
                      }
                    }}
                    className="form-input flex flex-1 min-w-0 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                    placeholder="Nhập tên quầy hoặc chọn từ danh sách"
                  />
                  <button
                    onClick={() => setShowCreateCounterModal(true)}
                    className="flex items-center justify-center px-4 h-14 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Tạo quầy mới"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </label>
              {counterSuggestions.length > 0 && counterName && !counterId && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {counterSuggestions
                    .filter(c => c.name.toLowerCase().includes(counterName.toLowerCase()))
                    .slice(0, 5)
                    .map((counter) => (
                      <button
                        key={counter.id}
                        onClick={() => handleCounterSelect(counter)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {counter.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Thông tin tiền */}
          <div>
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white pb-3">
              Thông tin tiền
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <label className="flex flex-col">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Tiền hàng (trả cho quầy) <span className="text-red-500">*</span>
                </p>
                <input
                  type="number"
                  value={tienHang || ''}
                  onChange={(e) => setTienHang(Number(e.target.value) || 0)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                  placeholder="0"
                  required
                />
              </label>
              
              <label className="flex flex-col">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Tiền công gom <span className="text-red-500">*</span>
                </p>
                <input
                  type="number"
                  value={tienCongGom || ''}
                  onChange={(e) => setTienCongGom(Number(e.target.value) || 0)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                  placeholder="0"
                  required
                />
              </label>
              
              <label className="flex flex-col">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Phí đóng hàng <span className="text-red-500">*</span>
                </p>
                <input
                  type="number"
                  value={phiDongHang || ''}
                  onChange={(e) => setPhiDongHang(Number(e.target.value) || 0)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                  placeholder="0"
                  required
                />
              </label>
              
              <label className="flex flex-col">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 pb-2">
                  Tiền hoa hồng (nếu có)
                </p>
                <input
                  type="number"
                  value={tienHoaHong || ''}
                  onChange={(e) => setTienHoaHong(Number(e.target.value) || 0)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                  placeholder="0"
                />
              </label>
            </div>
          </div>

          {/* Tổng tiền hóa đơn */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-600 dark:text-gray-300">Tổng tiền hóa đơn (khách phải trả):</span>
              <span className="font-bold text-gray-900 dark:text-white text-xl">
                {tongTienHoaDon.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="flex pt-4 pb-4">
            <button
              onClick={handleSave}
              disabled={!shiftId || !customerName || !counterName || tienHang <= 0 || isSaving}
              className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-wide px-6 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Lưu đơn'
              )}
            </button>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Modal tạo khách hàng mới */}
      {showCreateCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo khách hàng mới</h2>
              <button
                onClick={() => {
                  setShowCreateCustomerModal(false);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên khách hàng <span className="text-red-500">*</span>
                </p>
                <input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="form-input w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4"
                  placeholder="Nhập tên khách hàng"
                  autoFocus
                />
              </label>
              <label className="flex flex-col">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </p>
                <input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="form-input w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4"
                  placeholder="Nhập số điện thoại"
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateCustomerModal(false);
                  setNewCustomerName('');
                  setNewCustomerPhone('');
                }}
                className="flex-1 h-12 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={!newCustomerName.trim() || isCreatingCustomer}
                className="flex-1 h-12 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCreatingCustomer ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Tạo mới'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo quầy mới */}
      {showCreateCounterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo quầy mới</h2>
              <button
                onClick={() => {
                  setShowCreateCounterModal(false);
                  setNewCounterName('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex flex-col">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên quầy <span className="text-red-500">*</span>
                </p>
                <input
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  className="form-input w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4"
                  placeholder="Nhập tên quầy (ví dụ: Quầy 1)"
                  autoFocus
                />
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateCounterModal(false);
                  setNewCounterName('');
                }}
                className="flex-1 h-12 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCounter}
                disabled={!newCounterName.trim() || isCreatingCounter}
                className="flex-1 h-12 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCreatingCounter ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Tạo mới'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderPage;
