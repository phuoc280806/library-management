require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const readersRoutes = require('./routes/readers.routes');
const borrowsRoutes = require('./routes/borrows.routes');
const finesRoutes = require('./routes/fines.routes');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. Middleware chung: chạy cho MỌI request, theo thứ tự khai báo
app.use(cors()); // cho phép frontend (React ở cổng khác) gọi API. Trình duyệt chặn nếu thiếu.
app.use(express.json()); // đọc JSON trong body -> req.body
app.use(logger);

// 2. Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/readers', readersRoutes);
app.use('/api/borrows', borrowsRoutes);
app.use('/api/fines', finesRoutes);

// 3. Không route nào khớp -> 404
app.use(notFound);

// 4. Mọi lỗi (từ next(err) hoặc throw trong route) đều đổ về đây. Luôn đặt cuối cùng.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
