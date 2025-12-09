// Các loại tiền theo nghiệp vụ gom hàng Ninh Hiệp
export interface Order {
  id: string;
  customerId: string; // ID khách hàng
  customerName: string; // Tên khách hàng
  counterId: string; // ID quầy
  counterName: string; // Tên quầy
  time: string; // Thời gian tạo đơn
  status: 'completed' | 'pending' | 'cancelled';
  
  // Các loại tiền
  tienHang: number; // Tiền hàng (trả cho quầy) - giá trị hàng quầy tính cho đơn đó
  tienCongGom: number; // Tiền công gom - tiền THU CỦA KHÁCH để đóng gói, bọc hàng, dán bao, sắp xếp gửi xe
  phiDongHang: number; // Phí đóng hàng
  tienHoaHong: number; // Tiền hoa hồng - tiền TIP mà quầy chiết khấu cho công ty (khách hàng không thấy)
  
  // Tính toán
  tongTienHoaDon: number; // Tổng tiền hóa đơn (khách phải trả) = tienHang + tienCongGom + phiDongHang + tienHoaHong
  
  staffId: string; // ID nhân viên
  staffName: string; // Tên nhân viên
}

// Khách hàng
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

// Quầy
export interface Counter {
  id: string;
  name: string; // Tên quầy (ví dụ: "Quầy 1", "Quầy A")
  address?: string;
  createdAt?: string;
}

// Ca làm việc
export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  counterId: string;
  counterName: string;
  date: string; // Ngày làm việc (YYYY-MM-DD)
  startTime: string; // Thời gian bắt đầu ca
  endTime?: string; // Thời gian kết thúc ca
  
  tienGiaoCa: number; // Tiền giao ca (tiền đầu ngày) - số tiền admin đưa cho nhân viên lúc bắt đầu ngày
  tongTienHangDaTra: number; // Tổng tiền hàng đã trả (đã mua) - tổng các tienHang trong các đơn
  quyConLai: number; // Quỹ còn lại = tienGiaoCa - tongTienHangDaTra
  
  status: 'active' | 'ended'; // Trạng thái ca
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: 'worker' | 'manager' | 'admin';
  avatar?: string;
  shiftStarted?: boolean;
  currentShiftId?: string; // ID ca làm việc hiện tại
}

export enum RoutePath {
  LOGIN = '/',
  ROLE_SELECTION = '/role',
  WORKER_START_SHIFT = '/worker/start',
  WORKER_HOME = '/worker/home',
  WORKER_CREATE_ORDER = '/worker/create',
  WORKER_ORDER_DETAIL = '/worker/order/:id',
  WORKER_END_SHIFT = '/worker/end',
  WORKER_HISTORY = '/worker/history',
  WORKER_ACCOUNT = '/worker/account',
  WORKER_CUSTOMERS = '/worker/customers',
  WORKER_COUNTERS = '/worker/counters',
  MANAGER_DASHBOARD = '/manager/dashboard',
  MANAGER_ORDERS = '/manager/orders',
  ADMIN_SHIFTS = '/admin/shifts',
  ADMIN_STAFF = '/admin/staff',
  ADMIN_CUSTOMERS = '/admin/customers',
  CUSTOMER_DETAIL = '/admin/customers/:id',
  ADMIN_COUNTERS = '/admin/counters',
}