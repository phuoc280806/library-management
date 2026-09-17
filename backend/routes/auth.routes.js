const express = require('express');
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', authController.login); // POST /api/auth/login  { username, password }
router.get('/profile', auth, authController.profile); // GET /api/auth/profile  (cần Bearer token)

// Không có /logout: JWT không lưu ở server, "đăng xuất" = client xoá token.

module.exports = router;
