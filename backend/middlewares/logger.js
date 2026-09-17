// In ra mỗi request đến server: phương thức, đường dẫn, thời gian xử lý
function logger(req, res, next) {
  const start = Date.now();

  // 'finish' bắn ra khi response đã gửi xong
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });

  next(); // QUAN TRỌNG: không có dòng này, request treo mãi
}

module.exports = logger;