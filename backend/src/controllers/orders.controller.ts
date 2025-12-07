import { Request, Response } from 'express';
import { ApiResponse, Order } from '../types/index.js';
import { supabase } from '../config/supabase.js';

/**
 * Lấy danh sách đơn hàng
 */
export async function getOrdersList(req: Request, res: Response<ApiResponse<Order[]>>): Promise<void> {
  try {
    const { shiftId, customerId, date, status } = req.query;
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers!orders_customer_id_fkey(id, name),
        counter:counters!orders_counter_id_fkey(id, name),
        staff:users!orders_staff_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (shiftId && typeof shiftId === 'string') {
      query = query.eq('shift_id', shiftId);
    }

    if (customerId && typeof customerId === 'string') {
      query = query.eq('customer_id', customerId);
    }

    if (date && typeof date === 'string') {
      // Filter by date using created_at
      const startDate = `${date}T00:00:00.000Z`;
      const endDate = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Get orders list error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi lấy danh sách đơn hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: orders.map((order: any) => ({
        id: order.id,
        shiftId: order.shift_id,
        customerId: order.customer_id,
        customerName: order.customer?.name,
        counterId: order.counter_id,
        counterName: order.counter?.name,
        staffId: order.staff_id || undefined, // Convert null to undefined
        staffName: order.staff?.name,
        tienHang: parseFloat(order.tien_hang),
        tienCongGom: parseFloat(order.tien_cong_gom),
        phiDongHang: parseFloat(order.phi_dong_hang),
        tienHoaHong: parseFloat(order.tien_hoa_hong || 0),
        tienThem: order.tien_them ? parseFloat(order.tien_them) : undefined,
        loaiTienThem: order.loai_tien_them || undefined,
        tongTienHoaDon: parseFloat(order.tong_tien_hoa_don),
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      })),
    });
  } catch (error: any) {
    console.error('Get orders list error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách đơn hàng',
    });
  }
}

/**
 * Lấy chi tiết đơn hàng
 */
export async function getOrderById(req: Request<{ id: string }>, res: Response<ApiResponse<Order>>): Promise<void> {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!orders_customer_id_fkey(id, name),
        counter:counters!orders_counter_id_fkey(id, name),
        staff:users!orders_staff_id_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        shiftId: order.shift_id,
        customerId: order.customer_id,
        customerName: order.customer?.name,
        counterId: order.counter_id,
        counterName: order.counter?.name,
        staffId: order.staff_id || undefined, // Convert null to undefined
        staffName: order.staff?.name,
        tienHang: parseFloat(order.tien_hang),
        tienCongGom: parseFloat(order.tien_cong_gom),
        phiDongHang: parseFloat(order.phi_dong_hang),
        tienHoaHong: parseFloat(order.tien_hoa_hong || 0),
        tienThem: order.tien_them ? parseFloat(order.tien_them) : undefined,
        loaiTienThem: order.loai_tien_them || undefined,
        tongTienHoaDon: parseFloat(order.tong_tien_hoa_don),
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      },
    });
  } catch (error: any) {
    console.error('Get order by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin đơn hàng',
    });
  }
}

/**
 * Lấy tất cả đơn hàng trong một ca
 */
