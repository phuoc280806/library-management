const pool = require('../config/db');

const SELECT_FINES = `
  SELECT f.fine_id, f.late_days, f.amount, f.reason, f.status, f.paid_at,
         bt.borrow_id, r.reader_id, r.reader_code, u.full_name, bc.copy_code, b.title
  FROM fines f
  JOIN borrow_details bd ON bd.borrow_detail_id = f.borrow_detail_id
  JOIN borrow_tickets bt ON bt.borrow_id = bd.borrow_id
  JOIN readers r         ON r.reader_id = bt.reader_id
  JOIN users u           ON u.user_id = r.user_id
  JOIN book_copies bc    ON bc.copy_id = bd.copy_id
  JOIN books b           ON b.book_id = bc.book_id
`;

// Lọc tuỳ chọn theo status (UNPAID/PAID) và reader_id. Ghép WHERE động nhưng vẫn dùng ?
async function findAll({ status, reader_id } = {}, conn = pool) {
  const where = [];
  const params = [];
  if (status) { where.push('f.status = ?'); params.push(status); }
  if (reader_id) { where.push('r.reader_id = ?'); params.push(reader_id); }

  const sql = `${SELECT_FINES} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY f.fine_id DESC`;
  const [rows] = await conn.query(sql, params);
  return rows;
}

async function findById(fineId, conn = pool) {
  const [rows] = await conn.query(`${SELECT_FINES} WHERE f.fine_id = ?`, [fineId]);
  return rows[0] || null;
}

// Phần C. Chỉ chuyển UNPAID -> PAID. affectedRows = 0 nghĩa là đã trả rồi (hoặc không tồn tại)
async function markPaid(fineId, conn = pool) {
  const [result] = await conn.query(
    `UPDATE fines SET status = 'PAID', paid_at = NOW() WHERE fine_id = ? AND status = 'UNPAID'`,
    [fineId]
  );
  return result.affectedRows;
}

module.exports = { findAll, findById, markPaid };
