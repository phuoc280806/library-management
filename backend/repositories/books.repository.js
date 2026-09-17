// Tầng repository: CHỈ chứa SQL. Không biết gì về req/res hay quy tắc nghiệp vụ.
// Nhận tham số thuần, trả về dữ liệu thuần (mảng/object/null).
const pool = require('../config/db');

// Mỗi cuốn sách kèm số bản sao còn mượn được
// (bảng books không có cột available, phải đếm từ book_copies)
const SELECT_BOOKS = `
  SELECT b.book_id, b.isbn, b.title, b.author, b.publisher, b.publish_year,
         b.category_id,
         COUNT(CASE WHEN c.status = 'AVAILABLE' THEN 1 END) AS available
  FROM books b
  LEFT JOIN book_copies c ON c.book_id = b.book_id
`;

async function findAll(keyword = '') {
  const [rows] = await pool.query(
    `${SELECT_BOOKS} WHERE b.title LIKE ? GROUP BY b.book_id ORDER BY b.title`,
    [`%${keyword}%`]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `${SELECT_BOOKS} WHERE b.book_id = ? GROUP BY b.book_id`,
    [id]
  );
  return rows[0] || null; // không có thì trả null, để service quyết định ném lỗi gì
}

async function create({ isbn, title, author, publisher, publish_year, category_id }) {
  const [result] = await pool.query(
    `INSERT INTO books (isbn, title, author, publisher, publish_year, category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [isbn || null, title, author || null, publisher || null, publish_year || null, category_id]
  );
  return result.insertId;
}

async function update(id, { isbn, title, author, publisher, publish_year, category_id }) {
  await pool.query(
    `UPDATE books
     SET isbn = ?, title = ?, author = ?, publisher = ?, publish_year = ?, category_id = ?
     WHERE book_id = ?`,
    [isbn || null, title, author || null, publisher || null, publish_year || null, category_id, id]
  );
}

// Số bản sao đang có người mượn -> quyết định có được xoá không
async function countBorrowedCopies(id) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS n FROM book_copies WHERE book_id = ? AND status = 'BORROWED'`,
    [id]
  );
  return rows[0].n;
}

// Bản sao đã từng nằm trong phiếu mượn (lịch sử) -> không xoá vật lý được vì khoá ngoại
async function countCopiesWithHistory(id) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS n
     FROM borrow_details bd
     JOIN book_copies bc ON bc.copy_id = bd.copy_id
     WHERE bc.book_id = ?`,
    [id]
  );
  return rows[0].n;
}

// Xoá bản sao trước, rồi xoá sách (khoá ngoại book_copies -> books)
async function remove(id) {
  await pool.query(`DELETE FROM book_copies WHERE book_id = ?`, [id]);
  const [result] = await pool.query(`DELETE FROM books WHERE book_id = ?`, [id]);
  return result.affectedRows;
}

module.exports = { findAll, findById, create, update, countBorrowedCopies, countCopiesWithHistory, remove };
