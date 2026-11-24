const repo = require('../repositories/tickets.repository');
const HttpError = require('../utils/HttpError');

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['open', 'in_progress', 'resolved'];

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

// Which statuses a ticket may move to from its current status.
const TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open'],
  resolved: ['open'],
};

function toResponse(ticket) {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    assignee: ticket.assignee,
    createdAt: ticket.createdAt,
    commentCount: ticket.comments.length,
  };
}

// Sorted by priority (high first), then oldest first.
function sortTickets(tickets) {
  return [...tickets].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      a.createdAt.localeCompare(b.createdAt)
  );
}

async function listTickets({ status } = {}) {
  let tickets = await repo.findAll();

  if (status) {
    if (!STATUSES.includes(status)) {
      throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    }
    tickets = tickets.filter((t) => t.status === status);
  }

  return sortTickets(tickets).map(toResponse);
}

async function getTicket(id) {
  const ticket = await repo.findById(id);
  if (!ticket) {
    throw new HttpError(404, 'Ticket not found');
  }
  return { ...toResponse(ticket), comments: ticket.comments };
}

async function createTicket(data) {
  const { title, description = '', priority = 'medium', assignee } = data || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new HttpError(400, 'title is required');
  }
  if (title.trim().length > 120) {
    throw new HttpError(400, 'title must be 120 characters or fewer');
  }
  if (!PRIORITIES.includes(priority)) {
    throw new HttpError(400, `priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  if (!assignee || typeof assignee !== 'string') {
    throw new HttpError(400, 'assignee is required');
  }

  const created = await repo.insert({
    title: title.trim(),
    description,
    priority,
    status: 'open',
    assignee: assignee || null,
    createdAt: new Date().toISOString(),
    comments: [],
  });

  return toResponse(created);
}

async function updateStatus(id, status) {
  if (!STATUSES.includes(status)) {
    throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
  }

  const ticket = await repo.findById(id);
  if (!ticket) {
    throw new HttpError(404, 'Ticket not found');
  }

  if (!TRANSITIONS[ticket.status].includes(status)) {
    throw new HttpError(409, `Cannot move ticket from ${ticket.status} to ${status}`);
  }

  const updated = await repo.update(id, { status });
  return toResponse(updated);
}

async function addComment(id, text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new HttpError(400, 'text is required');
  }

  const ticket = await repo.findById(id);
  if (!ticket) {
    throw new HttpError(404, 'Ticket not found');
  }

  const comment = { text: text.trim(), createdAt: new Date().toISOString() };
  const updated = await repo.update(id, { comments: [...ticket.comments, comment] });
  return toResponse(updated);
}

module.exports = {
  listTickets,
  getTicket,
  createTicket,
  updateStatus,
  addComment,
};
