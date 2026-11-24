import { vi } from 'vitest';

export const SAMPLE_TICKETS = [
  { id: 1, title: 'Checkout page times out', priority: 'high', status: 'open', assignee: 'belen', commentCount: 0 },
  { id: 3, title: 'Login fails with SSO', priority: 'high', status: 'in_progress', assignee: 'jordan', commentCount: 1 },
  { id: 2, title: 'Typo on pricing page', priority: 'low', status: 'open', assignee: null, commentCount: 0 },
];

const json = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

/**
 * Installs a fake `fetch` that behaves like the real API for the routes below.
 * Any other URL/method gets a 404 — just like a typo'd route on a real server.
 * `overrides` lets a test replace one route: { 'PATCH /api/tickets/1/status': () => [409, {...}] }
 */
export function mockApi(tickets = SAMPLE_TICKETS, overrides = {}) {
  let data = tickets.map((t) => ({ ...t }));
  let nextId = 100;

  const fetchMock = vi.fn((url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const [path, query = ''] = url.split('?');
    const key = `${method} ${path}`;

    if (overrides[key]) {
      const [status, body] = overrides[key](url, options);
      return json(status, body);
    }

    if (method === 'GET' && path === '/api/tickets') {
      const search = new URLSearchParams(query).get('search');
      const results = search
        ? data.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        : data;
      return json(200, results);
    }

    if (method === 'POST' && path === '/api/tickets') {
      const body = JSON.parse(options.body);
      const created = {
        id: nextId++,
        title: body.title,
        priority: body.priority || 'medium',
        status: 'open',
        assignee: null,
        commentCount: 0,
      };
      data = [created, ...data];
      return json(201, created);
    }

    const statusMatch = path.match(/^\/api\/tickets\/(\d+)\/status$/);
    if (method === 'PATCH' && statusMatch) {
      const id = Number(statusMatch[1]);
      const ticket = data.find((t) => t.id === id);
      if (!ticket) return json(404, { error: 'Ticket not found' });
      ticket.status = JSON.parse(options.body).status;
      return json(200, { ...ticket });
    }

    return json(404, { error: `Not found: ${method} ${url}` });
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
