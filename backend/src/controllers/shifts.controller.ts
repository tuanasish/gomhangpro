import { Request, Response } from 'express';
import { ApiResponse, Shift } from '../types/index.js';
import { supabase } from '../config/supabase.js';

/**
 * Lấy danh sách ca làm việc
 */
export async function getShiftsList(req: Request, res: Response<ApiResponse<Shift[]>>): Promise<void> {
  try {
    // Auto-reset các ca đã hết hạn trước khi lấy danh sách
    await autoResetExpiredShifts();

    const { staffId, date, status } = req.query;
    
    let query = supabase
      .from('shifts')
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (staffId && typeof staffId === 'string') {
      query = query.eq('staff_id', staffId);
    }

    if (date && typeof date === 'string') {
      query = query.eq('date', date);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data: shifts, error } = await query;

    if (error) {
      console.error('Get shifts list error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi lấy danh sách ca làm việc',
      });
      return;
    }

    res.json({
      success: true,
      data: shifts.map((shift: any) => ({
        id: shift.id,
        staffId: shift.staff_id,
        staffName: shift.staff?.name,
        counterId: shift.counter_id || undefined,
        counterName: shift.counter?.name,
        date: shift.date,
        startTime: new Date(shift.start_time),
        endTime: shift.end_time ? new Date(shift.end_time) : undefined,
        tienGiaoCa: parseFloat(shift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(shift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(shift.quy_con_lai || 0),
        status: shift.status,
        createdAt: new Date(shift.created_at),
        updatedAt: new Date(shift.updated_at),
      })),
    });
  } catch (error: any) {
    console.error('Get shifts list error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách ca làm việc',
    });
  }
}

/**
 * Lấy chi tiết ca làm việc
 */
export async function getShiftById(req: Request<{ id: string }>, res: Response<ApiResponse<Shift>>): Promise<void> {
  try {
    const { id } = req.params;

    const { data: shift, error } = await supabase
      .from('shifts')
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: shift.id,
        staffId: shift.staff_id,
        staffName: shift.staff?.name,
        counterId: shift.counter_id || undefined,
        counterName: shift.counter?.name,
        date: shift.date,
        startTime: new Date(shift.start_time),
        endTime: shift.end_time ? new Date(shift.end_time) : undefined,
        tienGiaoCa: parseFloat(shift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(shift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(shift.quy_con_lai || 0),
        status: shift.status,
        createdAt: new Date(shift.created_at),
        updatedAt: new Date(shift.updated_at),
      },
    });
  } catch (error: any) {
    console.error('Get shift by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin ca làm việc',
    });
  }
}

/**
 * Lấy ca hiện tại của worker (active)
 */
export async function getCurrentShift(req: Request, res: Response<ApiResponse<Shift>>): Promise<void> {
  try {
    // Auto-reset các ca đã hết hạn trước khi lấy ca hiện tại
    await autoResetExpiredShifts();

    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Chưa đăng nhập',
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: shift, error } = await supabase
      .from('shifts')
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .eq('staff_id', userId)
      .eq('date', today)
      .eq('status', 'active')
      .single();

    if (error || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc active',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: shift.id,
        staffId: shift.staff_id,
        staffName: shift.staff?.name,
        counterId: shift.counter_id || undefined,
        counterName: shift.counter?.name,
        date: shift.date,
        startTime: new Date(shift.start_time),
        endTime: shift.end_time ? new Date(shift.end_time) : undefined,
        tienGiaoCa: parseFloat(shift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(shift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(shift.quy_con_lai || 0),
        status: shift.status,
        createdAt: new Date(shift.created_at),
        updatedAt: new Date(shift.updated_at),
      },
    });
  } catch (error: any) {
    console.error('Get current shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy ca làm việc hiện tại',
    });
  }
}

/**
 * Tạo ca mới (admin/manager)
 */
