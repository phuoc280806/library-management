// Lỗi "có chủ đích" do mình ném ra (sách hết, không tìm thấy, thiếu dữ liệu...)
// Khác với lỗi bất ngờ (MySQL sập, bug code) là nó mang sẵn mã HTTP để trả về client.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message); // gọi constructor của Error để có .message và .stack
    this.statusCode = statusCode;
    this.isOperational = true; // đánh dấu: lỗi này an toàn để hiện message cho client
  }
}

module.exports = AppError;
