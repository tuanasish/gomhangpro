import apiClient from './api.service';
import { ApiResponse } from './auth.service';
import { AxiosError } from 'axios';

export interface Shift {
  id: string;
  staffId: string;
  staffName?: string;
  counterId?: string; // Optional - quầy được chọn khi tạo đơn hàng
  counterName?: string;
  date: string; // YYYY-MM-DD
  startTime: Date;
  endTime?: Date;
  tienGiaoCa: number;
  tongTienHangDaTra: number;
  quyConLai: number;
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftRequest {
  staffId: string;
  counterId?: string; // Optional - không cần chọn quầy khi tạo ca
  date: string; // YYYY-MM-DD
  tienGiaoCa: number;
}

/**
 * Lấy danh sách ca làm việc
 */
export async function getShiftsList(params?: {
  staffId?: string;
  date?: string;
  status?: 'active' | 'ended';
}): Promise<Shift[]> {
  const response = await apiClient.get<ApiResponse<Shift[]>>('/shifts', { params });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách ca làm việc');
  }

  return response.data.data;
}

/**
 * Lấy chi tiết ca làm việc
 */
export async function getShiftById(id: string): Promise<Shift> {
  const response = await apiClient.get<ApiResponse<Shift>>(`/shifts/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy thông tin ca làm việc');
  }

  return response.data.data;
}

/**
 * Lấy ca hiện tại của worker (active)
 * Trả về null nếu không tìm thấy ca (404) thay vì throw error
 */
export async function getCurrentShift(): Promise<Shift | null> {
  try {
    const response = await apiClient.get<ApiResponse<Shift>>('/shifts/current');

    if (!response.data.success || !response.data.data) {
      // Nếu là 404, trả về null (không có ca) thay vì throw error
      return null;
    }

    return response.data.data;
  } catch (error: any) {
    // Nếu là lỗi 404 (không tìm thấy ca), trả về null
    if (error.response?.status === 404) {
      return null;
    }
    // Các lỗi khác thì throw lại
    throw error;
  }
}

/**
 * Tạo ca mới
 */
export async function createShift(shiftData: CreateShiftRequest): Promise<Shift> {
  try {
    const response = await apiClient.post<ApiResponse<Shift>>('/shifts', shiftData);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Không thể tạo ca làm việc');
    }

    return response.data.data;
  } catch (error) {
    // Xử lý lỗi Axios để lấy error message từ response
    if (error instanceof AxiosError && error.response?.data) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error || 'Không thể tạo ca làm việc');
    }
    throw error;
  }
}

/**
 * Bắt đầu ca
 */
export async function startShift(shiftId: string): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${shiftId}/start`, {});

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể bắt đầu ca');
  }

  return response.data.data;
}

/**
 * Kết thúc ca
 */
export async function endShift(shiftId: string): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${shiftId}/end`, {});

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể kết thúc ca');
  }

  return response.data.data;
}

/**
 * Cộng thêm tiền vào ca (Admin/Manager) - Lưu vào lịch sử
 */
export async function addMoneyToShift(shiftId: string, amount: number, note?: string): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${shiftId}/add-money`, { amount, note });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật tiền');
  }

  return response.data.data;
}

/**
 * Cập nhật trực tiếp tiền giao ca (Admin/Manager)
 */
export async function updateShiftMoney(shiftId: string, tienGiaoCa: number): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${shiftId}/money`, { tienGiaoCa });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật tiền giao ca');
  }

  return response.data.data;
}

export interface ShiftMoneyAddition {
  id: string;
  shiftId: string;
  amount: number;
  note?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lấy lịch sử thêm tiền của ca
 */
export async function getShiftMoneyAdditions(shiftId: string): Promise<ShiftMoneyAddition[]> {
  const response = await apiClient.get<ApiResponse<ShiftMoneyAddition[]>>(`/shifts/${shiftId}/money-additions`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy lịch sử thêm tiền');
  }

  return response.data.data;
}

/**
 * Cập nhật một lần thêm tiền trong lịch sử
 */
export async function updateShiftMoneyAddition(
  shiftId: string,
  additionId: string,
  data: { amount?: number; note?: string }
): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(
    `/shifts/${shiftId}/money-additions/${additionId}`,
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật lịch sử thêm tiền');
  }

  return response.data.data;
}

/**
 * Xóa một lần thêm tiền trong lịch sử
 */
export async function deleteShiftMoneyAddition(shiftId: string, additionId: string): Promise<Shift> {
  const response = await apiClient.delete<ApiResponse<Shift>>(
    `/shifts/${shiftId}/money-additions/${additionId}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể xóa lịch sử thêm tiền');
  }

  return response.data.data;
}
