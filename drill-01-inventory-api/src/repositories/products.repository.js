// In-memory "database". Methods are async to mimic a real DB driver.
const seed = require('../data/seed');

let products = [];
let nextId = 1;

function reset() {
  products = seed.map((p) => ({ ...p }));
  nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

async function findAll() {
  return products.map((p) => ({ ...p }));
}

async function findById(id) {
  const product = products.find((p) => p.id === id);
  return product ? { ...product } : null;
}

async function insert(data) {
  const product = { id: nextId++, ...data };
  products.push(product);
  return { ...product };
}

async function update(id, changes) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...changes };
  return { ...products[index] };
}

async function remove(id) {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

reset();

module.exports = { reset, findAll, findById, insert, update, remove };
