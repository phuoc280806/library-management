// Tầng route: chỉ nối URL + method với hàm controller tương ứng.
const express = require('express');
const booksController = require('../controllers/books.controller');
const { auth, role } = require('../middlewares/auth');

const router = express.Router();

// Tra cứu sách: ai cũng xem được (kể cả chưa đăng nhập)
router.get('/', booksController.list); // GET /api/books?keyword=toán
router.get('/:id', booksController.getOne); // GET /api/books/2

// Thêm / sửa / xoá sách: chỉ thủ thư / admin. Middleware chạy trái -> phải: auth rồi mới role.
const staff = [auth, role('LIBRARIAN', 'ADMIN')];
router.post('/', staff, booksController.create); // POST   /api/books
router.put('/:id', staff, booksController.update); // PUT    /api/books/2
router.delete('/:id', staff, booksController.remove); // DELETE /api/books/2

module.exports = router;
