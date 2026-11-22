const service = require('../services/products.service');

// GET /api/products?category=&page=&limit=
async function list(req, res, next) {
  try {
    const { page, limit } = req.query;
    const { category } = req.params;

    const result = await service.listProducts({
      category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getById(req, res, next) {
  try {
    const product = await service.getProduct(Number(req.params.id));
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

// POST /api/products
async function create(req, res, next) {
  try {
    const product = await service.createProduct(req.body);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/products/:id/stock   body: { delta: number }
async function adjustStock(req, res, next) {
  try {
    const product = await service.adjustStock(Number(req.params.id), req.body.delta);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
async function remove(req, res, next) {
  try {
    await service.deleteProduct(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, adjustStock, remove };
