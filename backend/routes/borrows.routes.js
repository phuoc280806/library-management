const express = require('express');
const borrowsController = require('../controllers/borrows.controller');
const { auth, role } = require('../middlewares/auth');

const router = express.Router();

// Mọi thao tác mượn/trả đều phải đăng nhập
router.use(auth);

// Lập phiếu & nhận trả: chỉ thủ thư / admin
router.post('/', role('LIBRARIAN', 'ADMIN'), borrowsController.create); // POST /api/borrows  { reader_id, copy_codes }
router.post('/return', role('LIBRARIAN', 'ADMIN'), borrowsController.returnCopy); // POST /api/borrows/return  { copy_code }

// Danh sách quá hạn: thủ thư / admin
router.get('/overdue', role('LIBRARIAN', 'ADMIN'), borrowsController.overdue); // GET /api/borrows/overdue

// Xem phiếu: thủ thư xem tất cả, bạn đọc chỉ xem phiếu của mình (kiểm tra trong service)
router.get('/:id', borrowsController.getOne); // GET  /api/borrows/6

// Lưu ý: '/return' và '/overdue' khai báo TRƯỚC '/:id', nếu không Express hiểu chúng là một id

module.exports = router;
