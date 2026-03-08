# Change Log

All notable changes to this project will be documented in this file.

## [2026-03-08]

### Added
- Thêm cơ chế tự động mở ca làm việc (auto-start shift) nếu quỹ âm (0đ).
- Bổ sung Thống kê "Phí đóng gửi" vào Dashboard Quản lý (customer_daily_fees).
- Chi tiết Tiền hàng, Hoa hồng, Thuế và Tổng tiền hiển thị dạng list trong Dashboard Quản lý.
- Xuất thẳng hóa đơn ra Ảnh (thay vì in PDF), fix UI hóa đơn ảnh (ẩn giờ, thêm cột thuế, chuyển 'Tiền hàng' thành 'Tiền ứng', in đậm sđt).
- Validation chặn Worker tạo khách hàng mới khi lưu đơn.
- Web Deployment thông qua Vercel (`gomhang.vercel.app`).
- EAS Build Scripts cho iOS (App Store/TestFlight) và Android (APK).
- Sửa lỗi tạo hóa đơn có sản phẩm giá trị 0đ trên backend.
- Bổ sung dòng tổng cộng "TỔNG X ĐƠN" (Tiền ứng, Phí gom, Thuế, Tổng tiền) vào dưới cùng của ảnh Export hóa đơn.

### Changed
- Sửa lỗi lệch timezone (UTC -> GMT+7) trên màn hình Chi tiết khách hàng.
- Bỏ tính năng duyệt đơn hàng (đơn hàng tự động sang hoàn thành).
- Khôi phục UI Bottom Sheet cho sửa đơn hàng, fix lỗi bàn phím che khuất.
- Lọc bỏ các đơn hàng "Đã hủy" khỏi màn hình chi tiết.
- Cột Hoa hồng cộng dồn vào Tiền hàng khi xuất hóa đơn thay vì hiển thị tách rời.
- Sửa Component TouchableOpacity trong Dashboard, bấm vào hóa đơn sẽ nhảy sang Chi tiết hóa đơn (thay vì khách hàng).
- Chỉnh UI hóa đơn: Khắc phục lỗi html2canvas bị cắt xén bằng explicit scrollWidth/Height, loại bỏ viền gạch ngang lặp lại ở dòng Tổng cộng.
