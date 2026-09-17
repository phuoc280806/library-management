const readersService = require('../services/readers.service');

async function list(req, res) {
  res.json(await readersService.search(req.query.keyword || ''));
}

async function getOne(req, res) {
  res.json(await readersService.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await readersService.create(req.body));
}

async function update(req, res) {
  res.json(await readersService.update(req.params.id, req.body));
}

module.exports = { list, getOne, create, update };
