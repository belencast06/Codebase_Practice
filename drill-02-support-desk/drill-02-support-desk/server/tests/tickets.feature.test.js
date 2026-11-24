// PART 2 — FEATURE: ticket search (only if you finish Part 1 with time left)
//
// GET /api/tickets?search=<term>
//   - Case-insensitive match against title OR description
//   - Blank / whitespace-only search is ignored (returns everything)
//   - Works together with ?status=
//   - Results keep the normal sort order
const request = require('supertest');
const app = require('../src/app');
const repo = require('../src/repositories/tickets.repository');

beforeEach(() => {
  repo.reset();
});

describe('FEATURE: GET /api/tickets?search=', () => {
  it('matches title or description, case-insensitive', async () => {
    const res = await request(app).get('/api/tickets?search=LOGIN');
    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.id)).toEqual([3, 5]);
  });

  it('combines with the status filter', async () => {
    const res = await request(app).get('/api/tickets?search=login&status=open');
    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.id)).toEqual([5]);
  });

  it('returns an empty array when nothing matches', async () => {
    const res = await request(app).get('/api/tickets?search=refund');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('ignores a whitespace-only search', async () => {
    const res = await request(app).get('/api/tickets?search=%20%20');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
  });
});
