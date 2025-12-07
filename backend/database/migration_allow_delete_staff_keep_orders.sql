-- Migration: Cho phép xóa nhân viên mà vẫn giữ hóa đơn
-- Thay đổi staff_id trong orders từ NOT NULL sang nullable và ON DELETE SET NULL

-- Bước 1: Xóa constraint foreign key cũ
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_staff_id_fkey;

-- Bước 2: Thay đổi staff_id từ NOT NULL sang NULL
ALTER TABLE orders 
  ALTER COLUMN staff_id DROP NOT NULL;

-- Bước 3: Tạo lại foreign key constraint với ON DELETE SET NULL
ALTER TABLE orders
  ADD CONSTRAINT orders_staff_id_fkey 
  FOREIGN KEY (staff_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- Kiểm tra constraint đã được tạo
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
  AND conname = 'orders_staff_id_fkey';

