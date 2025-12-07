import apiClient from './api.service';
import { ApiResponse } from './auth.service';

export interface Counter {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCounterRequest {
  name: string;
  address?: string;
}

export interface UpdateCounterRequest {
  name?: string;
  address?: string;
  isActive?: boolean;
}

/**
 * Lấy danh sách quầy
 */
export async function getCountersList(activeOnly: boolean = true): Promise<Counter[]> {
  const params: any = {};
  if (activeOnly) params.activeOnly = 'true';

  const response = await apiClient.get<ApiResponse<Counter[]>>('/counters', { params });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách quầy');
  }

  return response.data.data;
}

/**
 * Lấy chi tiết quầy
 */
export async function getCounterById(id: string): Promise<Counter> {
  const response = await apiClient.get<ApiResponse<Counter>>(`/counters/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy thông tin quầy');
  }

  return response.data.data;
}

/**
 * Tạo quầy mới
 */
export async function createCounter(counterData: CreateCounterRequest): Promise<Counter> {
  const response = await apiClient.post<ApiResponse<Counter>>('/counters', counterData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể tạo quầy');
  }

  return response.data.data;
}

/**
 * Cập nhật thông tin quầy
 */
export async function updateCounter(counterId: string, counterData: UpdateCounterRequest): Promise<Counter> {
  const response = await apiClient.put<ApiResponse<Counter>>(`/counters/${counterId}`, counterData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật quầy');
  }

  return response.data.data;
}

/**
 * Xóa/Deactivate quầy
 */
export async function deleteCounter(counterId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/counters/${counterId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Không thể xóa quầy');
  }
}

