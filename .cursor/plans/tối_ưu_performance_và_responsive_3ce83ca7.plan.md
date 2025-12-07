---
name: Tối ưu Performance và Responsive
overview: "Tối ưu performance và responsive cho ứng dụng, tập trung vào tốc độ tải và trải nghiệm trên mobile. Bao gồm: loại bỏ Tailwind CDN, code splitting, tối ưu API calls, memoization, và cải thiện responsive design."
todos:
  - id: setup-tailwind
    content: Cài đặt Tailwind CSS, PostCSS và loại bỏ CDN - tạo tailwind.config.js, postcss.config.js, index.css
    status: completed
  - id: remove-tailwind-cdn
    content: Loại bỏ Tailwind CDN script từ index.html và cập nhật Vite config
    status: completed
    dependencies:
      - setup-tailwind
  - id: lazy-load-routes
    content: Lazy load tất cả route components trong App.tsx với React.lazy() và Suspense
    status: completed
  - id: optimize-adminshifts-api
    content: "Tối ưu AdminShifts: loại bỏ N+1 queries bằng cách load orders hiệu quả hơn"
    status: completed
  - id: memoize-contexts
    content: Memoize AuthContext và NotificationContext values với useMemo và useCallback
    status: completed
  - id: fix-notification-timeout
    content: Fix memory leak trong NotificationContext bằng cách cleanup setTimeout
    status: completed
  - id: memoize-components
    content: Thêm React.memo và useMemo cho các list components và heavy computations
    status: completed
  - id: optimize-debounce
    content: Tăng debounce time trong CreateOrder từ 300ms lên 500ms
    status: completed
  - id: improve-touch-targets
    content: Đảm bảo tất cả interactive elements có min-height 44px trên mobile
    status: completed
  - id: optimize-scroll
    content: Thêm CSS optimizations cho scroll performance trên mobile
    status: completed
---

# Kế hoạch Tối ưu Performance và Responsive

## 1. Tối ưu Build và Bundle Size

### 1.1. Loại bỏ Tailwind CDN, sử dụng PostCSS build

**File:** `frontend/index.html`, `frontend/vite.config.ts`, `frontend/postcss.config.js` (tạo mới), `frontend/tailwind.config.js` (tạo mới)

**Vấn đề:** Tailwind CDN trong production làm tăng bundle size và giảm performance.

**Giải pháp:**

- Cài đặt Tailwind CSS như dependency: `tailwindcss`, `autoprefixer`, `postcss`
- Tạo `tailwind.config.js` với cấu hình hiện tại từ inline script
- Tạo `postcss.config.js` để build CSS
- Tạo `frontend/src/index.css` import Tailwind directives
- Loại bỏ Tailwind CDN script từ `index.html`
- Cập nhật `vite.config.ts` để import CSS

### 1.2. Tối ưu Fonts và Icons

**File:** `frontend/index.html`, `frontend/vite.config.ts`

**Vấn đề:** Fonts và Material Icons đang load từ CDN, có thể tự host để tăng tốc độ.

**Giải pháp:**

- Giữ nguyên Google Fonts (đã có preconnect, đủ nhanh)
- Cân nhắc self-host Material Icons (tùy chọn, ưu tiên thấp)

## 2. Code Splitting và Lazy Loading

### 2.1. Lazy load routes

**File:** `frontend/App.tsx`

**Vấn đề:** Tất cả pages đang được import trực tiếp, tăng bundle size ban đầu.

**Giải pháp:**

- Sử dụng `React.lazy()` và `Suspense` cho tất cả route components
- Tạo loading fallback component
- Giữ Login và RoleSelection không lazy (cần load nhanh)

### 2.2. Tối ưu Context Providers

**File:** `frontend/App.tsx`, `frontend/src/context/AuthContext.tsx`, `frontend/src/context/NotificationContext.tsx`

**Vấn đề:** Context providers có thể gây re-render không cần thiết.

**Giải pháp:**

- Sử dụng `useMemo` cho context values
- Memoize các callback functions với `useCallback`

## 3. Tối ưu API Calls

### 3.1. Tối ưu AdminShifts - Loại bỏ N+1 queries

**File:** `frontend/pages/manager/AdminShifts.tsx`

**Vấn đề:** Đang gọi API `getOrdersByShift()` cho từng shift riêng lẻ (N+1 problem).

**Giải pháp:**

- Tạo API endpoint mới: `GET /api/shifts?includeOrders=true` để load orders cùng lúc
- Hoặc: Load tất cả orders một lần rồi group theo shiftId
- Sử dụng `useMemo` để cache kết quả tính toán

### 3.2. Thêm request caching và deduplication

