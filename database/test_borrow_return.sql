-- =====================================================================
-- test_borrow_return.sql — Diễn tập quy trình MƯỢN → TRẢ → PHẠT bằng SQL
--
-- Mục đích:
--   Kiểm chứng database đủ để chạy nghiệp vụ chính trước khi viết backend.
--   Mỗi bước dưới đây chính là 1 câu lệnh backend sẽ gọi ở Milestone 6–7.
--
-- Cách dùng: chạy seed.sql trước, rồi chạy file này TỪNG KHỐI một
--            (bôi đen khối → Ctrl+Enter) và đọc kết quả.
-- Chạy lại seed.sql để reset dữ liệu bất kỳ lúc nào.
--
-- Kịch bản:
--   Ngày 2026-09-15, bạn đọc Lê Minh An (reader_id = 1, đang mượn 2 cuốn)
--   muốn mượn thêm "Số đỏ" (copy SD-001). Sau đó trả trễ 4 ngày.
-- =====================================================================

USE library_management;

-- =====================================================================
-- PHẦN A — MƯỢN SÁCH
-- =====================================================================

-- A1. Lấy quy định đang có hiệu lực tại ngày mượn
--     (backend làm bước này đầu tiên, KHÔNG hard-code 5 cuốn / 14 ngày)
SET @today := DATE('2026-09-15');

SELECT regulation_id, max_books, borrow_days, fine_per_day
FROM regulations
WHERE effective_from <= @today
  AND (effective_to IS NULL OR effective_to >= @today)
ORDER BY effective_from DESC
LIMIT 1;
-- Kỳ vọng: regulation_id = 1, max_books = 5, borrow_days = 14, fine_per_day = 2000

-- Lưu vào biến để dùng tiếp
SELECT max_books, borrow_days, fine_per_day
INTO @max_books, @borrow_days, @fine_per_day
FROM regulations
WHERE effective_from <= @today
  AND (effective_to IS NULL OR effective_to >= @today)
ORDER BY effective_from DESC
LIMIT 1;

-- A2. Kiểm tra bạn đọc có bị khóa không
SET @reader_id := 1;

SELECT r.reader_id, u.full_name, u.status AS user_status
FROM readers r
JOIN users u ON u.user_id = r.user_id
WHERE r.reader_id = @reader_id;
-- Kỳ vọng: user_status = 1 (đang hoạt động). Nếu = 0 → từ chối mượn.

-- A3. Đếm số sách bạn đọc ĐANG GIỮ (chưa trả) — so với max_books
SELECT COUNT(*) AS books_holding
INTO @books_holding
FROM borrow_details bd
JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
WHERE bt.reader_id = @reader_id
  AND bd.status = 'BORROWED';

SELECT @books_holding AS books_holding, @max_books AS max_books,
       IF(@books_holding < @max_books, 'ĐƯỢC MƯỢN THÊM', 'ĐÃ ĐẠT GIỚI HẠN') AS verdict;
-- Kỳ vọng: 2 < 5 → ĐƯỢC MƯỢN THÊM

-- A4. Kiểm tra bản sao muốn mượn có sẵn không
SET @copy_code := 'SD-001';

SELECT bc.copy_id, bc.copy_code, bc.status, b.title
FROM book_copies bc
JOIN books b ON b.book_id = bc.book_id
WHERE bc.copy_code = @copy_code;
-- Kỳ vọng: status = AVAILABLE. Nếu BORROWED/LOST/DAMAGED → từ chối.

SELECT copy_id INTO @copy_id
FROM book_copies
WHERE copy_code = @copy_code AND status = 'AVAILABLE';

