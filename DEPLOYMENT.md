# 🚀 Cẩm Nang Deploy Nhanh Gom Hàng Pro

Dự án đã được setup sẵn trên Vercel và Expo. Mỗi khi có code mới, chỉ cần chạy các lệnh sau để đẩy bản cập nhật lên server.

---

## 1. Cập nhật Backend (Node.js)

Thư mục: `backend`
URL Live: **`https://gomhangprobackend.vercel.app`**

Mở terminal, di chuyển vào thư mục backend và chạy lệnh deploy của Vercel:
```bash
cd backend
vercel --prod
```
*(Vercel sẽ tự động đọc cấu hình `vercel.json` và tải mã nguồn mới lên).*

---

## 2. Cập nhật Web Admin (React Native Web)

Thư mục: `gomhangpro-app` 
URL Live: **`https://gomhang.vercel.app`**

Mở terminal, di chuyển vào thư mục app và chạy lệnh deploy của Vercel:
```bash
cd gomhangpro-app
vercel --prod
```
*(Vercel sẽ chạy lệnh `npx expo export -p web` như cấu hình trong file `vercel.json` và đưa bản web mới nhất lên).*

---

## 3. Build Cập nhật Mobile App (Expo / APK / iOS)

Thư mục: `gomhangpro-app`

### Bước quan trọng trước khi Build
Đảm bảo file `gomhangpro-app/eas.json` ĐANG TRỎ ĐÚNG về URL backend thật cho các profile build (đặc biệt là `preview` và `production`):
```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://gomhangprobackend.vercel.app/api"
}
```

### Lệnh Build App
Mở terminal, di chuyển vào thư mục app và dùng EAS CLI để build:

**Build Android (xuất file .apk):**
```bash
cd gomhangpro-app
eas build -p android --profile preview
```

**Build iOS (lên TestFlight/App Store):**
```bash
cd gomhangpro-app
eas build -p ios
```

*(Lưu ý: Quá trình build trên EAS có thể mất từ 10 - 20 phút chạy ngầm).*

---

## 4. Phục hồi Database (Chỉ khi cần)
Nếu cần khôi phục dữ liệu hoặc cấu trúc mới, vào **Supabase SQL Editor**:
1. Chạy các file trong `backend/database/migration_***.sql`
2. Chạy `backend/database/create_admin_ready.sql` để tạo lại tài khoản Admin (nếu lỡ xóa trắng users).