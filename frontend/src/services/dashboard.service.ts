import apiClient from './api.service';
import { ApiResponse } from './auth.service';
import { getShiftsList, Shift } from './shifts.service';
import { getOrdersList } from './orders.service';

export interface DashboardStats {
  activeShifts: number;
  totalTienGiaoCa: number;
  ordersToday: number;
  totalRevenueToday: number;
  totalTienGiaoCaTheoNgay: number; // Tổng tiền giao ca của các ca trong ngày
  totalTienHangDaTraTheoNgay: number; // Tổng tiền hàng đã trả (tổng tien_hang từ đơn hàng trong ngày)
  totalTienHoaHongTheoNgay: number; // Tổng tiền hoa hồng (tiền công ty sẽ nhận)
}

/**
 * Lấy thống kê dashboard
 */
export async function getDashboardStats(date?: string): Promise<DashboardStats> {
  const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Lấy ca active
    const activeShifts = await getShiftsList({ status: 'active' });
    
    // Tính tổng tiền giao ca (ca đang active)
    const totalTienGiaoCa = activeShifts.reduce((sum, shift) => sum + shift.tienGiaoCa, 0);

    // Lấy tất cả ca trong ngày (để tính tổng tiền giao ca theo ngày)
    const shiftsInDay = await getShiftsList({ date: targetDate });
    const totalTienGiaoCaTheoNgay = shiftsInDay.reduce((sum, shift) => sum + shift.tienGiaoCa, 0);

    // Lấy đơn hàng hôm nay
    const ordersToday = await getOrdersList({ date: targetDate });

    // Tính tổng doanh thu (tổng tiền hóa đơn)
    const totalRevenueToday = ordersToday.reduce((sum, order) => sum + order.tongTienHoaDon, 0);

    // Tính tổng tiền hàng đã trả (tổng tien_hang từ đơn hàng trong ngày)
    const totalTienHangDaTraTheoNgay = ordersToday.reduce((sum, order) => sum + order.tienHang, 0);

    // Tính tổng tiền hoa hồng (tiền công ty sẽ nhận)
    const totalTienHoaHongTheoNgay = ordersToday.reduce((sum, order) => sum + (order.tienHoaHong || 0), 0);

    return {
      activeShifts: activeShifts.length,
      totalTienGiaoCa,
      ordersToday: ordersToday.length,
      totalRevenueToday,
      totalTienGiaoCaTheoNgay,
      totalTienHangDaTraTheoNgay,
      totalTienHoaHongTheoNgay,
    };
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    throw new Error(error.message || 'Không thể lấy thống kê dashboard');
  }
}

/**
 * Lấy doanh thu theo ngày
 */
export async function getRevenueByDate(date: string): Promise<number> {
  const orders = await getOrdersList({ date });
  return orders.reduce((sum, order) => sum + order.tongTienHoaDon, 0);
}


