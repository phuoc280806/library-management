// Tầng controller: đọc dữ liệu từ req (query/params/body), gọi service, trả res.
// Không chứa quy tắc nghiệp vụ, không chứa SQL.
const booksService = require('../services/books.service');

async function list(req, res) {
  const books = await booksService.search(req.query.keyword || '');
  res.json(books);
}

async function getOne(req, res) {
  const book = await booksService.getById(req.params.id);
  res.json(book);
}

async function create(req, res) {
  const book = await booksService.create(req.body);
  res.status(201).json(book);
}

async function update(req, res) {
  res.json(await booksService.update(req.params.id, req.body));
}

async function remove(req, res) {
  await booksService.remove(req.params.id);
  res.status(204).end(); // 204 = thành công, không có nội dung trả về
}

module.exports = { list, getOne, create, update, remove };
