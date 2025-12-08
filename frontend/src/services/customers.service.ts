import apiClient from './api.service';
import { ApiResponse } from './auth.service';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  defaultTienCongGom?: number; // Tiền công gom mặc định cho khách hàng này
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  address?: string;
  defaultTienCongGom?: number;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
  defaultTienCongGom?: number;
}

/**
 * Lấy danh sách khách hàng
 */
export async function getCustomersList(search?: string, phone?: string): Promise<Customer[]> {
  const params: any = {};
  if (search) params.search = search;
  if (phone) params.phone = phone;

  const response = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy danh sách khách hàng');
  }

  return response.data.data;
}

/**
 * Lấy chi tiết khách hàng
 */
export async function getCustomerById(id: string): Promise<Customer> {
  const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể lấy thông tin khách hàng');
  }

  return response.data.data;
}

/**
 * Tạo khách hàng mới
 */
export async function createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
  const response = await apiClient.post<ApiResponse<Customer>>('/customers', customerData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể tạo khách hàng');
  }

  return response.data.data;
}

/**
 * Cập nhật thông tin khách hàng
 */
export async function updateCustomer(customerId: string, customerData: UpdateCustomerRequest): Promise<Customer> {
  const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${customerId}`, customerData);

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Không thể cập nhật khách hàng');
  }

  return response.data.data;
}

/**
 * Xóa khách hàng
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/customers/${customerId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Không thể xóa khách hàng');
  }
}

/**
 * Tìm kiếm khách hàng theo tên hoặc số điện thoại
 * Tìm trong cả tên và số điện thoại
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  // Search trong cả name và phone
  return getCustomersList(query, query);
}

