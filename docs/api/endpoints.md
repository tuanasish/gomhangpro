# API Documentation

Ngày cập nhật: 2026-03-08
Base URL: `/api`

---

## 🔐 Authentication (`/api/auth`)

### POST `/api/auth/login`
Đăng nhập vào hệ thống
- **Request**: `{ "username": "admin", "password": "123" }`
- **Response**: `{ "token": "jwt...", "user": { "id": "...", "role": "admin", ...} }`

---

## 👥 Users (`/api/users`)

### GET `/api/users`
Lấy danh sách nhân viên.
- **Response**: `[ { "id": "...", "full_name": "...", "role": "..." }, ... ]`

---

## 🏭 Customers (`/api/customers`)

### GET `/api/customers`
Lấy danh sách tất cả khách hàng.

### POST `/api/customers`
Tạo khách hàng mới (Chỉ Admin).

### GET `/api/customer-fees/daily`
Lấy phí đóng gửi của khách hàng theo ngày cụ thể.
- **Query Params**: `customerId` (UUID), `date` (YYYY-MM-DD)
- **Response**: `{ "id": "...", "fee_amount": 50000, "date": "..." }`

### POST `/api/customer-fees/daily`
Lưu hoặc cập nhật phí đóng gửi ngày cho khách hàng.
- **Body**: `{ "customerId": "UUID", "date": "YYYY-MM-DD", "feeAmount": 50000 }`
- **Response**: Trả về dữ liệu fee vừa cập nhật.

---

## ⏰ Shifts (`/api/shifts`)

### GET `/api/shifts/active`
Lấy ca làm việc đang hoạt động của nhân viên hiện tại.

### POST `/api/shifts/start`
Bắt đầu ca làm việc mới với số dư đầu ca (start_balance).

### POST `/api/shifts/start-auto`
Tự động mở ca nếu quỹ cuối ca trước đó là 0đ (hoặc âm).
- **Body**: `{ "employeeId": "UUID" }`
- **Response**: Shift data mới được khởi tạo

### POST `/api/shifts/end`
Kết thúc ca làm việc (chốt ca).

---

## 📦 Orders (`/api/orders`)

### GET `/api/orders`
Lấy danh sách đơn hàng. Có hỗ trợ date filter và status filter.

### POST `/api/orders`
Tạo đơn hàng mới cho ca hiện tại.

### PUT `/api/orders/:id`
Sửa đơn hàng đã có (áp dụng cho cả Admin và Worker trong ca hoạt động).

### DELETE `/api/orders/:id`
Hủy đơn hàng.
