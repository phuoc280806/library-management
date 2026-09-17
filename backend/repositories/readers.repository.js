const pool = require('../config/db');

const SELECT_READERS = `
  SELECT r.reader_id, r.reader_code, r.reader_type, r.class_name, r.date_of_birth,
         u.user_id, u.username, u.full_name, u.email, u.phone, u.status
  FROM readers r
  JOIN users u ON u.user_id = r.user_id
`;

async function findAll(keyword = '', conn = pool) {
  const [rows] = await conn.query(
    `${SELECT_READERS} WHERE u.full_name LIKE ? OR r.reader_code LIKE ? ORDER BY r.reader_id`,
    [`%${keyword}%`, `%${keyword}%`]
  );
  return rows;
}

async function findById(readerId, conn = pool) {
  const [rows] = await conn.query(`${SELECT_READERS} WHERE r.reader_id = ?`, [readerId]);
  return rows[0] || null;
}

async function existsUsername(username, conn = pool) {
  const [rows] = await conn.query(`SELECT 1 FROM users WHERE username = ?`, [username]);
  return rows.length > 0;
}

async function existsReaderCode(readerCode, conn = pool) {
  const [rows] = await conn.query(`SELECT 1 FROM readers WHERE reader_code = ?`, [readerCode]);
  return rows.length > 0;
}

// Tạo bạn đọc = 2 INSERT (users rồi readers) -> service bọc trong transaction
async function createUser({ username, password_hash, full_name, email, phone }, conn) {
  const [result] = await conn.query(
    `INSERT INTO users (username, password_hash, full_name, email, phone, role_id, status)
     SELECT ?, ?, ?, ?, ?, role_id, 1 FROM roles WHERE role_name = 'READER'`,
    [username, password_hash, full_name, email || null, phone || null]
  );
  return result.insertId;
}

async function createReader({ user_id, reader_code, reader_type, class_name, date_of_birth }, conn) {
  const [result] = await conn.query(
    `INSERT INTO readers (user_id, reader_code, reader_type, class_name, date_of_birth)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, reader_code, reader_type, class_name || null, date_of_birth || null]
  );
  return result.insertId;
}

// Sửa: thông tin nằm ở 2 bảng -> 2 UPDATE, cũng cần transaction
async function updateUser(userId, { full_name, email, phone, status }, conn) {
  await conn.query(
    `UPDATE users SET full_name = ?, email = ?, phone = ?, status = ? WHERE user_id = ?`,
    [full_name, email || null, phone || null, status, userId]
  );
}

async function updateReader(readerId, { reader_type, class_name, date_of_birth }, conn) {
  await conn.query(
    `UPDATE readers SET reader_type = ?, class_name = ?, date_of_birth = ? WHERE reader_id = ?`,
    [reader_type, class_name || null, date_of_birth || null, readerId]
  );
}

module.exports = {
  findAll,
  findById,
  existsUsername,
  existsReaderCode,
  createUser,
  createReader,
  updateUser,
  updateReader,
};
