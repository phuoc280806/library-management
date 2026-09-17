// Tầng repository cho mượn/trả. Mỗi hàm = 1 khối trong database/test_borrow_return.sql
//
// Tham số `conn` (mặc định = pool): hàm chạy được cả ngoài lẫn trong transaction.
// Trong transaction, service truyền connection đang mở vào để mọi lệnh cùng 1 phiên.
const pool = require('../config/db');

// A1. Quy định có hiệu lực tại một ngày (không hard-code 5 cuốn / 14 ngày)
async function findEffectiveRegulation(date, conn = pool) {
  const [rows] = await conn.query(
    `SELECT regulation_id, max_books, borrow_days, fine_per_day
     FROM regulations
     WHERE effective_from <= ? AND (effective_to IS NULL OR effective_to >= ?)
     ORDER BY effective_from DESC
     LIMIT 1`,
    [date, date]
  );
  return rows[0] || null;
}

// A2. Bạn đọc + trạng thái tài khoản
async function findReader(readerId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT r.reader_id, r.reader_code, u.full_name, u.status AS user_status
     FROM readers r
     JOIN users u ON u.user_id = r.user_id
     WHERE r.reader_id = ?`,
    [readerId]
  );
  return rows[0] || null;
}

// reader_id của một tài khoản (null nếu tài khoản không phải bạn đọc)
async function findReaderIdByUserId(userId, conn = pool) {
  const [rows] = await conn.query(`SELECT reader_id FROM readers WHERE user_id = ?`, [userId]);
  return rows[0] ? rows[0].reader_id : null;
}

// A3. Số sách bạn đọc đang giữ (chưa trả)
async function countHolding(readerId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS holding
     FROM borrow_details bd
     JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
     WHERE bt.reader_id = ? AND bd.status = 'BORROWED'`,
    [readerId]
  );
  return rows[0].holding;
}

// A4. Bản sao theo mã. FOR UPDATE = khoá dòng này tới khi transaction kết thúc,
//     để 2 thủ thư không thể cùng lúc cho mượn 1 cuốn.
async function findCopyForUpdate(copyCode, conn) {
  const [rows] = await conn.query(
    `SELECT bc.copy_id, bc.copy_code, bc.status, b.title
     FROM book_copies bc
     JOIN books b ON b.book_id = bc.book_id
     WHERE bc.copy_code = ?
     FOR UPDATE`,
    [copyCode]
  );
  return rows[0] || null;
}

// A5 (1). Tạo phiếu, hạn trả = hôm nay + borrow_days
async function createTicket({ readerId, librarianId, borrowDays }, conn) {
  const [result] = await conn.query(
    `INSERT INTO borrow_tickets (reader_id, librarian_id, borrow_date, due_date, status)
     VALUES (?, ?, NOW(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'BORROWING')`,
    [readerId, librarianId, borrowDays]
  );
  return result.insertId;
}

// A5 (2). Cuốn nào nằm trong phiếu
async function createDetail(borrowId, copyId, conn) {
  await conn.query(
    `INSERT INTO borrow_details (borrow_id, copy_id, status) VALUES (?, ?, 'BORROWED')`,
    [borrowId, copyId]
  );
}

// A5 (3) & B3 (2). Đổi trạng thái bản sao
async function updateCopyStatus(copyId, status, conn) {
  await conn.query(`UPDATE book_copies SET status = ? WHERE copy_id = ?`, [status, copyId]);
}

