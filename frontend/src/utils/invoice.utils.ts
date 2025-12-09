/**
 * Utility functions for formatting invoice data
 */

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  counterName?: string;
  date: string;
  time: string;
  tienHang: number;
  tienCongGom: number;
  phiDongHang: number;
  tienHoaHong: number;
  tienThem?: number;
  loaiTienThem?: string;
  tongTienHoaDon: number;
  items?: Array<{
    description: string;
    quantity?: number;
    price?: number;
    counterName?: string; // Tên quầy cho từng item
  }>;
  simpleMode?: boolean; // Chế độ đơn giản: chỉ hiển thị STT, Quầy, Tổng tiền
}

/**
 * Format currency to Vietnamese dong
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format time to Vietnamese format
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Get company information
 */
export function getCompanyInfo() {
  return {
    name: 'Quan Gom Hang Ninh Hiep',
    address: 'Ninh Hiệp, Gia Lâm, Hà Nội',
    phone: '0922238683',
    email: 'support@gomhangpro.com',
  };
}

