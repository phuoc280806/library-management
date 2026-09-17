-- =====================================================================
-- seed.sql — Dữ liệu mẫu cho database library_management
--
-- Mục đích:
--   Nạp một bộ dữ liệu nhỏ nhưng đủ các tình huống nghiệp vụ
--   (đang mượn, quá hạn, đã trả đúng hạn, đã trả trễ + tiền phạt)
--   để Milestone 3 có dữ liệu test API ngay.
--
-- Cách chạy (Workbench): mở file → chọn database library_management → Ctrl+Shift+Enter
-- Cách chạy (CLI):
--   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p library_management < database\seed.sql
--
-- Lưu ý:
--   - File này XÓA TOÀN BỘ dữ liệu cũ rồi nạp lại (chạy lại bao nhiêu lần cũng được).
--   - password_hash là giá trị tạm. Milestone 4 sẽ thay bằng bcrypt thật
--     (mật khẩu dự kiến cho mọi tài khoản mẫu: 123456).
--   - Mốc thời gian mẫu lấy "hôm nay" = 2026-09-15.
-- =====================================================================

USE library_management;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa theo thứ tự ngược chiều phụ thuộc (bảng con trước, bảng cha sau)
TRUNCATE TABLE fines;
TRUNCATE TABLE borrow_details;
TRUNCATE TABLE borrow_tickets;
TRUNCATE TABLE regulations;
TRUNCATE TABLE book_copies;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
TRUNCATE TABLE readers;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. ROLES
-- ---------------------------------------------------------------------
INSERT INTO roles (role_id, role_name) VALUES
  (1, 'READER'),
  (2, 'LIBRARIAN'),
  (3, 'ADMIN');

-- ---------------------------------------------------------------------
-- 2. USERS
--    status: 1 = đang hoạt động, 0 = bị khóa
-- ---------------------------------------------------------------------
-- bcrypt hash của mật khẩu dev "123456" (tạo bằng backend/scripts/hash-seed-passwords.js)
SET @pw := '$2b$10$zVoyL9Shfn40LdnsKxKz0OONN0EFkMEIlL7HHTUCkVjCLn3r0CWIe';

INSERT INTO users (user_id, username, password_hash, full_name, email, phone, role_id, status) VALUES
  -- Quản trị viên
  (1, 'admin',      @pw, 'Nguyễn Văn Quản',   'admin@thpt.edu.vn',      '0900000001', 3, 1),
  -- Thủ thư
  (2, 'thuthu01',   @pw, 'Trần Thị Thư',      'thuthu01@thpt.edu.vn',   '0900000002', 2, 1),
  -- Bạn đọc: học sinh
  (3, 'hs10a1_001', @pw, 'Lê Minh An',        'an.le@student.thpt.edu.vn',   '0911000001', 1, 1),
  (4, 'hs10a1_002', @pw, 'Phạm Thu Hà',       'ha.pham@student.thpt.edu.vn', '0911000002', 1, 1),
  (5, 'hs11b2_001', @pw, 'Võ Quốc Bảo',       'bao.vo@student.thpt.edu.vn',  '0911000003', 1, 1),
  (6, 'hs12c3_001', @pw, 'Đặng Ngọc Linh',    'linh.dang@student.thpt.edu.vn','0911000004', 1, 0), -- bị khóa
  -- Bạn đọc: giáo viên
  (7, 'gv_toan01',  @pw, 'Hoàng Văn Toán',    'toan.hoang@thpt.edu.vn', '0922000001', 1, 1),
  (8, 'gv_van01',   @pw, 'Bùi Thị Văn',       'van.bui@thpt.edu.vn',    '0922000002', 1, 1);

-- ---------------------------------------------------------------------
-- 3. READERS (1:1 với USERS có role READER)
-- ---------------------------------------------------------------------
INSERT INTO readers (reader_id, user_id, reader_code, reader_type, class_name, date_of_birth) VALUES
  (1, 3, 'HS2024001', 'STUDENT', '10A1', '2009-03-12'),
  (2, 4, 'HS2024002', 'STUDENT', '10A1', '2009-07-25'),
  (3, 5, 'HS2023001', 'STUDENT', '11B2', '2008-11-02'),
  (4, 6, 'HS2022001', 'STUDENT', '12C3', '2007-01-18'),
  (5, 7, 'GV0001',    'TEACHER', NULL,   '1985-05-30'),
  (6, 8, 'GV0002',    'TEACHER', NULL,   '1990-09-09');

