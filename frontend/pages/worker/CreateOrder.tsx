import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../../types';
import * as shiftsService from '../../src/services/shifts.service';
import * as ordersService from '../../src/services/orders.service';
import * as customersService from '../../src/services/customers.service';
import * as countersService from '../../src/services/counters.service';
import { Customer } from '../../src/services/customers.service';
import { Counter } from '../../src/services/counters.service';

const CreateOrderPage: () => React.JSX.Element = () => {
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
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState<boolean>(false);
  const [showCreateCounterModal, setShowCreateCounterModal] = useState<boolean>(false);
  
  // State cho suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [counterSuggestions, setCounterSuggestions] = useState<Counter[]>([]);
  
  // State cho form tạo mới
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');
  const [newCounterName, setNewCounterName] = useState<string>('');
  const [newCounterAddress, setNewCounterAddress] = useState<string>('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isCreatingCounter, setIsCreatingCounter] = useState(false);

  // Utils định dạng tiền
  const formatMoneyInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  const parseMoneyValue = (value: string) => {
    const normalized = value.replace(/\./g, '');
    return normalized ? Number(normalized) : NaN;
  };

  // State cho các loại tiền (dạng chuỗi để hiển thị phân cách nghìn)
  const [tienHangInput, setTienHangInput] = useState<string>('');
  const [tienCongGomInput, setTienCongGomInput] = useState<string>('');
  const [phiDongHangInput, setPhiDongHangInput] = useState<string>('');
  const [tienHoaHongInput, setTienHoaHongInput] = useState<string>('');
  
  // State cho save
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current shift
  useEffect(() => {
    const loadShift = async () => {
      setLoadingShift(true);
      try {
        const currentShift = await shiftsService.getCurrentShift();
        if (currentShift) {
          setShiftId(currentShift.id);
        } else {
          setError('Bạn chưa có ca làm việc hôm nay. Vui lòng liên hệ quản lý để được tạo ca.');
        }
      } catch (err: any) {
        console.error('Load shift error:', err);
        setError('Lỗi tải thông tin ca làm việc. Vui lòng thử lại.');
      } finally {
        setLoadingShift(false);
      }
    };

    loadShift();
  }, []);

  // Load counters list khi component mount và khi cần
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

  // Reload counters sau khi tạo counter mới
  const reloadCounters = async () => {
    try {
      const counters = await countersService.getCountersList(true);
      setCounterSuggestions(counters);
    } catch (err) {
      console.error('Reload counters error:', err);
    }
  };

  // Load customers khi có text (tự động load khi bắt đầu gõ)
  useEffect(() => {
    if (customerName && customerName.length >= 1 && customerSuggestions.length === 0) {
      // Load customers khi user bắt đầu gõ và chưa có suggestions - gọi không có tham số để lấy tất cả
      customersService.getCustomersList().then(setCustomerSuggestions).catch(console.error);
    }
  }, [customerName]);

  // Filter counter suggestions khi gõ
  useEffect(() => {
    if (!counterName || counterName.length < 1) {
      return;
    }
    // Counter suggestions đã được load sẵn, chỉ cần filter
  }, [counterName]);

  // Giá trị số từ input
  const tienHang = parseMoneyValue(tienHangInput);
  const tienCongGom = parseMoneyValue(tienCongGomInput);
  const phiDongHang = parseMoneyValue(phiDongHangInput);
  const tienHoaHong = parseMoneyValue(tienHoaHongInput);

  // Tính toán tự động - tổng tiền hóa đơn bao gồm cả tiền hoa hồng
  const tongTienHoaDon =
    (isNaN(tienHang) ? 0 : tienHang) +
    (isNaN(tienCongGom) ? 0 : tienCongGom) +
    (isNaN(phiDongHang) ? 0 : phiDongHang) +
    (isNaN(tienHoaHong) ? 0 : tienHoaHong);

  const handleSave = async () => {
    if (!shiftId) {
      setError('Không tìm thấy ca làm việc. Vui lòng liên hệ quản lý.');
      return;
    }

    if (!customerName || !counterName || isNaN(tienHang) || tienHang <= 0) {
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
        tienCongGom: isNaN(tienCongGom) ? 0 : tienCongGom,
        phiDongHang: isNaN(phiDongHang) ? 0 : phiDongHang,
        tienHoaHong: isNaN(tienHoaHong) ? undefined : tienHoaHong,
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
    // Tự động điền tiền công gom mặc định nếu có, nhưng vẫn cho phép chỉnh sửa
    if (customer.defaultTienCongGom !== undefined && customer.defaultTienCongGom !== null) {
      setTienCongGomInput(formatMoneyInput(customer.defaultTienCongGom.toString()));
    }
    setCustomerSuggestions([]);
    setCustomerSuggestions([]);
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
      setCustomerSuggestions([]);
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
        address: newCounterAddress.trim() || undefined,
      });
      setCounterId(newCounter.id);
      setCounterName(newCounter.name);
      setNewCounterName('');
      setNewCounterAddress('');
      setShowCreateCounterModal(false);
      // Reload counters để cập nhật suggestions
      await reloadCounters();
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
                      setCustomerId(''); // Reset ID khi người dùng gõ mới
                      setCustomerPhone(''); // Reset phone
                      // Suggestions sẽ tự động hiện khi có >= 1 ký tự (trong useEffect)
                    }}
                    onFocus={() => {
                      // Load customers khi focus nếu chưa có (giống counter) - gọi không có tham số để lấy tất cả
                      if (customerSuggestions.length === 0) {
                        customersService.getCustomersList().then(setCustomerSuggestions).catch(console.error);
                      }
                    }}
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
              {customerName && customerName.length >= 1 && !customerId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {customerSuggestions.length > 0 && customerSuggestions
                    .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .slice(0, 10)
                    .map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                        )}
                      </button>
                    ))}
                  {customerSuggestions.length > 0 && customerSuggestions.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Không tìm thấy khách hàng nào
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setNewCustomerName(customerName);
                      setShowCreateCustomerModal(true);
                      setCustomerSuggestions([]);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-primary font-medium ${customerSuggestions.length > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                  >
                    + Tạo mới: "{customerName}"
                  </button>
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
                    onBlur={() => {
                      // Delay để cho phép click vào suggestion
                      setTimeout(() => {
                        // Không cần set state vì suggestions hiển thị dựa trên điều kiện
                      }, 200);
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
              {counterSuggestions.length > 0 && counterName && counterName.length >= 1 && !counterId && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {counterSuggestions
                    .filter(c => c.name.toLowerCase().includes(counterName.toLowerCase()))
                    .slice(0, 10)
                    .map((counter) => (
                      <button
                        key={counter.id}
                        onClick={() => handleCounterSelect(counter)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="font-medium">{counter.name}</div>
                        {counter.address && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{counter.address}</div>
                        )}
                      </button>
                    ))}
                  {counterSuggestions.filter(c => c.name.toLowerCase().includes(counterName.toLowerCase())).length === 0 && (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Không tìm thấy quầy nào
                    </div>
                  )}
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
                  type="text"
                  inputMode="numeric"
                  value={tienHangInput}
                  onChange={(e) => setTienHangInput(formatMoneyInput(e.target.value))}
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
                  type="text"
                  inputMode="numeric"
                  value={tienCongGomInput}
                  onChange={(e) => setTienCongGomInput(formatMoneyInput(e.target.value))}
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
                  type="text"
                  inputMode="numeric"
                  value={phiDongHangInput}
                  onChange={(e) => setPhiDongHangInput(formatMoneyInput(e.target.value))}
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
                  type="text"
                  inputMode="numeric"
                  value={tienHoaHongInput}
                  onChange={(e) => setTienHoaHongInput(formatMoneyInput(e.target.value))}
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
                {(isNaN(tongTienHoaDon) ? 0 : tongTienHoaDon).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="flex pt-4 pb-4">
            <button
              onClick={handleSave}
              disabled={!shiftId || !customerName || !counterName || isNaN(tienHang) || tienHang <= 0 || isSaving}
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
                  setNewCounterAddress('');
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
              <label className="flex flex-col">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ
                </p>
                <input
                  value={newCounterAddress}
                  onChange={(e) => setNewCounterAddress(e.target.value)}
                  className="form-input w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4"
                  placeholder="Nhập địa chỉ quầy (tùy chọn)"
                />
              </label>
            </div>
            {error && (
              <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateCounterModal(false);
                  setNewCounterName('');
                  setNewCounterAddress('');
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
