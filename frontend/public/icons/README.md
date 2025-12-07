# PWA Icons

Các icon này cần được tạo để PWA hoạt động đúng. Bạn có thể tạo icons bằng cách:

## Cách tạo icons

### Option 1: Sử dụng công cụ online
1. Truy cập: https://realfavicongenerator.net/ hoặc https://www.pwabuilder.com/imageGenerator
2. Upload logo "Gom Hàng Pro" của bạn
3. Generate và download các sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
4. Đặt tên file theo format: `icon-{size}x{size}.png`

### Option 2: Sử dụng ImageMagick hoặc công cụ khác
```bash
# Nếu có logo gốc (ví dụ: logo.png)
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

## Yêu cầu

- Format: PNG
- Background: Nên có background để hiển thị đẹp trên các nền khác nhau
- Nội dung: Logo "Gom Hàng Pro" hoặc icon đại diện cho dịch vụ gom hàng

## File cần có

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png (quan trọng cho iOS)
- icon-192x192.png (quan trọng cho Android)
- icon-384x384.png
- icon-512x512.png (quan trọng cho splash screen)

## Tạm thời

Để app hoạt động ngay, bạn có thể tạo placeholder icons đơn giản bằng cách tạo ảnh màu đơn với text "GH" hoặc sử dụng icon từ Material Symbols.