-- ---------------------------------------------------------------------
-- 4. CATEGORIES
-- ---------------------------------------------------------------------
INSERT INTO categories (category_id, category_name, description) VALUES
  (1, 'Sách giáo khoa', 'Sách giáo khoa theo chương trình THPT'),
  (2, 'Văn học',        'Tiểu thuyết, truyện ngắn, thơ'),
  (3, 'Khoa học',       'Sách phổ biến khoa học'),
  (4, 'Tham khảo',      'Sách bài tập, ôn thi, nâng cao');

-- ---------------------------------------------------------------------
-- 5. BOOKS (đầu sách)
-- ---------------------------------------------------------------------
INSERT INTO books (book_id, isbn, title, author, publisher, publish_year, category_id, description) VALUES
  (1, '9786040000011', 'Ngữ văn 10',                'Bộ GD&ĐT',        'NXB Giáo dục',   2023, 1, 'Sách giáo khoa Ngữ văn lớp 10'),
  (2, '9786040000028', 'Toán 10',                   'Bộ GD&ĐT',        'NXB Giáo dục',   2023, 1, 'Sách giáo khoa Toán lớp 10'),
  (3, '9786040000035', 'Vật lí 11',                 'Bộ GD&ĐT',        'NXB Giáo dục',   2023, 1, 'Sách giáo khoa Vật lí lớp 11'),
  (4, '9786041000042', 'Dế Mèn phiêu lưu ký',       'Tô Hoài',         'NXB Kim Đồng',   2019, 2, 'Truyện thiếu nhi kinh điển'),
  (5, '9786041000059', 'Số đỏ',                     'Vũ Trọng Phụng',  'NXB Văn học',    2020, 2, 'Tiểu thuyết trào phúng'),
  (6, '9786041000066', 'Lược sử thời gian',         'Stephen Hawking', 'NXB Trẻ',        2018, 3, 'Phổ biến khoa học về vũ trụ'),
  (7, '9786041000073', 'Vật lý vui',                'Ya. Perelman',    'NXB Trẻ',        2015, 3, 'Thí nghiệm vật lý thú vị'),
  (8, '9786041000080', 'Ôn thi THPT Quốc gia Toán', 'Nhiều tác giả',   'NXB ĐHQG Hà Nội',2024, 4, 'Bộ đề luyện thi');

-- ---------------------------------------------------------------------
-- 6. BOOK_COPIES (bản sao vật lý)
--    status phải khớp với dữ liệu mượn ở mục 8–9 bên dưới.
-- ---------------------------------------------------------------------
INSERT INTO book_copies (copy_id, book_id, copy_code, status, location) VALUES
  ( 1, 1, 'NV10-001', 'AVAILABLE', 'Kệ A1'),
  ( 2, 1, 'NV10-002', 'BORROWED',  'Kệ A1'),   -- phiếu #1 (đang mượn, còn hạn)
  ( 3, 2, 'T10-001',  'BORROWED',  'Kệ A1'),   -- phiếu #1
  ( 4, 2, 'T10-002',  'AVAILABLE', 'Kệ A1'),
  ( 5, 3, 'VL11-001', 'AVAILABLE', 'Kệ A2'),
  ( 6, 4, 'DM-001',   'AVAILABLE', 'Kệ B1'),
  ( 7, 4, 'DM-002',   'BORROWED',  'Kệ B1'),   -- phiếu #2 (quá hạn, chưa trả)
  ( 8, 4, 'DM-003',   'DAMAGED',   'Kho'),
  ( 9, 5, 'SD-001',   'AVAILABLE', 'Kệ B1'),
  (10, 6, 'LSTG-001', 'AVAILABLE', 'Kệ C1'),   -- phiếu #3 đã trả đúng hạn
  (11, 7, 'VL-001',   'AVAILABLE', 'Kệ C1'),   -- phiếu #4 đã trả trễ, phạt đã thu
  (12, 7, 'VL-002',   'LOST',      NULL),
  (13, 8, 'OT-001',   'AVAILABLE', 'Kệ D1'),   -- phiếu #5 đã trả trễ, phạt chưa thu
  (14, 8, 'OT-002',   'AVAILABLE', 'Kệ D1');

