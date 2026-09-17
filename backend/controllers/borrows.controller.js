const borrowsService = require('../services/borrows.service');

async function create(req, res) {
  // librarian_id lấy từ token (req.user), KHÔNG tin body: client không được tự khai mình là ai
  const ticket = await borrowsService.borrow({ ...req.body, librarian_id: req.user.user_id });
  res.status(201).json(ticket);
}

async function returnCopy(req, res) {
  const result = await borrowsService.returnCopy(req.body);
  res.json(result);
}

async function getOne(req, res) {
  const ticket = await borrowsService.getTicket(req.params.id, req.user);
  res.json(ticket);
}

async function overdue(req, res) {
  res.json(await borrowsService.listOverdue());
}

async function byReader(req, res) {
  res.json(await borrowsService.listBorrowingOfReader(req.params.id, req.user));
}

module.exports = { create, returnCopy, getOne, overdue, byReader };