// A6 / B4. Xem phiếu đầy đủ: 1 dòng cho mỗi cuốn trong phiếu
async function findTicketById(borrowId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT bt.borrow_id, bt.reader_id, u.full_name AS reader, bt.borrow_date, bt.due_date,
            bt.status AS ticket_status,
            bd.borrow_detail_id, bc.copy_code, b.title, bd.status AS detail_status, bd.return_date,
            f.late_days, f.amount AS fine_amount, f.status AS fine_status
     FROM borrow_tickets bt
     JOIN readers r         ON r.reader_id = bt.reader_id
     JOIN users u           ON u.user_id = r.user_id
     JOIN borrow_details bd ON bd.borrow_id = bt.borrow_id
     JOIN book_copies bc    ON bc.copy_id = bd.copy_id
     JOIN books b           ON b.book_id = bc.book_id
     LEFT JOIN fines f      ON f.borrow_detail_id = bd.borrow_detail_id
     WHERE bt.borrow_id = ?`,
    [borrowId]
  );
  return rows;
}

// D1. Sách quá hạn chưa trả — tính từ due_date, KHÔNG tin cột status = 'OVERDUE'
async function findOverdue(conn = pool) {
  const [rows] = await conn.query(
    `SELECT bt.borrow_id, r.reader_id, r.reader_code, u.full_name, bc.copy_code, b.title,
            bt.due_date, DATEDIFF(CURDATE(), bt.due_date) AS days_overdue
     FROM borrow_details bd
     JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
     JOIN readers r         ON r.reader_id = bt.reader_id
     JOIN users u           ON u.user_id = r.user_id
     JOIN book_copies bc    ON bc.copy_id = bd.copy_id
     JOIN books b           ON b.book_id = bc.book_id
     WHERE bd.status = 'BORROWED' AND bt.due_date < CURDATE()
     ORDER BY days_overdue DESC`
  );
  return rows;
}

// D2. Sách đang mượn của một bạn đọc
async function findBorrowingByReader(readerId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT bt.borrow_id, bd.borrow_detail_id, bc.copy_code, b.title, bt.borrow_date, bt.due_date,
            GREATEST(DATEDIFF(CURDATE(), bt.due_date), 0) AS days_overdue
     FROM borrow_details bd
     JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
     JOIN book_copies bc    ON bc.copy_id = bd.copy_id
     JOIN books b           ON b.book_id = bc.book_id
     WHERE bt.reader_id = ? AND bd.status = 'BORROWED'
     ORDER BY bt.due_date`,
    [readerId]
  );
  return rows;
}

// B1 + B2. Dòng chi tiết đang mượn của bản sao, kèm số ngày trễ tính sẵn bằng SQL
//          (DATEDIFF trong MySQL tránh rắc rối múi giờ khi tính bằng JS)
async function findActiveDetailByCopyCode(copyCode, conn) {
  const [rows] = await conn.query(
    `SELECT bd.borrow_detail_id, bd.copy_id, bt.borrow_id, bt.borrow_date, bt.due_date,
            GREATEST(DATEDIFF(CURDATE(), bt.due_date), 0) AS late_days
     FROM borrow_details bd
     JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
     JOIN book_copies bc    ON bc.copy_id = bd.copy_id
     WHERE bc.copy_code = ? AND bd.status = 'BORROWED'
     FOR UPDATE`,
    [copyCode]
  );
  return rows[0] || null;
}

// B3 (1). Đóng dòng chi tiết
async function closeDetail(detailId, conn) {
  await conn.query(
    `UPDATE borrow_details SET return_date = NOW(), status = 'RETURNED' WHERE borrow_detail_id = ?`,
    [detailId]
  );
}

// B3 (3). Tạo khoản phạt
async function createFine({ detailId, lateDays, amount }, conn) {
  await conn.query(
    `INSERT INTO fines (borrow_detail_id, late_days, amount, reason, status)
     VALUES (?, ?, ?, ?, 'UNPAID')`,
    [detailId, lateDays, amount, `Trả sách trễ ${lateDays} ngày`]
  );
}

// B3 (4). Mọi cuốn trong phiếu đã trả -> phiếu COMPLETED
async function completeTicketIfDone(borrowId, conn) {
  await conn.query(
    `UPDATE borrow_tickets SET status = 'COMPLETED'
     WHERE borrow_id = ?
       AND NOT EXISTS (SELECT 1 FROM borrow_details WHERE borrow_id = ? AND status = 'BORROWED')`,
    [borrowId, borrowId]
  );
}

module.exports = {
  findEffectiveRegulation,
  findReader,
  findReaderIdByUserId,
  countHolding,
  findCopyForUpdate,
  createTicket,
  createDetail,
  updateCopyStatus,
  findTicketById,
  findOverdue,
  findBorrowingByReader,
  findActiveDetailByCopyCode,
  closeDetail,
  createFine,
  completeTicketIfDone,
};
