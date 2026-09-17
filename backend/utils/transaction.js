const pool = require('../config/db');

// Khuôn mẫu transaction dùng chung cho mọi service:
//   1. mượn 1 connection riêng từ pool (transaction thì mọi lệnh PHẢI đi qua cùng 1 connection)
//   2. beginTransaction -> chạy work(conn) -> commit
//   3. có lỗi bất kỳ -> rollback: DB trở về y như trước khi bắt đầu
//   4. finally: luôn trả connection về pool, kể cả khi lỗi, nếu không pool sẽ cạn
async function runInTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err; // ném tiếp cho errorHandler
  } finally {
    conn.release();
  }
}

module.exports = runInTransaction;
