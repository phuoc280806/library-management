// Tầng service: quy tắc nghiệp vụ của thư viện. Không biết req/res, không viết SQL.
// Gặp vi phạm quy tắc -> ném AppError, controller/errorHandler sẽ lo phần HTTP.
const booksRepo = require('../repositories/books.repository');
const AppError = require('../utils/AppError');

async function search(keyword) {
  return booksRepo.findAll(keyword);
}

async function getById(id) {
  const book = await booksRepo.findById(id);
  if (!book) throw new AppError('Không tìm thấy sách', 404);
  return book;
}

async function create(data) {
  if (!data.title) throw new AppError('Thiếu tên sách', 400);
  if (!data.category_id) throw new AppError('Thiếu thể loại (category_id)', 400);

  const id = await booksRepo.create(data);
  return booksRepo.findById(id); // INSERT chỉ trả insertId -> đọc lại cho đầy đủ
}

async function update(id, data) {
  await getById(id); // 404 nếu không có
  if (!data.title) throw new AppError('Thiếu tên sách', 400);
  if (!data.category_id) throw new AppError('Thiếu thể loại (category_id)', 400);

  await booksRepo.update(id, data);
  return booksRepo.findById(id);
}

async function remove(id) {
  await getById(id);

  // Quy tắc: sách đang có người mượn thì không được xoá
  if ((await booksRepo.countBorrowedCopies(id)) > 0) {
    throw new AppError('Sách đang có bản sao được mượn, không thể xoá', 400);
  }
  // Sách đã có lịch sử mượn: xoá sẽ mất dữ liệu phiếu cũ (và bị khoá ngoại chặn)
  if ((await booksRepo.countCopiesWithHistory(id)) > 0) {
    throw new AppError('Sách đã có lịch sử mượn, không thể xoá. Hãy đánh dấu bản sao là LOST/DAMAGED', 400);
  }

  await booksRepo.remove(id);
}

module.exports = { search, getById, create, update, remove };
