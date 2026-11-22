# Repo Drill #1: Inventory API

A small Express REST API for a store's product inventory. Some tests are failing. **Your job: make every test pass.**

## Rules (mirror the real OA)

- **60-minute timer.** Start it when you run `npm test` for the first time.
- **Do not edit anything in `tests/`.** The tests are the spec.
- Fix one failing test at a time, then re-run the whole suite.
- You can use an AI assistant, but only to *point at* problems. Don't ask it to fix everything. Review every line it touches.
- When time's up, write down: tests passing, what slowed you down, and which bug took the longest.

## Setup

```bash
npm install
npm test
```

Run a single test file or test name:

```bash
npx jest tests/products.test.js
npx jest -t "returns 201"
```

Run the server manually (optional):

```bash
npm start
# http://localhost:3000/api/products
```

## Project structure

```
src/
  app.js                         Express app, middleware, route mounting
  server.js                      Starts the HTTP server
  routes/products.routes.js      URL → controller mapping
  controllers/products.controller.js   Reads req, calls service, sends res
  services/products.service.js   Business rules + validation
  repositories/products.repository.js  In-memory "database" (async methods)
  middleware/errorHandler.js     Turns thrown HttpErrors into JSON responses
  utils/HttpError.js             Error class with an HTTP status
  data/seed.js                   Starting data (reset before every test)
tests/
  health.test.js
  products.test.js
```

## API contract

| Method | Path | Success | Notes |
|---|---|---|---|
| GET | `/api/health` | 200 `{ status: "ok" }` | |
| GET | `/api/products?category=&page=&limit=` | 200 `{ items, total, page, limit }` | `page` defaults to 1, `limit` to 10 |
| GET | `/api/products/:id` | 200 product | 404 `{ error: "Product not found" }` |
| POST | `/api/products` | 201 product | 400 on invalid body |
| PATCH | `/api/products/:id/stock` | 200 product | body `{ delta }`; stock may reach 0 but never go below it (400 `Insufficient stock`) |
| DELETE | `/api/products/:id` | 204 | 404 if missing |

A product response looks like this:

```json
{ "id": 3, "name": "Clean Code", "category": "books", "price": 37, "quantity": 8, "inStock": true }
```

## Debug loop

1. Read the failing assertion (expected vs. received).
2. Find the route → controller → service → repository that handles it.
3. Form a hypothesis, make the smallest fix, re-run that test.
4. Re-run the full suite to check for regressions.
