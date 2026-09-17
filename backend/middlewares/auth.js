const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Bắt buộc đăng nhập. Đọc header "Authorization: Bearer <token>", xác minh chữ ký,
// gắn payload vào req.user để controller/service phía sau biết "ai đang gọi".
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Chưa đăng nhập', 401);
  }

  try {
    // verify: sai secret / bị sửa / hết hạn -> ném lỗi. Không cần query DB.
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { user_id, role, iat, exp }
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Phiên đăng nhập đã hết hạn' : 'Token không hợp lệ';
    throw new AppError(msg, 401);
  }

  next();
}

// Giới hạn theo vai trò. Dùng: router.post('/', auth, role('LIBRARIAN', 'ADMIN'), handler)
// Đây là "middleware factory": gọi role(...) trả về middleware thật sự.
function role(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.user.role)) {
      // 401 = chưa biết bạn là ai; 403 = biết rồi nhưng bạn không được phép
      throw new AppError('Bạn không có quyền thực hiện thao tác này', 403);
    }
    next();
  };
}

module.exports = { auth, role };
