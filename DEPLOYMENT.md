# Hướng dẫn Deploy Gom Hàng Pro

## Tổng quan
Project này được deploy thành 2 phần riêng biệt:
- **Frontend**: Deploy trên Vercel (hoặc hosting khác)
- **Backend**: Deploy riêng trên Vercel hoặc server khác

## 1. Deploy Backend

### Option A: Deploy trên Vercel (Recommended)

1. **Tạo project mới trên Vercel** cho backend:
   - Vào Vercel dashboard
   - Import repository: `tuanasish/gomhangpro`
   - Set **Root Directory** = `backend`
   - Set **Framework Preset** = `Other`

2. **Cấu hình Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables** trong Vercel:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**: Vercel sẽ tự động deploy khi bạn push code

5. **Lấy Backend URL**: Sau khi deploy, bạn sẽ có URL như:
   ```
   https://your-backend.vercel.app
   ```

### Option B: Deploy trên Server (Node.js)

1. **Clone repository và setup**:
   ```bash
   git clone https://github.com/tuanasish/gomhangpro.git
   cd gomhangpro/backend
   npm install
   ```

2. **Tạo file `.env`**:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   PORT=5000
   NODE_ENV=production
   ```

3. **Build và start**:
   ```bash
   npm run build
   npm start
   ```

4. **Sử dụng PM2** (recommended):
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name gomhang-api
   pm2 save
   pm2 startup
   ```

## 2. Deploy Frontend

### Deploy trên Vercel

1. **Tạo project mới trên Vercel** cho frontend:
   - Import repository: `tuanasish/gomhangpro`
   - Set **Root Directory** = `frontend` (hoặc để mặc định)
   - Set **Framework Preset** = `Vite`

2. **Cấu hình Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables** trong Vercel:
   ```
   VITE_API_BASE_URL=https://your-backend.vercel.app/api
   ```
   (Thay `your-backend.vercel.app` bằng URL backend của bạn)

4. **Deploy**: Vercel sẽ tự động deploy

## 3. Cấu hình Database

1. **Chạy migration** trên Supabase SQL Editor:
   - File: `backend/database/migration_make_counter_id_nullable.sql`
   - File: `backend/database/migration_allow_delete_staff_keep_orders.sql` (nếu cần)

2. **Tạo admin user đầu tiên**:
   - Chạy script: `backend/database/create_admin_ready.sql` trên Supabase
   - Hoặc sử dụng API: `POST /api/auth/register-first-admin`

## 4. Kiểm tra Deploy

1. **Kiểm tra Backend**:
   ```
   GET https://your-backend.vercel.app/api/health
   ```
   Kết quả mong đợi:
   ```json
   {
     "status": "OK",
     "message": "Gom Hàng Pro API is running",
     "timestamp": "..."
   }
   ```

2. **Kiểm tra Frontend**:
   - Truy cập URL frontend
   - Thử đăng nhập với tài khoản admin

## Lưu ý quan trọng

- ✅ Backend và Frontend phải deploy riêng biệt
- ✅ `VITE_API_BASE_URL` phải được set trong Vercel environment variables
- ✅ Tất cả environment variables phải được set trong Vercel
- ✅ Database migrations phải được chạy trên Supabase
- ✅ CORS đã được cấu hình để cho phép frontend domain

## Troubleshooting

### Lỗi Network Error trên Safari
- Đảm bảo `VITE_API_BASE_URL` được set đúng
- Kiểm tra CORS configuration trong backend
- Kiểm tra console log để xem URL nào đang được gọi

### Lỗi 401 Unauthorized
- Kiểm tra JWT_SECRET và JWT_REFRESH_SECRET
- Đảm bảo backend có thể connect tới Supabase

### Backend không chạy
- Kiểm tra environment variables đã được set chưa
- Kiểm tra logs trong Vercel dashboard
- Đảm bảo build command chạy thành công

