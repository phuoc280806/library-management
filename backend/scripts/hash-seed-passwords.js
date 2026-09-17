// Chạy 1 lần sau khi seed: thay hash placeholder bằng hash bcrypt thật của mật khẩu dev.
// Dùng:  node scripts/hash-seed-passwords.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const DEV_PASSWORD = '123456';
const SALT_ROUNDS = 10; // càng cao càng chậm (an toàn hơn), 10 là mức phổ biến

(async () => {
  // Mỗi lần hash cho ra chuỗi KHÁC nhau (có salt ngẫu nhiên) nhưng compare vẫn đúng
  const hash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);

  const [result] = await pool.query(
    `UPDATE users SET password_hash = ? WHERE password_hash LIKE '$2b$10$PLACEHOLDER%'`,
    [hash]
  );
  console.log(`Đã cập nhật ${result.affectedRows} tài khoản, mật khẩu dev = "${DEV_PASSWORD}"`);
  console.log('Hash mẫu:', hash);
  await pool.end();
})();
