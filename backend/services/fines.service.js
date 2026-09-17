const finesRepo = require('../repositories/fines.repository');
const borrowsRepo = require('../repositories/borrows.repository');
const AppError = require('../utils/AppError');

// Thủ thư xem tất cả (lọc tuỳ ý); bạn đọc chỉ xem của mình
async function list(filter, viewer) {
  if (viewer.role === 'READER') {
    const myReaderId = await borrowsRepo.findReaderIdByUserId(viewer.user_id);
    return finesRepo.findAll({ ...filter, reader_id: myReaderId });
  }
  return finesRepo.findAll(filter);
}

async function pay(fineId) {
  const fine = await finesRepo.findById(fineId);
  if (!fine) throw new AppError('Không tìm thấy khoản phạt', 404);
  if (fine.status === 'PAID') throw new AppError('Khoản phạt này đã được thanh toán', 400);

  await finesRepo.markPaid(fineId);
  return finesRepo.findById(fineId);
}

module.exports = { list, pay };
