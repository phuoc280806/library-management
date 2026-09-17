const express = require('express');
const readersController = require('../controllers/readers.controller');
const borrowsController = require('../controllers/borrows.controller');
const { auth, role } = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

// Sách đang mượn của bạn đọc: bạn đọc xem của mình, thủ thư xem của ai cũng được (kiểm tra trong service)
router.get('/:id/borrowings', borrowsController.byReader); // GET /api/readers/1/borrowings

// Quản lý bạn đọc: chỉ thủ thư / admin
router.use(role('LIBRARIAN', 'ADMIN'));
router.get('/', readersController.list); // GET  /api/readers?keyword=an
router.get('/:id', readersController.getOne); // GET  /api/readers/1
router.post('/', readersController.create); // POST /api/readers
router.put('/:id', readersController.update); // PUT  /api/readers/1

module.exports = router;
