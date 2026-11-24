# Repo Drill #2: Answer Key

**Don't open this until your 60 minutes are up.**

There are 8 bugs (5 server, 3 client) behind 10 failing tests. Two are chained: S1 only shows once S2 is fixed, and C2 only shows once C1 is fixed.

## Server

| # | Failing test(s) | File | Bug | Fix | Bug type |
|---|---|---|---|---|---|
| S1 | resolves an in_progress ticket *(after S2)* | `services/tickets.service.js` → `TRANSITIONS` | `in_progress` only allows `['open']` | `in_progress: ['open', 'resolved']` | Logic doesn't match the spec |
| S2 | moves an open ticket… · resolves… · returns 409… | `routes/tickets.routes.js` | Route is `/:id/state` but the contract and client use `/status`, so Express returns its HTML 404 | `router.patch('/:id/status', …)` | Wrong route path |
| S3 | lists tickets sorted by priority… | `services/tickets.service.js` → `sortTickets` | `a - b` sorts low → high | `PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]` | Reversed comparator |
| S4 | creates a ticket with defaults… | `services/tickets.service.js` → `createTicket` | Rejects a missing `assignee`, but the contract says it's optional | Delete the `assignee is required` check | Validation stricter than the contract |
| S5 | adds a comment and returns the updated ticket | `controllers/tickets.controller.js` → `addComment` | Reads `req.body.comment`; the contract sends `{ text }` | `req.body.text` | Wrong request field name |

## Client

| # | Failing test(s) | File | Bug | Fix | Bug type |
|---|---|---|---|---|---|
| C1 | updateTicketStatus sends a PATCH… · moves a ticket… · shows the server error… | `src/api.js` → `updateTicketStatus` | `` `${API_BASE}tickets/...` `` gives `/apitickets/1/status` | `` `${API_BASE}/tickets/${id}/status` `` | Missing slash in URL |
| C2 | moves a ticket to In Progress… *(after C1)* | `src/App.jsx` → `handleStatusChange` | Mutates the ticket in place and calls `setTickets(tickets)` with the same array, so React skips the re-render | `setTickets(prev => prev.map(t => t.id === id ? { ...t, status: updated.status } : t))` | State mutation |
| C3 | adds a newly created ticket to the top… | `src/App.jsx` → `handleCreate` | `createTicket(data)` isn't awaited, so a Promise gets put in the list | `const created = await createTicket(data);` | Missing `await` |

## Part 2: reference solution

**Server.** In `controllers/tickets.controller.js` → `list`:
```js
const { status, search } = req.query;
const tickets = await service.listTickets({ status, search });
```
In `services/tickets.service.js` → `listTickets({ status, search })`, before sorting:
```js
const term = (search || '').trim().toLowerCase();
if (term) {
  tickets = tickets.filter(
    (t) => t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)
  );
}
```

**Client.** In `App.jsx`:
```jsx
const [search, setSearch] = useState('');

async function handleSearch(e) {
  e.preventDefault();
  setError('');
  const term = search.trim();
  try {
    setTickets(await fetchTickets(term ? { search: term } : {}));
  } catch (err) {
    setError(err.message);
  }
}

// in the JSX, below <TicketForm />:
<form className="search-form" role="search" onSubmit={handleSearch}>
  <label>
    Search tickets
    <input value={search} onChange={(e) => setSearch(e.target.value)} />
  </label>
  <button type="submit">Search</button>
</form>
```

## Self-check

- **Did you edit any tests?** That's an automatic fail on the real OA.
- **S2:** did you notice the 404 body was HTML, not `{ error }`? That points to the route, not the handler.
- **C2:** did you know *why* mutating state breaks React (same reference, so no re-render), or did you just try things?
- **C3:** a missing `await` showed up again, as in Drill #1, this time on the client. Did you spot the pattern faster?
- **Score:** 10/10 bug tests in under 40 minutes leaves time for the feature. Under 8/10 means time is the issue; practice the trace step.