-- A5. LẬP PHIẾU MƯỢN — 3 lệnh ghi phải cùng thành công hoặc cùng thất bại
--     → dùng TRANSACTION. Đây là lý do backend sẽ bọc đoạn này trong
--       connection.beginTransaction() / commit() / rollback().
START TRANSACTION;

  -- (1) tạo phiếu, hạn trả = ngày mượn + borrow_days
  INSERT INTO borrow_tickets (reader_id, librarian_id, borrow_date, due_date, status)
  VALUES (@reader_id, 2, @today, DATE_ADD(@today, INTERVAL @borrow_days DAY), 'BORROWING');

  SET @borrow_id := LAST_INSERT_ID();

  -- (2) thêm chi tiết: cuốn nào nằm trong phiếu
  INSERT INTO borrow_details (borrow_id, copy_id, status)
  VALUES (@borrow_id, @copy_id, 'BORROWED');

  -- (3) đánh dấu bản sao đã có người mượn
  UPDATE book_copies SET status = 'BORROWED' WHERE copy_id = @copy_id;

COMMIT;

-- A6. Xem lại phiếu vừa lập
SELECT bt.borrow_id, u.full_name AS reader, bt.borrow_date, bt.due_date, bt.status,
       bc.copy_code, b.title, bd.status AS detail_status
FROM borrow_tickets bt
JOIN readers r         ON r.reader_id = bt.reader_id
JOIN users u           ON u.user_id = r.user_id
JOIN borrow_details bd ON bd.borrow_id = bt.borrow_id
JOIN book_copies bc    ON bc.copy_id = bd.copy_id
JOIN books b           ON b.book_id = bc.book_id
WHERE bt.borrow_id = @borrow_id;
-- Kỳ vọng: borrow_id = 6, due_date = 2026-09-29, SD-001 / Số đỏ / BORROWED

-- A7. Thử mượn lại đúng cuốn đó → phải bị chặn
SELECT copy_id, copy_code, status
FROM book_copies
WHERE copy_code = 'SD-001';
-- Kỳ vọng: status = BORROWED → A4 sẽ trả về 0 dòng → backend trả lỗi 400.


-- =====================================================================
-- PHẦN B — TRẢ SÁCH (trễ 4 ngày)
-- =====================================================================

-- Giả lập: hôm nay là 2026-10-03, hạn trả là 2026-09-29 → trễ 4 ngày
SET @return_at := TIMESTAMP('2026-10-03 10:00:00');

-- B1. Tìm dòng chi tiết đang mượn của bản sao này
SELECT bd.borrow_detail_id, bt.due_date
INTO @detail_id, @due_date
FROM borrow_details bd
JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
WHERE bd.copy_id = @copy_id
  AND bd.status = 'BORROWED';

-- B2. Tính số ngày trễ (không âm) và tiền phạt
--     DATEDIFF dùng phần ngày, nên ép return_at về DATE để so với due_date (kiểu date)
SET @late_days := GREATEST(DATEDIFF(DATE(@return_at), @due_date), 0);
SET @amount    := @late_days * @fine_per_day;

SELECT @due_date AS due_date, DATE(@return_at) AS return_date,
       @late_days AS late_days, @fine_per_day AS fine_per_day, @amount AS amount;
-- Kỳ vọng: late_days = 4, amount = 8000

-- B3. GHI NHẬN TRẢ SÁCH — cũng là 1 transaction
START TRANSACTION;

  -- (1) đóng dòng chi tiết
  UPDATE borrow_details
  SET return_date = @return_at, status = 'RETURNED'
  WHERE borrow_detail_id = @detail_id;

  -- (2) trả bản sao về kệ
  UPDATE book_copies SET status = 'AVAILABLE' WHERE copy_id = @copy_id;

  -- (3) nếu trễ → tạo khoản phạt (1 borrow_detail chỉ có tối đa 1 fine — UNIQUE)
  INSERT INTO fines (borrow_detail_id, late_days, amount, reason, status)
  SELECT @detail_id, @late_days, @amount,
         CONCAT('Trả sách trễ ', @late_days, ' ngày'), 'UNPAID'
  WHERE @late_days > 0;

  -- (4) nếu mọi cuốn trong phiếu đã trả → phiếu COMPLETED
  UPDATE borrow_tickets
  SET status = 'COMPLETED'
  WHERE borrow_id = @borrow_id
    AND NOT EXISTS (
      SELECT 1 FROM borrow_details
      WHERE borrow_id = @borrow_id AND status = 'BORROWED'
    );

