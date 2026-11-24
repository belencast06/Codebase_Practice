const request = require('supertest');
const app = require('../src/app');
const repo = require('../src/repositories/tickets.repository');

beforeEach(() => {
  repo.reset();
});

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/tickets', () => {
  it('lists tickets sorted by priority (high first), then oldest first', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.id)).toEqual([1, 3, 4, 5, 2]);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/tickets?status=open');
    expect(res.status).toBe(200);
    expect(res.body.every((t) => t.status === 'open')).toBe(true);
    expect(res.body).toHaveLength(3);
  });

  it('rejects an unknown status filter', async () => {
    const res = await request(app).get('/api/tickets?status=closed');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tickets/:id', () => {
  it('returns a ticket with its comments', async () => {
    const res = await request(app).get('/api/tickets/3');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, status: 'in_progress', commentCount: 1 });
    expect(res.body.comments[0].text).toBe('Reproduced on staging.');
  });

  it('returns 404 for a missing ticket', async () => {
    const res = await request(app).get('/api/tickets/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ticket not found' });
  });
});

describe('POST /api/tickets', () => {
  it('creates a ticket with defaults when only a title is given', async () => {
    const res = await request(app).post('/api/tickets').send({ title: 'Dark mode toggle broken' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 6,
      title: 'Dark mode toggle broken',
      description: '',
      priority: 'medium',
      status: 'open',
      assignee: null,
      commentCount: 0,
    });
  });

  it('rejects a ticket without a title', async () => {
    const res = await request(app).post('/api/tickets').send({ priority: 'high' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('title is required');
  });

  it('rejects an invalid priority', async () => {
    const res = await request(app).post('/api/tickets').send({ title: 'X', priority: 'urgent' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/tickets/:id/status', () => {
  it('moves an open ticket to in_progress', async () => {
    const res = await request(app).patch('/api/tickets/1/status').send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('resolves an in_progress ticket', async () => {
    const res = await request(app).patch('/api/tickets/3/status').send({ status: 'resolved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('resolved');
  });

  it('returns 409 for a transition that is not allowed (open -> resolved)', async () => {
    const res = await request(app).patch('/api/tickets/1/status').send({ status: 'resolved' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/cannot move ticket/i);
  });

  it('returns 404 when the ticket does not exist', async () => {
    const res = await request(app).patch('/api/tickets/999/status').send({ status: 'in_progress' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/tickets/:id/comments', () => {
  it('adds a comment and returns the updated ticket', async () => {
    const res = await request(app)
      .post('/api/tickets/1/comments')
      .send({ text: 'Looking into the payment service logs.' });

    expect(res.status).toBe(201);
    expect(res.body.commentCount).toBe(1);

    const detail = await request(app).get('/api/tickets/1');
    expect(detail.body.comments[0].text).toBe('Looking into the payment service logs.');
  });

  it('rejects an empty comment', async () => {
    const res = await request(app).post('/api/tickets/1/comments').send({ text: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('text is required');
  });
});
