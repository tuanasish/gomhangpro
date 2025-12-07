# Gom Hàng Pro - Frontend

Frontend application cho hệ thống quản lý gom hàng Ninh Hiệp.

## Công nghệ sử dụng

- **React** 19.2.1
- **TypeScript**
- **React Router DOM** 7.10.1
- **Tailwind CSS** (via CDN)
- **Vite** - Build tool
- **Material Symbols Icons**

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env.local` (nếu cần):
```bash
GEMINI_API_KEY=your_api_key
```

## Chạy ứng dụng

### Development mode:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### Build cho production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## Cấu trúc thư mục

```
frontend/
├── pages/
│   ├── Login.tsx              # Trang đăng nhập
│   ├── RoleSelection.tsx      # Chọn vai trò (Worker/Manager)
│   ├── worker/
│   │   ├── StartShift.tsx     # Bắt đầu ca
│   │   ├── WorkerHome.tsx     # Trang chủ nhân viên
│   │   ├── CreateOrder.tsx    # Tạo đơn mới
│   │   ├── OrderDetail.tsx    # Chi tiết đơn hàng
│   │   └── EndShift.tsx       # Kết ca
│   └── manager/
│       ├── ManagerDashboard.tsx  # Dashboard quản lý
│       └── ManagerOrders.tsx     # Danh sách đơn hàng
├── App.tsx                    # Component chính
├── index.tsx                  # Entry point
├── types.ts                   # Type definitions
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Tính năng

### Worker Portal
- Đăng nhập
- Bắt đầu ca làm việc (chọn quầy, số dư đầu ca)
- Tạo đơn hàng mới với tính toán tự động
- Xem danh sách đơn hàng trong ca
- Xem chi tiết đơn hàng
- Kết ca và báo cáo

### Manager Portal
- Dashboard với thống kê:
  - Tổng doanh thu
  - Lợi nhuận
  - Đơn hàng mới
  - Khách hàng mới
- Quản lý danh sách đơn hàng với bộ lọc
- Top nhân viên

## Dark Mode

Ứng dụng hỗ trợ dark mode, tự động dựa trên theme của hệ thống.

## Lưu ý

- Port mặc định: **3000**
- API backend mặc định: **http://localhost:5000** (cần cấu hình khi kết nối backend)