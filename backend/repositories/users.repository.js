const pool = require('../config/db');

// Dùng khi đăng nhập: cần password_hash để so sánh. KHÔNG trả hàm này ra ngoài API.
async function findByUsername(username, conn = pool) {
  const [rows] = await conn.query(
    `SELECT u.user_id, u.username, u.password_hash, u.full_name, u.status, r.role_name
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0] || null;
}

// Dùng cho profile: KHÔNG lấy password_hash. Kèm reader_id nếu là bạn đọc.
async function findById(userId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.status, r.role_name,
            rd.reader_id, rd.reader_code, rd.reader_type, rd.class_name
     FROM users u
     JOIN roles r ON r.role_id = u.role_id
     LEFT JOIN readers rd ON rd.user_id = u.user_id
     WHERE u.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = { findByUsername, findById };
