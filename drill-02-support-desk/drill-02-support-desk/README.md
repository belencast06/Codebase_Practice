# Repo Drill #2: Support Desk (full stack)

A support-ticket app with an **Express API** (`server/`) and a **React client** (`client/`). Tests are failing in both layers.

- **Part 1 (required):** make every test pass.
- **Part 2 (only if time is left):** build the ticket search feature so the feature tests pass.

## Rules (mirror the real OA)

- **60-minute timer** for Parts 1 and 2 together. Start it at your first `npm test`.
- **Do not edit any test files** (`server/tests/`, `client/src/__tests__/`). The tests are the spec.
- Fix one failing test at a time, then re-run the whole suite.
- AI is allowed only to *point at* problems. Review every line it changes.
- Some bugs are hidden behind others. Fixing one test can make a different assertion in it start failing. That's expected.
- When time's up, write down how many tests pass, which bug took longest, and what slowed you down.

## Setup

Requires Node 18+. Run this from the folder that contains *this* README:

```bash
npm install          # installs root, server and client
npm test             # Part 1: server + client bug tests, with a summary
npm run test:feature # Part 2: feature tests
```

Run one side at a time, or a single test:

```bash
npm run test:server
npm run test:client
cd server && npx jest -t "returns 409"
cd client && npx vitest run src/__tests__/api.test.js
```

Run the app (optional, but useful as a preview panel):

```bash
npm run dev
# API     http://localhost:3001/api/tickets
# Client  http://localhost:5173  (proxies /api to the server)
```

## Project structure

```
server/
  src/app.js                          Express app, middleware, route mounting
  src/routes/tickets.routes.js        URL -> controller
  src/controllers/tickets.controller.js  Reads req, calls service, sends res
  src/services/tickets.service.js     Business rules, validation, sorting
  src/repositories/tickets.repository.js In-memory "DB" (async), reset before each test
  src/middleware/errorHandler.js      HttpError -> JSON { error }
  src/data/seed.js                    Starting tickets
  tests/tickets.test.js               Part 1
  tests/tickets.feature.test.js       Part 2
client/
  src/api.js                          fetch wrappers for the API
  src/App.jsx                         State, data loading, handlers
  src/components/TicketForm.jsx       Create-ticket form
  src/components/TicketList.jsx       List + status action buttons
  src/__tests__/mockFetch.js          Fake API used by client tests (unknown routes -> 404)
  src/__tests__/*.test.*              Part 1
  src/__tests__/Search.feature.test.jsx  Part 2
```

## API contract

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/health` | 200 `{ status: "ok" }` | |
| GET | `/api/tickets?status=` | 200 `Ticket[]` sorted **priority high → low, then oldest first** | 400 unknown status |
| GET | `/api/tickets/:id` | 200 `Ticket` + `comments[]` | 404 `{ error: "Ticket not found" }` |
| POST | `/api/tickets` | 201 `Ticket` | 400 invalid body |
| PATCH | `/api/tickets/:id/status` | 200 `Ticket` | 400 bad status · 404 · 409 illegal transition |
| POST | `/api/tickets/:id/comments` | 201 `Ticket` | 400 · 404 |

**POST /api/tickets body:** `{ title, description?, priority?, assignee? }`
- `title` is required, at most 120 characters.
- `priority` is `low` / `medium` / `high` (default `medium`).
- `description` defaults to `""`, `assignee` is optional (default `null`), and new tickets start `open`.

**POST /api/tickets/:id/comments body:** `{ text }`

**Allowed status transitions:**

```
open --> in_progress --> resolved
  ^          |              |
  +----------+--------------+   (in_progress and resolved can both go back to open)
```

Anything else (for example `open -> resolved`) returns 409.

**Ticket:**
```json
{ "id": 1, "title": "...", "description": "...", "priority": "high", "status": "open",
  "assignee": "belen", "createdAt": "2026-11-01T09:00:00.000Z", "commentCount": 0 }
```

## Client behavior

- Loads tickets on mount and shows an error banner (`role="alert"`) if a request fails.
- **Create ticket** adds the new ticket to the **top** of the list and clears the form.
- Each ticket has one action button: Open → **Start**, In Progress → **Resolve**, Resolved → **Reopen**. Clicking it updates the ticket in place, with no page reload.

## Part 2 feature: ticket search

**Server:** `GET /api/tickets?search=<term>`
- Case-insensitive match on title **or** description.
- A blank or whitespace-only search is ignored.
- Combines with `?status=` and keeps the normal sort order.

**Client:** a search form in `<App />`
- An input labelled **"Search tickets"** and a submit button **"Search"**.
- Submitting calls `/api/tickets?search=<term>` and replaces the list with the results.
- A blank search reloads everything via `/api/tickets`.
- No results shows **"No tickets found."**

## Debug loop

1. Read the failing assertion: expected vs. received, **and the body**, not just the status code.
2. Trace it: client test → `api.js` → route → controller → service → repository.
3. Make the smallest fix, re-run that test, then the full suite.
