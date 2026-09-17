const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRepo = require('../repositories/users.repository');
const AppError = require('../utils/AppError');

async function login({ username, password }) {
  if (!username || !password) throw new AppError('Thiếu username hoặc password', 400);

  const user = await usersRepo.findByUsername(username);

  // Sai username hay sai password đều trả CÙNG một message:
  // nếu phân biệt, kẻ dò sẽ biết username nào tồn tại để tập trung dò mật khẩu.
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new AppError('Sai tên đăng nhập hoặc mật khẩu', 401);

  if (!user.status) throw new AppError('Tài khoản đang bị khoá', 403);

  // Payload = phần "công khai" của token (ai cũng decode được, chỉ không giả chữ ký được)
  // -> chỉ để id + role, KHÔNG bao giờ để mật khẩu/hash vào đây.
  const token = jwt.sign(
    { user_id: user.user_id, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    user: { user_id: user.user_id, username: user.username, full_name: user.full_name, role: user.role_name },
  };
}

async function getProfile(userId) {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError('Không tìm thấy tài khoản', 404);
  return user;
}

module.exports = { login, getProfile };