**File:** `frontend/src/services/api.service.ts`

**Vấn đề:** Có thể có duplicate API calls khi component re-mount.

**Giải pháp:**

- Thêm request deduplication logic
- Cache responses cho một thời gian ngắn (5 phút)
- Sử dụng React Query hoặc SWR (tùy chọn, ưu tiên thấp)

### 3.3. Tối ưu debounce trong CreateOrder

**File:** `frontend/pages/worker/CreateOrder.tsx`

**Vấn đề:** Debounce 300ms có thể tăng lên 500ms để giảm API calls.

**Giải pháp:**

- Tăng debounce time từ 300ms lên 500ms
- Thêm loading state để UX tốt hơn

## 4. Component Optimization

### 4.1. Memoization cho các component nặng

**File:** Các page components, đặc biệt:

- `frontend/pages/manager/AdminShifts.tsx`
- `frontend/pages/manager/ManagerOrders.tsx`
- `frontend/pages/worker/WorkerHome.tsx`

**Giải pháp:**

- Sử dụng `React.memo()` cho list items
- Sử dụng `useMemo` cho các tính toán phức tạp (đã có một số, cần bổ sung)
- Sử dụng `useCallback` cho event handlers được pass xuống children

### 4.2. Tối ưu NotificationContext

**File:** `frontend/src/context/NotificationContext.tsx`

**Vấn đề:** `setTimeout` có thể gây memory leak nếu component unmount trước khi timeout.

**Giải pháp:**

- Cleanup timeout khi component unmount
- Sử dụng `useRef` để track timeout IDs
- Cleanup trong `useEffect` cleanup function

### 4.3. Virtual Scrolling cho danh sách dài

**File:** `frontend/pages/manager/ManagerOrders.tsx`, `frontend/pages/manager/AdminShifts.tsx`

**Vấn đề:** Khi có nhiều orders/shifts, render tất cả có thể chậm.

**Giải pháp:**

- Cân nhắc thêm pagination hoặc virtual scrolling (ưu tiên thấp nếu số lượng < 100 items)
- Ưu tiên pagination ở backend

## 5. Responsive và Mobile Optimization

### 5.1. Tối ưu Touch Targets

**File:** Tất cả các page components

**Vấn đề:** Một số button có thể nhỏ hơn 44x44px trên mobile.

**Giải pháp:**

- Đảm bảo tất cả interactive elements có min-height: 44px
- Thêm padding cho các button nhỏ
- Kiểm tra và cập nhật các icon buttons

### 5.2. Tối ưu Scroll Performance

**File:** `frontend/index.css` (tạo mới hoặc cập nhật)

**Giải pháp:**

- Thêm `will-change` cho các elements có animation
- Sử dụng `transform` thay vì `top/left` cho animations
- Thêm `touch-action: manipulation` để giảm delay trên mobile

### 5.3. Viewport và Safe Area

**File:** `frontend/index.html`

**Giải pháp:**

- Đảm bảo viewport meta tag đã đúng
- Thêm support cho safe-area-inset trong CSS
- Test trên các thiết bị có notch

### 5.4. Tối ưu Images và Assets

**File:** `frontend/vite.config.ts`

**Giải pháp:**

- Đảm bảo images được optimize
- Sử dụng modern image formats (WebP) nếu có
- Lazy load images (nếu có)

## 6. Build Configuration

### 6.1. Tối ưu Vite Build

**File:** `frontend/vite.config.ts`

**Giải pháp:**

- Thêm `build.rollupOptions.output.manualChunks` để split vendor chunks
- Tối ưu chunk size
- Enable minification và tree-shaking (đã có mặc định)

### 6.2. Bundle Analysis

**Giải pháp:**

- Cài đặt `rollup-plugin-visualizer` để phân tích bundle
- Xác định các dependencies lớn
- Loại bỏ unused dependencies

## Implementation Order

1. **Phase 1 - Critical (Performance):**

- Loại bỏ Tailwind CDN, setup PostCSS build
- Lazy load routes
- Tối ưu AdminShifts API calls

2. **Phase 2 - Important (Performance):**

- Memoization cho components
- Tối ưu NotificationContext
- Request caching

3. **Phase 3 - Nice to have (Responsive & UX):**

- Touch targets
- Scroll performance
- Bundle analysis và optimization

## Expected Results

- **Bundle size giảm:** ~30-40% (sau khi loại bỏ Tailwind CDN)
- **Initial load time giảm:** ~20-30%
- **API calls giảm:** ~50% (sau khi tối ưu AdminShifts)
- **Re-renders giảm:** ~30-40% (sau memoization)
- **Mobile UX cải thiện:** Touch targets và scroll mượt hơn