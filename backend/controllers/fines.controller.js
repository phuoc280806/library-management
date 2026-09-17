const finesService = require('../services/fines.service');

async function list(req, res) {
  const { status, reader_id } = req.query;
  res.json(await finesService.list({ status, reader_id }, req.user));
}

async function pay(req, res) {
  res.json(await finesService.pay(req.params.id));
}

module.exports = { list, pay };
