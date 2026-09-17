// Middleware xử lý lỗi: PHẢI có đủ 4 tham số (err, req, res, next)
// Express nhìn số tham số để biết đây là error handler. Đặt CUỐI CÙNG trong index.js.
function errorHandler(err, req, res, next) {
  // 1. Lỗi do mình ném (AppError) -> dùng mã và message của nó
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // 2. Client gửi JSON hỏng -> express.json() ném lỗi có sẵn status 400
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Body không phải JSON hợp lệ' });
  }

  // 3. Lỗi bất ngờ (bug, MySQL...) -> 500 và giấu chi tiết, chỉ log ra console
  console.error(err); // để dev nhìn thấy stack trace
  res.status(500).json({ message: 'Lỗi hệ thống' });
}

module.exports = errorHandler;