export async function getOrdersByShift(req: Request<{ shiftId: string }>, res: Response<ApiResponse<Order[]>>): Promise<void> {
  try {
    const { shiftId } = req.params;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!orders_customer_id_fkey(id, name),
        counter:counters!orders_counter_id_fkey(id, name),
        staff:users!orders_staff_id_fkey(id, name)
      `)
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get orders by shift error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi lấy danh sách đơn hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: orders.map((order: any) => ({
        id: order.id,
        shiftId: order.shift_id,
        customerId: order.customer_id,
        customerName: order.customer?.name,
        counterId: order.counter_id,
        counterName: order.counter?.name,
        staffId: order.staff_id || undefined, // Convert null to undefined
        staffName: order.staff?.name,
        tienHang: parseFloat(order.tien_hang),
        tienCongGom: parseFloat(order.tien_cong_gom),
        phiDongHang: parseFloat(order.phi_dong_hang),
        tienHoaHong: parseFloat(order.tien_hoa_hong || 0),
        tienThem: order.tien_them ? parseFloat(order.tien_them) : undefined,
        loaiTienThem: order.loai_tien_them || undefined,
        tongTienHoaDon: parseFloat(order.tong_tien_hoa_don),
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      })),
    });
  } catch (error: any) {
    console.error('Get orders by shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách đơn hàng',
    });
  }
}

/**
 * Tạo đơn hàng mới (với logic tự động tạo customer/counter nếu cần)
 */
export async function createOrder(
  req: Request<
    {},
    ApiResponse<Order>,
    {
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
  >,
  res: Response
): Promise<void> {
  try {
    const { shiftId, customerId, customerName, customerPhone, counterId, counterName, tienHang, tienCongGom, phiDongHang, tienHoaHong = 0 } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Chưa đăng nhập',
      });
      return;
    }

    // Validation cơ bản
    if (!shiftId || !tienHang || tienHang <= 0) {
      res.status(400).json({
        success: false,
        error: 'Thông tin không hợp lệ',
      });
      return;
    }

    // Kiểm tra shift tồn tại và active
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId)
      .single();

    if (shiftError || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc',
      });
      return;
    }

    if (shift.status !== 'active') {
      res.status(400).json({
        success: false,
        error: 'Ca làm việc không còn active, không thể tạo đơn',
      });
      return;
    }

    // Kiểm tra worker có quyền tạo đơn trong ca này không
    if (shift.staff_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Bạn không có quyền tạo đơn trong ca này',
      });
      return;
    }

    let finalCustomerId = customerId;
    let finalCounterId = counterId;

    // Tạo customer mới nếu chưa có customerId
    if (!finalCustomerId) {
      if (!customerName || !customerName.trim()) {
        res.status(400).json({
          success: false,
          error: 'Tên khách hàng là bắt buộc',
        });
        return;
      }

      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: customerName.trim(),
          phone: customerPhone?.trim() || null,
        })
        .select()
        .single();

      if (customerError || !newCustomer) {
        console.error('Create customer error:', customerError);
        res.status(500).json({
          success: false,
          error: 'Lỗi tạo khách hàng. Vui lòng thử lại.',
        });
        return;
      }

      finalCustomerId = newCustomer.id;
    }

    // Tạo counter mới nếu chưa có counterId
    if (!finalCounterId) {
      if (!counterName || !counterName.trim()) {
        res.status(400).json({
          success: false,
          error: 'Tên quầy là bắt buộc',
        });
        return;
      }

      const { data: newCounter, error: counterError } = await supabase
        .from('counters')
        .insert({
          name: counterName.trim(),
          is_active: true,
        })
        .select()
        .single();

      if (counterError || !newCounter) {
        console.error('Create counter error:', counterError);
        res.status(500).json({
          success: false,
          error: 'Lỗi tạo quầy. Vui lòng thử lại.',
        });
        return;
      }

      finalCounterId = newCounter.id;
    }

    // Tính tổng tiền hóa đơn
    const tongTienHoaDon = tienHang + tienCongGom + phiDongHang;

    // Kiểm tra quỹ còn lại có đủ không
    const quyConLaiHienTai = parseFloat(shift.quy_con_lai || 0);
    if (quyConLaiHienTai < tienHang) {
      res.status(400).json({
        success: false,
        error: `Quỹ không đủ. Quỹ còn lại: ${quyConLaiHienTai.toLocaleString('vi-VN')}đ, cần: ${tienHang.toLocaleString('vi-VN')}đ`,
      });
      return;
    }

    // Tạo đơn hàng và cập nhật shift trong transaction (Supabase không hỗ trợ transaction trực tiếp, nên làm tuần tự)
    // Bước 1: Tạo đơn hàng
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        shift_id: shiftId,
        customer_id: finalCustomerId,
        counter_id: finalCounterId,
        staff_id: userId,
        tien_hang: tienHang,
        tien_cong_gom: tienCongGom || 0,
        phi_dong_hang: phiDongHang || 0,
        tien_hoa_hong: tienHoaHong || 0,
        tong_tien_hoa_don: tongTienHoaDon,
        status: 'pending',
      })
      .select(`
        *,
        customer:customers!orders_customer_id_fkey(id, name),
        counter:counters!orders_counter_id_fkey(id, name),
        staff:users!orders_staff_id_fkey(id, name)
      `)
      .single();

    if (orderError || !newOrder) {
      console.error('Create order error:', orderError);
      res.status(500).json({
        success: false,
        error: 'Lỗi tạo đơn hàng. Vui lòng thử lại.',
      });
      return;
    }

    // Bước 2: Cập nhật shift
    const tongTienHangDaTraMoi = parseFloat(shift.tong_tien_hang_da_tra || 0) + tienHang;
    const quyConLaiMoi = parseFloat(shift.tien_giao_ca) - tongTienHangDaTraMoi;

    const { error: shiftUpdateError } = await supabase
      .from('shifts')
      .update({
        tong_tien_hang_da_tra: tongTienHangDaTraMoi,
        quy_con_lai: quyConLaiMoi,
      })
      .eq('id', shiftId);

    if (shiftUpdateError) {
      console.error('Update shift error:', shiftUpdateError);
      // Rollback: Xóa đơn hàng vừa tạo
      await supabase.from('orders').delete().eq('id', newOrder.id);
      res.status(500).json({
        success: false,
        error: 'Lỗi cập nhật ca làm việc. Đơn hàng đã được hủy.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: newOrder.id,
        shiftId: newOrder.shift_id,
        customerId: newOrder.customer_id,
        customerName: newOrder.customer?.name,
        counterId: newOrder.counter_id,
        counterName: newOrder.counter?.name,
        staffId: newOrder.staff_id,
        staffName: newOrder.staff?.name,
        tienHang: parseFloat(newOrder.tien_hang),
        tienCongGom: parseFloat(newOrder.tien_cong_gom),
        phiDongHang: parseFloat(newOrder.phi_dong_hang),
        tienHoaHong: parseFloat(newOrder.tien_hoa_hong || 0),
        tongTienHoaDon: parseFloat(newOrder.tong_tien_hoa_don),
        status: newOrder.status,
        createdAt: new Date(newOrder.created_at),
        updatedAt: new Date(newOrder.updated_at),
      },
      message: 'Tạo đơn hàng thành công',
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi tạo đơn hàng. Vui lòng thử lại.',
    });
  }
}

/**
 * Cập nhật đơn hàng
 */
export async function updateOrder(
  req: Request<
    { id: string },
    ApiResponse<Order>,
    {
      status?: 'pending' | 'completed' | 'cancelled';
      tienHang?: number;
      tienCongGom?: number;
      phiDongHang?: number;
      tienHoaHong?: number;
      tienThem?: number;
      loaiTienThem?: string;
    }
  >,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { status, tienHang, tienCongGom, phiDongHang, tienHoaHong, tienThem, loaiTienThem } = req.body;
    const userRole = (req as any).user?.role;

    // Chỉ admin mới có quyền sửa các trường tiền
    const isEditingMoneyFields = tienHang !== undefined || tienCongGom !== undefined || 
                                  phiDongHang !== undefined || tienHoaHong !== undefined || 
                                  tienThem !== undefined || loaiTienThem !== undefined;
    
    if (isEditingMoneyFields && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Chỉ admin mới có quyền sửa các trường tiền trong hóa đơn',
      });
      return;
    }

    // Lấy đơn hàng hiện tại
    const { data: existingOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !existingOrder) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tienHang !== undefined) updateData.tien_hang = tienHang;
    if (tienCongGom !== undefined) updateData.tien_cong_gom = tienCongGom;
    if (phiDongHang !== undefined) updateData.phi_dong_hang = phiDongHang;
    if (tienHoaHong !== undefined) updateData.tien_hoa_hong = tienHoaHong;
    if (tienThem !== undefined) updateData.tien_them = tienThem;
    if (loaiTienThem !== undefined) updateData.loai_tien_them = loaiTienThem || null;

    // Tính lại tong_tien_hoa_don nếu có thay đổi
    const finalTienHang = tienHang !== undefined ? tienHang : parseFloat(existingOrder.tien_hang);
    const finalTienCongGom = tienCongGom !== undefined ? tienCongGom : parseFloat(existingOrder.tien_cong_gom);
    const finalPhiDongHang = phiDongHang !== undefined ? phiDongHang : parseFloat(existingOrder.phi_dong_hang);
    const finalTienHoaHong = tienHoaHong !== undefined ? tienHoaHong : parseFloat(existingOrder.tien_hoa_hong || 0);
    const finalTienThem = tienThem !== undefined ? (tienThem || 0) : parseFloat(existingOrder.tien_them || 0);
    
    updateData.tong_tien_hoa_don = finalTienHang + finalTienCongGom + finalPhiDongHang + finalTienHoaHong + finalTienThem;

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customer:customers!orders_customer_id_fkey(id, name),
        counter:counters!orders_counter_id_fkey(id, name),
        staff:users!orders_staff_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Update order error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi cập nhật đơn hàng. Vui lòng thử lại.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedOrder.id,
        shiftId: updatedOrder.shift_id,
        customerId: updatedOrder.customer_id,
        customerName: updatedOrder.customer?.name,
        counterId: updatedOrder.counter_id,
        counterName: updatedOrder.counter?.name,
        staffId: updatedOrder.staff_id,
        staffName: updatedOrder.staff?.name,
        tienHang: parseFloat(updatedOrder.tien_hang),
        tienCongGom: parseFloat(updatedOrder.tien_cong_gom),
        phiDongHang: parseFloat(updatedOrder.phi_dong_hang),
        tienHoaHong: parseFloat(updatedOrder.tien_hoa_hong || 0),
        tienThem: updatedOrder.tien_them ? parseFloat(updatedOrder.tien_them) : undefined,
        loaiTienThem: updatedOrder.loai_tien_them || undefined,
        tongTienHoaDon: parseFloat(updatedOrder.tong_tien_hoa_don),
        status: updatedOrder.status,
        createdAt: new Date(updatedOrder.created_at),
        updatedAt: new Date(updatedOrder.updated_at),
      },
      message: 'Cập nhật đơn hàng thành công',
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi cập nhật đơn hàng. Vui lòng thử lại.',
    });
  }
}

/**
 * Xóa đơn hàng (chỉ pending)
 */
export async function deleteOrder(req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
  try {
    const { id } = req.params;

    // Lấy đơn hàng
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng',
      });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: 'Chỉ có thể xóa đơn hàng đang pending',
      });
      return;
    }

    // Xóa đơn hàng
    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      console.error('Delete order error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi xóa đơn hàng. Vui lòng thử lại.',
      });
      return;
    }

    // Cập nhật lại shift (hoàn lại tiền)
    const tienHang = parseFloat(order.tien_hang);
    const { data: shift } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', order.shift_id)
      .single();

    if (shift) {
      const tongTienHangDaTraMoi = parseFloat(shift.tong_tien_hang_da_tra || 0) - tienHang;
      const quyConLaiMoi = parseFloat(shift.tien_giao_ca) - tongTienHangDaTraMoi;

      await supabase
        .from('shifts')
        .update({
          tong_tien_hang_da_tra: tongTienHangDaTraMoi,
          quy_con_lai: quyConLaiMoi,
        })
        .eq('id', order.shift_id);
    }

    res.json({
      success: true,
      message: 'Xóa đơn hàng thành công',
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xóa đơn hàng. Vui lòng thử lại.',
    });
  }
}
