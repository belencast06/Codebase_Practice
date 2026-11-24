// In-memory "database". Methods are async to mimic a real DB driver.
const seed = require('../data/seed');

let tickets = [];
let nextId = 1;

const clone = (t) => ({ ...t, comments: t.comments.map((c) => ({ ...c })) });

function reset() {
  tickets = seed.map(clone);
  nextId = tickets.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

async function findAll() {
  return tickets.map(clone);
}

async function findById(id) {
  const ticket = tickets.find((t) => t.id === id);
  return ticket ? clone(ticket) : null;
}

async function insert(data) {
  const ticket = { id: nextId++, ...data };
  tickets.push(ticket);
  return clone(ticket);
}

async function update(id, changes) {
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tickets[index] = { ...tickets[index], ...changes };
  return clone(tickets[index]);
}

reset();

module.exports = { reset, findAll, findById, insert, update };
