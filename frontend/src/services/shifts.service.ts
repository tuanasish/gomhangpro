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
 */
export async function getCurrentShift(): Promise<Shift> {
  const response = await apiClient.get<ApiResponse<Shift>>('/shifts/current');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy ca làm việc hiện tại');
  }

  return response.data.data;
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
 * Cộng thêm tiền vào ca (Admin/Manager)
 */
export async function addMoneyToShift(shiftId: string, amount: number): Promise<Shift> {
  const response = await apiClient.put<ApiResponse<Shift>>(`/shifts/${shiftId}/add-money`, { amount });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cộng thêm tiền');
  }

  return response.data.data;
}