export async function createShift(
  req: Request<{}, ApiResponse<Shift>, { staffId: string; counterId?: string; date: string; tienGiaoCa: number }>,
  res: Response
): Promise<void> {
  try {
    const { staffId, counterId, date, tienGiaoCa } = req.body;

    // Validation cơ bản - counterId không bắt buộc
    if (!staffId || !date || !tienGiaoCa || tienGiaoCa <= 0) {
      res.status(400).json({
        success: false,
        error: 'Thông tin không hợp lệ',
      });
      return;
    }

    // Kiểm tra staff tồn tại
    const { data: staffData, error: staffError } = await supabase
      .from('users')
      .select('id, is_active')
      .eq('id', staffId)
      .single();

    if (staffError || !staffData || !staffData.is_active) {
      res.status(404).json({
        success: false,
        error: 'Nhân viên không tồn tại hoặc không active',
      });
      return;
    }

    // Kiểm tra counter nếu có counterId (optional)
    if (counterId) {
      const { data: counterData, error: counterError } = await supabase
        .from('counters')
        .select('id, is_active')
        .eq('id', counterId)
        .single();

      if (counterError || !counterData || !counterData.is_active) {
        res.status(404).json({
          success: false,
          error: 'Quầy không tồn tại hoặc không active',
        });
        return;
      }
    }

    // Kiểm tra nhân viên đã có ca active trong ngày chưa
    const { data: existingShift } = await supabase
      .from('shifts')
      .select('id')
      .eq('staff_id', staffId)
      .eq('date', date)
      .eq('status', 'active')
      .single();

    if (existingShift) {
      res.status(409).json({
        success: false,
        error: 'Nhân viên đã có ca active trong ngày này',
      });
      return;
    }

    // Tạo ca mới với start_time = date 00:00:00, sẽ được update khi worker bắt đầu
    const startTime = new Date(`${date}T00:00:00.000Z`);

    // Chỉ set counter_id nếu có counterId (optional)
    const insertData: any = {
      staff_id: staffId,
      date: date,
      start_time: startTime.toISOString(),
      tien_giao_ca: tienGiaoCa,
      tong_tien_hang_da_tra: 0,
      quy_con_lai: tienGiaoCa, // Quỹ còn lại ban đầu = tiền giao ca
      status: 'active', // Tạo ca là active luôn, worker sẽ "xác nhận" bằng cách bắt đầu làm việc
    };

    // Chỉ thêm counter_id nếu có (counter là optional khi tạo ca)
    if (counterId) {
      insertData.counter_id = counterId;
    }

    const { data: newShift, error } = await supabase
      .from('shifts')
      .insert(insertData)
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Create shift error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi tạo ca làm việc. Vui lòng thử lại.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: newShift.id,
        staffId: newShift.staff_id,
        staffName: newShift.staff?.name,
        counterId: newShift.counter_id || undefined,
        counterName: newShift.counter?.name,
        date: newShift.date,
        startTime: new Date(newShift.start_time),
        endTime: newShift.end_time ? new Date(newShift.end_time) : undefined,
        tienGiaoCa: parseFloat(newShift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(newShift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(newShift.quy_con_lai || 0),
        status: newShift.status,
        createdAt: new Date(newShift.created_at),
        updatedAt: new Date(newShift.updated_at),
      },
      message: 'Tạo ca làm việc thành công',
    });
  } catch (error: any) {
    console.error('Create shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi tạo ca làm việc. Vui lòng thử lại.',
    });
  }
}

/**
 * Bắt đầu ca (worker) - update start_time = now
 */
export async function startShift(req: Request<{ id: string }>, res: Response<ApiResponse<Shift>>): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Chưa đăng nhập',
      });
      return;
    }

    // Kiểm tra ca tồn tại và thuộc về user này
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (shiftError || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc',
      });
      return;
    }

    if (shift.staff_id !== userId) {
      res.status(403).json({
        success: false,
        error: 'Bạn không có quyền bắt đầu ca này',
      });
      return;
    }

    if (shift.status === 'ended') {
      res.status(400).json({
        success: false,
        error: 'Ca đã kết thúc, không thể bắt đầu lại',
      });
      return;
    }

    // Update start_time = now và đảm bảo status = 'active'
    const { data: updatedShift, error } = await supabase
      .from('shifts')
      .update({
        start_time: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', id)
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Start shift error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi bắt đầu ca. Vui lòng thử lại.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedShift.id,
        staffId: updatedShift.staff_id,
        staffName: updatedShift.staff?.name,
        counterId: updatedShift.counter_id || undefined,
        counterName: updatedShift.counter?.name,
        date: updatedShift.date,
        startTime: new Date(updatedShift.start_time),
        endTime: updatedShift.end_time ? new Date(updatedShift.end_time) : undefined,
        tienGiaoCa: parseFloat(updatedShift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(updatedShift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(updatedShift.quy_con_lai || 0),
        status: updatedShift.status,
        createdAt: new Date(updatedShift.created_at),
        updatedAt: new Date(updatedShift.updated_at),
      },
      message: 'Bắt đầu ca thành công',
    });
  } catch (error: any) {
    console.error('Start shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi bắt đầu ca. Vui lòng thử lại.',
    });
  }
}

/**
 * Auto-reset tiền cho các ca chưa kết thúc sau 12h đêm
 * Gọi function này trước khi lấy danh sách ca hoặc ca hiện tại
 */
