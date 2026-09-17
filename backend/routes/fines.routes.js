const express = require('express');
const finesController = require('../controllers/fines.controller');
const { auth, role } = require('../middlewares/auth');

const router = express.Router();

router.use(auth);

router.get('/', finesController.list); // GET /api/fines?status=UNPAID&reader_id=1
router.put('/:id/pay', role('LIBRARIAN', 'ADMIN'), finesController.pay); // PUT /api/fines/3/pay

module.exports = router;