COMMIT;

-- B4. Xem kết quả trả + phạt
SELECT bt.borrow_id, bt.status AS ticket_status,
       bc.copy_code, bd.return_date, bd.status AS detail_status,
       f.late_days, f.amount, f.status AS fine_status
FROM borrow_tickets bt
JOIN borrow_details bd ON bd.borrow_id = bt.borrow_id
JOIN book_copies bc    ON bc.copy_id = bd.copy_id
LEFT JOIN fines f      ON f.borrow_detail_id = bd.borrow_detail_id
WHERE bt.borrow_id = @borrow_id;
-- Kỳ vọng: ticket COMPLETED, detail RETURNED, late_days 4, amount 8000, UNPAID


-- =====================================================================
-- PHẦN C — THU TIỀN PHẠT
-- =====================================================================

UPDATE fines
SET status = 'PAID', paid_at = NOW()
WHERE borrow_detail_id = @detail_id AND status = 'UNPAID';

SELECT * FROM fines WHERE borrow_detail_id = @detail_id;
-- Kỳ vọng: status = PAID, paid_at có giá trị


-- =====================================================================
-- PHẦN D — CÁC TRUY VẤN BÁO CÁO HAY DÙNG
-- =====================================================================

-- D1. Danh sách sách QUÁ HẠN chưa trả (tính từ due_date, không phụ thuộc cột status)
--     → đây là cách nên dùng thay vì tin vào status = 'OVERDUE'
SELECT u.full_name, r.reader_code, bc.copy_code, b.title,
       bt.due_date, DATEDIFF(CURDATE(), bt.due_date) AS days_overdue
FROM borrow_details bd
JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
JOIN readers r         ON r.reader_id = bt.reader_id
JOIN users u           ON u.user_id = r.user_id
JOIN book_copies bc    ON bc.copy_id = bd.copy_id
JOIN books b           ON b.book_id = bc.book_id
WHERE bd.status = 'BORROWED'
  AND bt.due_date < CURDATE()
ORDER BY days_overdue DESC;

-- D2. Sách đang mượn của một bạn đọc (màn hình "Sách đang mượn")
SELECT b.title, bc.copy_code, bt.borrow_date, bt.due_date
FROM borrow_details bd
JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
JOIN book_copies bc    ON bc.copy_id = bd.copy_id
JOIN books b           ON b.book_id = bc.book_id
WHERE bt.reader_id = 1 AND bd.status = 'BORROWED';

-- D3. Tổng tiền phạt chưa thu theo bạn đọc
SELECT u.full_name, r.reader_code, SUM(f.amount) AS unpaid_total
FROM fines f
JOIN borrow_details bd ON bd.borrow_detail_id = f.borrow_detail_id
JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
JOIN readers r         ON r.reader_id = bt.reader_id
JOIN users u           ON u.user_id = r.user_id
WHERE f.status = 'UNPAID'
GROUP BY u.full_name, r.reader_code;

-- D4. Tra cứu sách: mỗi đầu sách còn bao nhiêu bản có thể mượn
SELECT b.book_id, b.title, b.author, c.category_name,
       COUNT(bc.copy_id)                                   AS total_copies,
       SUM(bc.status = 'AVAILABLE')                        AS available_copies
FROM books b
JOIN categories c        ON c.category_id = b.category_id
LEFT JOIN book_copies bc ON bc.book_id = b.book_id
WHERE b.title LIKE '%Toán%'
GROUP BY b.book_id, b.title, b.author, c.category_name;
