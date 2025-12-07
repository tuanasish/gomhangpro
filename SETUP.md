# Hướng dẫn Setup Dự án Gom Hàng Pro

## Cấu trúc dự án

```
gomhangpro/
├── frontend/           # React Frontend
│   ├── pages/         # Các trang của ứng dụng
│   ├── App.tsx        # Component chính
│   └── ...
├── backend/            # Node.js Backend API
│   ├── src/
│   │   ├── server.ts  # Entry point
│   │   └── types/     # Type definitions
│   └── ...
└── package.json        # Root package.json để chạy cả 2
```

## Setup lần đầu

### 1. Cài đặt dependencies cho cả frontend và backend

**Cách 1: Cài đặt từng phần riêng**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

**Cách 2: Cài đặt tất cả (sau khi cài concurrently ở root)**

```bash
# Cài đặt concurrently ở root
npm install

# Cài đặt tất cả dependencies
npm run install:all
```

### 2. Cấu hình Backend

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa file `.env` với các thông tin cần thiết.

### 3. Chạy ứng dụng

**Chạy riêng lẻ:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Chạy cùng lúc (cần cài concurrently):**

```bash
# Từ thư mục root
npm run dev
```

## Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/api/health

## Scripts có sẵn

### Root level
- `npm run install:all` - Cài đặt dependencies cho cả frontend và backend
- `npm run dev` - Chạy cả frontend và backend cùng lúc (cần concurrently)
- `npm run dev:frontend` - Chỉ chạy frontend
- `npm run dev:backend` - Chỉ chạy backend
- `npm run build` - Build cả frontend và backend

### Frontend
- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Chạy với hot reload (tsx watch)
- `npm run build` - Build TypeScript
- `npm start` - Chạy production build

## Lưu ý

1. Đảm bảo đã cài đặt Node.js (version 18+)
2. Backend cần file `.env` để chạy (copy từ `.env.example`)
3. Frontend và Backend chạy trên ports khác nhau, không xung đột

## Troubleshooting

### Lỗi port đã được sử dụng
- Frontend: Sửa port trong `frontend/vite.config.ts`
- Backend: Sửa `PORT` trong `backend/.env`

### Lỗi module not found
- Chạy lại `npm install` trong thư mục tương ứng

### Lỗi TypeScript
- Kiểm tra lại `tsconfig.json`
- Đảm bảo đã cài đặt đầy đủ dependencies