-- ---------------------------------------------------------------------
-- 7. REGULATIONS (quy định theo chu kỳ)
-- ---------------------------------------------------------------------
INSERT INTO regulations (regulation_id, max_books, borrow_days, fine_per_day, updated_by, effective_from, effective_to) VALUES
  (1, 5, 14, 2000.00, 1, '2026-09-15', '2026-12-31'),
  (2, 7, 21, 3000.00, 1, '2027-01-01', NULL);

-- ---------------------------------------------------------------------
-- 8. BORROW_TICKETS (phiếu mượn)
--    Quy định áp dụng: 14 ngày, 2.000đ/ngày trễ.
-- ---------------------------------------------------------------------
INSERT INTO borrow_tickets (borrow_id, reader_id, librarian_id, borrow_date, due_date, status) VALUES
  -- #1: Lê Minh An mượn 2 cuốn, còn hạn
  (1, 1, 2, '2026-09-10 08:30:00', '2026-09-24', 'BORROWING'),
  -- #2: Phạm Thu Hà mượn 1 cuốn, đã quá hạn (hôm nay 15/09, hạn 08/09)
  (2, 2, 2, '2026-08-25 09:00:00', '2026-09-08', 'OVERDUE'),
  -- #3: Võ Quốc Bảo mượn 1 cuốn, trả đúng hạn
  (3, 3, 2, '2026-08-20 10:15:00', '2026-09-03', 'COMPLETED'),
  -- #4: Hoàng Văn Toán (GV) mượn 1 cuốn, trả trễ 3 ngày, đã nộp phạt
  (4, 5, 2, '2026-08-15 14:00:00', '2026-08-29', 'COMPLETED'),
  -- #5: Bùi Thị Văn (GV) mượn 1 cuốn, trả trễ 5 ngày, CHƯA nộp phạt
  (5, 6, 2, '2026-08-18 15:30:00', '2026-09-01', 'COMPLETED');

-- ---------------------------------------------------------------------
-- 9. BORROW_DETAILS (từng cuốn trong phiếu)
-- ---------------------------------------------------------------------
INSERT INTO borrow_details (borrow_detail_id, borrow_id, copy_id, return_date, status) VALUES
  (1, 1,  2, NULL,                  'BORROWED'),
  (2, 1,  3, NULL,                  'BORROWED'),
  (3, 2,  7, NULL,                  'BORROWED'),
  (4, 3, 10, '2026-09-02 16:00:00', 'RETURNED'),
  (5, 4, 11, '2026-09-01 09:20:00', 'RETURNED'),   -- hạn 29/08 → trễ 3 ngày
  (6, 5, 13, '2026-09-06 11:45:00', 'RETURNED');   -- hạn 01/09 → trễ 5 ngày

-- ---------------------------------------------------------------------
-- 10. FINES (tiền phạt = số ngày trễ × 2.000)
-- ---------------------------------------------------------------------
INSERT INTO fines (fine_id, borrow_detail_id, late_days, amount, reason, status, paid_at) VALUES
  (1, 5, 3,  6000.00, 'Trả sách trễ 3 ngày', 'PAID',   '2026-09-01 09:25:00'),
  (2, 6, 5, 10000.00, 'Trả sách trễ 5 ngày', 'UNPAID', NULL);

-- ---------------------------------------------------------------------
-- Kiểm tra nhanh sau khi nạp
-- ---------------------------------------------------------------------
SELECT 'roles'          AS table_name, COUNT(*) AS rows_count FROM roles
UNION ALL SELECT 'users',          COUNT(*) FROM users
UNION ALL SELECT 'readers',        COUNT(*) FROM readers
UNION ALL SELECT 'categories',     COUNT(*) FROM categories
UNION ALL SELECT 'books',          COUNT(*) FROM books
UNION ALL SELECT 'book_copies',    COUNT(*) FROM book_copies
UNION ALL SELECT 'regulations',    COUNT(*) FROM regulations
UNION ALL SELECT 'borrow_tickets', COUNT(*) FROM borrow_tickets
UNION ALL SELECT 'borrow_details', COUNT(*) FROM borrow_details
UNION ALL SELECT 'fines',          COUNT(*) FROM fines;
