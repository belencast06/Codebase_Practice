const request = require('supertest');
const app = require('../src/app');
const repo = require('../src/repositories/products.repository');

beforeEach(() => {
  repo.reset();
});

describe('GET /api/products', () => {
  it('lists all products with pagination metadata', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(6);
    expect(res.body.items).toHaveLength(6);
    expect(res.body.page).toBe(1);
  });

  it('paginates results', async () => {
    const res = await request(app).get('/api/products?page=2&limit=4');
    expect(res.status).toBe(200);
    expect(res.body.items.map((p) => p.id)).toEqual([5, 6]);
    expect(res.body.total).toBe(6);
  });

  it('filters by category query param', async () => {
    const res = await request(app).get('/api/products?category=electronics');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items.every((p) => p.category === 'electronics')).toBe(true);
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product', async () => {
    const res = await request(app).get('/api/products/3');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 3,
      name: 'Clean Code',
      category: 'books',
      price: 37,
      quantity: 8,
      inStock: true,
    });
  });

  it('returns 404 with an error message when the product does not exist', async () => {
    const res = await request(app).get('/api/products/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
  });
});

describe('POST /api/products', () => {
  it('creates a product and returns 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Board Game', category: 'toys', price: 29.99, quantity: 3 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 7,
      name: 'Board Game',
      category: 'toys',
      price: 29.99,
      quantity: 3,
      inStock: true,
    });
  });

  it('rejects a product with no name', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ category: 'toys', price: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name is required');
  });
});

describe('PATCH /api/products/:id/stock', () => {
  it('adjusts stock and returns the updated product', async () => {
    const res = await request(app)
      .patch('/api/products/1/stock')
      .send({ delta: -10 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(30);
  });

  it('allows stock to reach exactly zero', async () => {
    const res = await request(app)
      .patch('/api/products/5/stock')
      .send({ delta: -5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(0);
    expect(res.body.inStock).toBe(false);
  });

  it('rejects an adjustment that would make stock negative', async () => {
    const res = await request(app)
      .patch('/api/products/5/stock')
      .send({ delta: -6 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient stock');
  });
});

describe('DELETE /api/products/:id', () => {
  it('deletes a product', async () => {
    const res = await request(app).delete('/api/products/2');
    expect(res.status).toBe(204);

    const list = await request(app).get('/api/products');
    expect(list.body.total).toBe(5);
  });

  it('returns 404 when deleting a missing product', async () => {
    const res = await request(app).delete('/api/products/999');
    expect(res.status).toBe(404);
  });
});
