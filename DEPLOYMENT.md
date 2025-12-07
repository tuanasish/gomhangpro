# Hướng dẫn Deploy Gom Hàng Pro

## ⚠️ QUAN TRỌNG: Deploy riêng Frontend và Backend

## 1. Deploy Backend

### Tạo Backend Project trên Vercel:

1. **Tạo project mới**:
   - Vào https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import repository: `tuanasish/gomhangpro`

2. **Cấu hình Project**:
   - **Project Name**: `gomhangpro-backend` (hoặc tên bạn muốn)
   - **Root Directory**: `backend` ⚠️ **QUAN TRỌNG: Phải set là `backend`**
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install && npm run build` (hoặc để Vercel tự detect từ `backend/package.json`)
   - **Output Directory**: `dist` (hoặc để Vercel tự detect)
   - **Install Command**: `npm install` (hoặc để Vercel tự detect)

3. **Set Environment Variables**:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   PORT=5000
   NODE_ENV=production
   VERCEL=1
   ```

4. **Deploy**: Click "Deploy"
   - URL sẽ là: `https://gomhangpro-backend.vercel.app` (hoặc tên bạn đã đặt)

## 2. Deploy Frontend

### Tạo Frontend Project trên Vercel:

1. **Tạo project mới**:
   - Vào https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import repository: `tuanasish/gomhangpro`

2. **Cấu hình Project**:
   - **Project Name**: `gomhangpro` (hoặc tên bạn muốn)
   - **Root Directory**: `frontend` ⚠️ **QUAN TRỌNG: Phải set là `frontend`**
   - **Framework Preset**: `Vite` (hoặc để Vercel tự detect)
   - **Build Command**: Để Vercel tự detect từ `frontend/vercel.json`
   - **Output Directory**: `dist` (tự detect)
   - **Install Command**: Để Vercel tự detect

3. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://gomhangpro-backend.vercel.app/api
   ```
   ⚠️ **Thay `gomhangpro-backend.vercel.app` bằng URL backend thực tế của bạn**

4. **Deploy**: Click "Deploy"
   - URL sẽ là: `https://gomhangpro.vercel.app` (hoặc tên bạn đã đặt)

## 3. Kiểm tra Deploy

### Backend:
- Test: `GET https://your-backend.vercel.app/api/health`
- Kết quả mong đợi:
  ```json
  {
    "status": "OK",
    "message": "Gom Hàng Pro API is running",
    "timestamp": "..."
  }
  ```

### Frontend:
- Truy cập URL frontend
- Thử đăng nhập

## 4. Setup Database

1. **Chạy migrations** trên Supabase SQL Editor:
   - `backend/database/migration_make_counter_id_nullable.sql`
   - `backend/database/migration_allow_delete_staff_keep_orders.sql`

2. **Tạo admin user**:
   - Chạy: `backend/database/create_admin_ready.sql`
   - Hoặc gọi API: `POST /api/auth/register-first-admin`

## 🔧 Troubleshooting

### Frontend build error: "vite: command not found"
- **Nguyên nhân**: Root Directory chưa được set = `frontend`
- **Giải pháp**: Vào Vercel Project Settings → General → Root Directory → Set = `frontend`

### Backend build error: "tsc: command not found"
- **Nguyên nhân**: Root Directory chưa được set = `backend`
- **Giải pháp**: Vào Vercel Project Settings → General → Root Directory → Set = `backend`

### Network Error trên Safari
- Đảm bảo `VITE_API_BASE_URL` đã được set đúng trong Vercel
- Kiểm tra CORS trong backend đã cho phép frontend domain

### 401 Unauthorized
- Kiểm tra JWT_SECRET và JWT_REFRESH_SECRET đã được set
- Đảm bảo backend có thể kết nối tới Supabase

## 📝 Lưu ý

- ✅ Frontend và Backend phải là 2 project riêng trên Vercel
- ✅ Mỗi project phải có Root Directory đúng (`frontend` hoặc `backend`)
- ✅ Environment variables phải được set cho cả 2 projects
- ✅ `VITE_API_BASE_URL` phải trỏ tới backend URL