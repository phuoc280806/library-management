// Đọc file .env vào process.env (chỉ cần gọi 1 lần, ở file load sớm nhất)
require('dotenv').config();
const mysql = require('mysql2/promise'); // bản Promise để dùng async/await

// Pool = "tủ" chứa sẵn nhiều kết nối. Mỗi query mượn 1 kết nối, xong trả lại.
// Rẻ hơn nhiều so với mở/đóng kết nối mới cho từng request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // hết kết nối rảnh thì xếp hàng chờ, không báo lỗi
  connectionLimit: 10,
  charset: 'utf8mb4', // để tiếng Việt không bị lỗi font
  dateStrings: true, // DATE/DATETIME trả về chuỗi '2026-09-29' thay vì Date object bị lệch múi giờ
  // MySQL trên cloud (Aiven, PlanetScale...) bắt buộc mã hoá đường truyền.
  // Local không cần -> chỉ bật khi DB_SSL=true trong .env
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
