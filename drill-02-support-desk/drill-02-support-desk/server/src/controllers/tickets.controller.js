const service = require('../services/tickets.service');

// GET /api/tickets?status=
async function list(req, res, next) {
  try {
    const { status } = req.query;
    const tickets = await service.listTickets({ status });
    res.status(200).json(tickets);
  } catch (err) {
    next(err);
  }
}

// GET /api/tickets/:id
async function getById(req, res, next) {
  try {
    const ticket = await service.getTicket(Number(req.params.id));
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets   body: { title, description?, priority?, assignee? }
async function create(req, res, next) {
  try {
    const ticket = await service.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tickets/:id/status   body: { status }
async function updateStatus(req, res, next) {
  try {
    const ticket = await service.updateStatus(Number(req.params.id), req.body.status);
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets/:id/comments   body: { text }
async function addComment(req, res, next) {
  try {
    const ticket = await service.addComment(Number(req.params.id), req.body.text);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, updateStatus, addComment };
