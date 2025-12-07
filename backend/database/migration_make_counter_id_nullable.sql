-- Migration: Làm cho counter_id trong bảng shifts có thể NULL
-- Lý do: Theo nghiệp vụ, quầy không cần chọn khi tạo ca làm việc
-- Quầy được chọn khi nhân viên tạo đơn hàng

-- Bước 1: Xóa foreign key constraint cũ (nếu có)
ALTER TABLE shifts 
DROP CONSTRAINT IF EXISTS shifts_counter_id_fkey;

-- Bước 2: Sửa cột counter_id để cho phép NULL
ALTER TABLE shifts 
ALTER COLUMN counter_id DROP NOT NULL;

-- Bước 3: Tạo lại foreign key constraint với ON DELETE SET NULL
ALTER TABLE shifts 
ADD CONSTRAINT shifts_counter_id_fkey 
FOREIGN KEY (counter_id) 
REFERENCES counters(id) 
ON DELETE SET NULL;

-- Kiểm tra lại schema
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'shifts' AND column_name = 'counter_id';

