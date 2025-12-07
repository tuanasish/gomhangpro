import apiClient from './api.service';
import { ApiResponse } from './auth.service';

export interface Order {
  id: string;
  shiftId: string;
  customerId: string;
  customerName?: string;
  counterId: string;
  counterName?: string;
  staffId?: string; // Optional - có thể undefined nếu nhân viên đã bị xóa
  staffName?: string;
  tienHang: number;
  tienCongGom: number;
  phiDongHang: number;
  tienHoaHong: number;
  tongTienHoaDon: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  shiftId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  counterId?: string;
  counterName?: string;
  tienHang: number;
  tienCongGom: number;
  phiDongHang: number;
  tienHoaHong?: number;
}

export interface UpdateOrderRequest {
  status?: 'pending' | 'completed' | 'cancelled';
  tienHang?: number;
  tienCongGom?: number;
  phiDongHang?: number;
  tienHoaHong?: number;
}

/**
 * Lấy danh sách đơn hàng
 */
export async function getOrdersList(params?: {
  shiftId?: string;
  customerId?: string;
  date?: string; // YYYY-MM-DD
  status?: 'pending' | 'completed' | 'cancelled';
}): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>('/orders', { params });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách đơn hàng');
  }

  return response.data.data;
}

/**
 * Lấy chi tiết đơn hàng
 */
export async function getOrderById(id: string): Promise<Order> {
  const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy thông tin đơn hàng');
  }

  return response.data.data;
}

/**
 * Lấy tất cả đơn hàng trong một ca
 */
export async function getOrdersByShift(shiftId: string): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>(`/orders/shift/${shiftId}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách đơn hàng');
  }

  return response.data.data;
}

/**
 * Lấy đơn hàng theo ngày (cho worker history)
 */
export async function getOrdersByDate(date: string): Promise<Order[]> {
  return getOrdersList({ date });
}

/**
 * Tạo đơn hàng mới (tự động tạo customer/counter nếu cần)
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể tạo đơn hàng');
  }

  return response.data.data;
}

/**
 * Cập nhật đơn hàng
 */
export async function updateOrder(orderId: string, orderData: UpdateOrderRequest): Promise<Order> {
  const response = await apiClient.put<ApiResponse<Order>>(`/orders/${orderId}`, orderData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật đơn hàng');
  }

  return response.data.data;
}

/**
 * Xóa đơn hàng (chỉ pending)
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/orders/${orderId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Không thể xóa đơn hàng');
  }
}

