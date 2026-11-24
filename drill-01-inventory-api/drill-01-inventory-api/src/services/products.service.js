const repo = require('../repositories/products.repository');
const HttpError = require('../utils/HttpError');

const VALID_CATEGORIES = ['electronics', 'books', 'home', 'toys'];

function toResponse(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price.toFixed(2)),
    quantity: product.quantity,
    inStock: product.quantity > 0,
  };
}

async function listProducts({ category, page, limit }) {
  let products = await repo.findAll();

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  const total = products.length;
  const start = (page - 1) * limit;
  const items = products.slice(start, start + limit).map(toResponse);


  return { items, total, page, limit };
}

async function getProduct(id) {
  const product = await repo.findById(id);

  if(!product) //addded a throw error if not found instead of 
    //letting error go to default 500 server issue 
      throw new HttpError(404,'Product not found');

  return toResponse(product);
}

async function createProduct(data) {
  const { name, category, price, quantity = 0 } = data || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name is required');
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw new HttpError(400, `category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (typeof price !== 'number' || price < 0) {
    throw new HttpError(400, 'price must be a non-negative number');
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new HttpError(400, 'quantity must be a non-negative integer');
  }

  const created = await repo.insert({ name: name.trim(), category, price, quantity });
    
  return toResponse(created);
}

async function adjustStock(id, delta) {
  if (!Number.isInteger(delta)) {
    throw new HttpError(400, 'delta must be an integer');
  }

  const product = await repo.findById(id);
  if (!product) {
    throw new HttpError(404, 'Product not found');
  }


  const newQuantity = product.quantity + delta;
  if (newQuantity < 0) { //needed to allow 0 as a stock value
    throw new HttpError(400, 'Insufficient stock');
  }

  //added await keyword before repo.update 
  //else would have been un unresolved promise 
  const updated = await repo.update(id, { quantity: newQuantity });
  return toResponse(updated);
}

async function deleteProduct(id) {
  const removed = await repo.remove(id);
  if (!removed) {
    throw new HttpError(404, 'Product not found');
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  adjustStock,
  deleteProduct,
  toResponse,
};
