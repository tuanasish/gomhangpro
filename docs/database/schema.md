# Database Schema (Supabase PostgreSQL)
Date: 2026-03-08

## Overview
Dự án GomHangPro lưu trữ thông tin về người dùng (nhân viên), khách hàng, ca làm việc (để chốt số ban đầu/cuối ca), đơn hàng, sản phẩm và các dòng tiền (bao gồm phí vận chuyển gửi đi).

Nguyên tắc chung:
- 1 user (nhân viên) có nhiều ca làm việc (shifts).
- 1 ca làm việc có nhiều đơn hàng (orders).
- 1 đơn hàng thuộc về 1 khách hàng (customer).

## Tables

### `users`
- `id` (UUID): Khóa chính
- `username` (Text): Tên đăng nhập
- `full_name` (Text): Tên đầy đủ
- `role` (Text): Enum (`admin`, `worker`)
- `created_at` (Timestamp)

### `customers`
- `id` (UUID): Khóa chính
- `name` (Text): Tên khách hàng
- `phone` (Text): Số điện thoại
- `address` (Text): Dùng để fix cứng chiết khấu/thuế mặc định (%)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `customer_daily_fees`
*(Sử dụng để lưu "Phí đóng gửi" mỗi ngày 1 lần cho mỗi khách)*
- `id` (UUID): Khóa chính
- `customer_id` (UUID): Foreign Key -> customers.id
- `date` (Date): Ngày áp dụng phí
- `fee_amount` (Numeric): Số tiền phí
- `created_at` (Timestamp/Timestamptz)
*(UNIQUE constraint trên `customer_id` và `date`)*

### `shifts`
*(Ca làm việc quản lý dòng tiền của nhân viên)*
- `id` (UUID): Khóa chính
- `employee_id` (UUID): Foreign Key -> users.id
- `start_time` (Timestamp)
- `end_time` (Timestamp, NULLable)
- `start_balance` (Numeric): Tiền quỹ đầu ca
- `end_balance` (Numeric, NULLable): Tiền quỹ cuối ca khi chốt
- `status` (Text): Enum (`active`, `completed`)
- `created_at` (Timestamp)

### `orders`
*(Đơn hàng xuất đi)*
- `id` (UUID): Khóa chính
- `customer_id` (UUID): Foreign Key -> customers.id
- `employee_id` (UUID): Foreign Key -> users.id
- `shift_id` (UUID): Foreign Key -> shifts.id
- `total_amount` (Numeric): Tổng tiền của đơn (bao gồm tiền hàng + hoa hồng + thuế). NOTE: Cột hoa hồng được gộp thẳng vào tổng tiền hàng.
- `status` (Text): Enum (`completed`, `cancelled`)
- `payment_method` (Text): Phương thức thanh toán (cash, transfer, v.v...)
- `notes` (Text): Ghi chú bổ sung
- `fee` (Numeric): Thuế / Phí xuất hóa đơn 
- `created_at`, `updated_at` (Timestamp)

### `products`
- `id` (UUID): Khóa chính
- `name` (Text), `code` (Text)
- `price` (Numeric)
- `stock_quantity` (Integer)
