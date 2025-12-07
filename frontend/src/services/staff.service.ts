import apiClient from './api.service';
import { ApiResponse } from './auth.service';
import { AxiosError } from 'axios';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'worker' | 'manager' | 'admin';
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'worker' | 'manager' | 'admin';
}

export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: 'worker' | 'manager' | 'admin';
  isActive?: boolean;
}

/**
 * Lấy danh sách nhân viên
 */
export async function getStaffList(): Promise<Staff[]> {
  const response = await apiClient.get<ApiResponse<Staff[]>>('/staff');
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách nhân viên');
  }

  return response.data.data;
}

/**
 * Tạo nhân viên mới
 */
export async function createStaff(staffData: CreateStaffRequest): Promise<Staff> {
  const response = await apiClient.post<ApiResponse<Staff>>('/staff', {
    ...staffData,
    role: staffData.role || 'worker', // Mặc định là worker
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể tạo nhân viên');
  }

  return response.data.data;
}

/**
 * Cập nhật thông tin nhân viên
 */
export async function updateStaff(staffId: string, staffData: UpdateStaffRequest): Promise<Staff> {
  const response = await apiClient.put<ApiResponse<Staff>>(`/staff/${staffId}`, staffData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật nhân viên');
  }

  return response.data.data;
}

/**
 * Xóa nhân viên
 */
export async function deleteStaff(staffId: string): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/staff/${staffId}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Không thể xóa nhân viên');
    }
  } catch (error) {
    // Xử lý lỗi Axios để lấy error message từ response
    if (error instanceof AxiosError && error.response?.data) {
      const apiError = error.response.data as ApiResponse<null>;
      throw new Error(apiError.error || 'Không thể xóa nhân viên');
    }
    throw error;
  }
}
