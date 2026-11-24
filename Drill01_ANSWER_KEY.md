# Repo Drill #1: Answer Key

**Don't open this until your 60 minutes are up.**

There are 6 bugs. The 404 test is chained: it stays red until bugs 1 and 3 are both fixed.

| # | Failing test(s) | File | Bug | Fix | Bug type |
|---|---|---|---|---|---|
| 1 | returns a single product | `src/routes/products.routes.js` | `router.get(':id', ...)` is missing the leading slash, so `/3` never matches and Express returns its default HTML 404 | `router.get('/:id', ...)` | Route path / missing slash |
| 2 | filters by category query param | `src/controllers/products.controller.js` → `list` | `category` is read from `req.params`, which is empty on this route, so the filter is skipped | `const { category } = req.query;` | params vs. query mix-up |
| 3 | returns 404 … does not exist | `src/services/products.service.js` → `getProduct` | No null check: `toResponse(null)` throws a TypeError, which becomes a 500 | `if (!product) throw new HttpError(404, 'Product not found');` | Missing null check |
| 4 | creates a product and returns 201 | `src/controllers/products.controller.js` → `create` | Responds with 200 | `res.status(201)` | Wrong status code |
| 5 | adjusts stock and returns the updated product | `src/services/products.service.js` → `adjustStock` | `repo.update(...)` isn't awaited, so `toResponse` receives a Promise and throws (500) | `const updated = await repo.update(...)` | Missing `await` |
| 6 | allows stock to reach exactly zero | `src/services/products.service.js` → `adjustStock` | `newQuantity <= 0` rejects exactly 0 | `newQuantity < 0` | Off-by-one boundary |

## Self-check

- **Time to first fix:** under 5 minutes is good.
- **Did you edit any tests?** That would be an automatic fail on the real OA.
- **Bug 1 trap:** the 404 test returns 404 even before it's fixed, but the body is HTML, not JSON. Did you read the *body* in the assertion output, not just the status?
- **Bug 5:** did you check the response body, or only the status code?
