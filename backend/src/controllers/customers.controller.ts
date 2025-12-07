import { Request, Response } from 'express';
import { ApiResponse, Customer } from '../types/index.js';
import { supabase } from '../config/supabase.js';

/**
 * Lấy danh sách khách hàng
 */
export async function getCustomersList(req: Request, res: Response<ApiResponse<Customer[]>>): Promise<void> {
  try {
    const { search, phone } = req.query;
    
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by search (name)
    if (search && typeof search === 'string') {
      query = query.ilike('name', `%${search}%`);
    }

    // Filter by phone
    if (phone && typeof phone === 'string') {
      query = query.ilike('phone', `%${phone}%`);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('Get customers list error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi lấy danh sách khách hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: customers.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      })),
    });
  } catch (error: any) {
    console.error('Get customers list error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy danh sách khách hàng',
    });
  }
}

/**
 * Lấy chi tiết khách hàng
 */
export async function getCustomerById(req: Request<{ id: string }>, res: Response<ApiResponse<Customer>>): Promise<void> {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !customer) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy khách hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      },
    });
  } catch (error: any) {
    console.error('Get customer by id error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi lấy thông tin khách hàng',
    });
  }
}

/**
 * Tạo khách hàng mới
 */
export async function createCustomer(
  req: Request<{}, ApiResponse<Customer>, { name: string; phone?: string; address?: string }>,
  res: Response
): Promise<void> {
  try {
    const { name, phone, address } = req.body;

    // Validation cơ bản
    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: 'Tên khách hàng là bắt buộc',
      });
      return;
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi tạo khách hàng. Vui lòng thử lại.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        id: newCustomer.id,
        name: newCustomer.name,
        phone: newCustomer.phone || undefined,
        address: newCustomer.address || undefined,
        createdAt: new Date(newCustomer.created_at),
        updatedAt: new Date(newCustomer.updated_at),
      },
      message: 'Tạo khách hàng thành công',
    });
  } catch (error: any) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi tạo khách hàng. Vui lòng thử lại.',
    });
  }
}

/**
 * Cập nhật khách hàng
 */
export async function updateCustomer(
  req: Request<{ id: string }, ApiResponse<Customer>, { name?: string; phone?: string; address?: string }>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, phone, address } = req.body;

    const updateData: any = {};
    if (name !== undefined) {
      if (!name.trim()) {
        res.status(400).json({
          success: false,
          error: 'Tên khách hàng không được để trống',
        });
        return;
      }
      updateData.name = name.trim();
    }
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedCustomer) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy khách hàng',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone || undefined,
        address: updatedCustomer.address || undefined,
        createdAt: new Date(updatedCustomer.created_at),
        updatedAt: new Date(updatedCustomer.updated_at),
      },
      message: 'Cập nhật khách hàng thành công',
    });
  } catch (error: any) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi cập nhật khách hàng. Vui lòng thử lại.',
    });
  }
}

/**
 * Xóa khách hàng
 */
export async function deleteCustomer(req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
  try {
    const { id } = req.params;

    // Kiểm tra khách hàng có đang được sử dụng trong đơn hàng không
    const { data: orders, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', id)
      .limit(1);

    if (checkError) {
      console.error('Check customer usage error:', checkError);
    }

    if (orders && orders.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Không thể xóa khách hàng đang có đơn hàng',
      });
      return;
    }

    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        error: 'Lỗi xóa khách hàng. Vui lòng thử lại.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Lỗi xóa khách hàng. Vui lòng thử lại.',
    });
  }
}