async function autoResetExpiredShifts(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of today
  const todayISO = today.toISOString().split('T')[0];

  // Tìm các ca active có date < today (ca của ngày hôm qua hoặc trước đó)
  const { data: expiredShifts, error } = await supabase
    .from('shifts')
    .select('id, date')
    .eq('status', 'active')
    .lt('date', todayISO); // Shifts with date < today

  if (error) {
    console.error('Error fetching expired shifts:', error);
    return;
  }

  if (expiredShifts && expiredShifts.length > 0) {
    const shiftIdsToUpdate = expiredShifts.map((shift: { id: string; date: string }) => shift.id);
    console.log(`Auto-resetting ${shiftIdsToUpdate.length} expired shifts.`);

    // Reset tiền về 0 và kết thúc ca
    const { error: updateError } = await supabase
      .from('shifts')
      .update({
        tien_giao_ca: 0,
        tong_tien_hang_da_tra: 0,
        quy_con_lai: 0,
        status: 'ended',
        end_time: new Date().toISOString(), // End at current time
        updated_at: new Date().toISOString(),
      })
      .in('id', shiftIdsToUpdate);

    if (updateError) {
      console.error('Error auto-resetting expired shifts:', updateError);
    } else {
      console.log(`Successfully auto-reset ${shiftIdsToUpdate.length} shifts.`);
    }
  }
}

/**
 * Kết thúc ca (chỉ admin) - số dư cuối ca = tiền giao ca - tổng tiền hàng đã trả
 */
export async function endShift(
  req: Request<{ id: string }, ApiResponse<Shift>, {}>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Chưa đăng nhập',
      });
      return;
    }

    // Chỉ admin mới có quyền kết thúc ca
    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Chỉ admin mới có quyền kết thúc ca',
      });
      return;
    }

    // Lấy thông tin ca
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (shiftError || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc',
      });
      return;
    }

    if (shift.status === 'ended') {
      res.status(400).json({
        success: false,
        error: 'Ca đã kết thúc rồi',
      });
      return;
    }

    // Update shift - kết thúc ca
    const { data: updatedShift, error } = await supabase
      .from('shifts')
      .update({
        end_time: new Date().toISOString(),
        status: 'ended',
      })
      .eq('id', id)
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('End shift error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi kết thúc ca. Vui lòng thử lại.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedShift.id,
        staffId: updatedShift.staff_id,
        staffName: updatedShift.staff?.name,
        counterId: updatedShift.counter_id || undefined,
        counterName: updatedShift.counter?.name,
        date: updatedShift.date,
        startTime: new Date(updatedShift.start_time),
        endTime: updatedShift.end_time ? new Date(updatedShift.end_time) : undefined,
        tienGiaoCa: parseFloat(updatedShift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(updatedShift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(updatedShift.quy_con_lai || 0),
        status: updatedShift.status,
        createdAt: new Date(updatedShift.created_at),
        updatedAt: new Date(updatedShift.updated_at),
      },
      message: 'Kết thúc ca thành công',
    });
  } catch (error: any) {
    console.error('End shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi kết thúc ca. Vui lòng thử lại.',
    });
  }
}

/**
 * Cộng thêm tiền vào ca (Admin/Manager)
 */
export async function addMoneyToShift(req: Request, res: Response<ApiResponse<Shift>>): Promise<void> {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Số tiền phải lớn hơn 0',
      });
      return;
    }

    // Lấy ca hiện tại
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .eq('id', id)
      .single();

    if (shiftError || !shift) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy ca làm việc',
      });
      return;
    }

    // Tính toán lại
    const tienGiaoCaMoi = parseFloat(shift.tien_giao_ca) + amount;
    const tongTienHangDaTra = parseFloat(shift.tong_tien_hang_da_tra || 0);
    const quyConLai = tienGiaoCaMoi - tongTienHangDaTra;

    // Cập nhật ca
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update({
        tien_giao_ca: tienGiaoCaMoi.toString(),
        quy_con_lai: quyConLai.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        staff:users!shifts_staff_id_fkey(id, name),
        counter:counters!shifts_counter_id_fkey(id, name)
      `)
      .single();

    if (updateError || !updatedShift) {
      console.error('Update shift error:', updateError);
      res.status(500).json({
        success: false,
        error: 'Lỗi cập nhật ca làm việc',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedShift.id,
        staffId: updatedShift.staff_id,
        staffName: updatedShift.staff?.name,
        counterId: updatedShift.counter_id || undefined,
        counterName: updatedShift.counter?.name,
        date: updatedShift.date,
        startTime: new Date(updatedShift.start_time),
        endTime: updatedShift.end_time ? new Date(updatedShift.end_time) : undefined,
        tienGiaoCa: parseFloat(updatedShift.tien_giao_ca),
        tongTienHangDaTra: parseFloat(updatedShift.tong_tien_hang_da_tra || 0),
        quyConLai: parseFloat(updatedShift.quy_con_lai || 0),
        status: updatedShift.status,
        createdAt: new Date(updatedShift.created_at),
        updatedAt: new Date(updatedShift.updated_at),
      },
    });
  } catch (error: any) {
    console.error('Add money to shift error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi cộng thêm tiền',
    });
  }
}
