const AppError = require('../utils/AppError');

// Đặt SAU tất cả các route: request nào rơi xuống đây nghĩa là không route nào khớp
function notFound(req, res, next) {
  next(new AppError(`Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`, 404));
  // next(err) có tham số -> Express bỏ qua các middleware thường, nhảy thẳng tới errorHandler
}

module.exports = notFound;
