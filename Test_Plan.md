# Test Plan (Evaluation Criteria F)

This plan includes only the required evaluation criteria.

## 1. Backend Unit Tests

Unit tests define expected behavior for backend services:

- `tests/api/movies.test.ts`
  - Pagination defaults and query handling
  - Search behavior
  - Error handling on query failure
- `tests/api/movie-details.test.ts`
  - Invalid movie ID returns not found behavior

## 2. Frontend Unit Tests

Unit tests define expected behavior for frontend components:

- `tests/ui/home.test.tsx`
  - Required navigation links
- `tests/ui/movies.test.tsx`
  - Loading, success, empty, and error states
- `tests/ui/search.test.tsx`
  - Search input and submit interaction

## 3. Integration / End-to-End Behavior Tests

System behavior coverage:

- `tests/integration/basic-flow.test.ts`
  - Movies list retrieval
  - Movie details retrieval from selected movie

## 4. Stress and Robustness Tests

Stress and failure scenarios (with mocks/simulated failures):

- `tests/api/stress.test.ts`
  - Concurrent requests
  - Invalid/edge query values
  - Simulated database timeout/failure
  - Long/special-character inputs
- `tests/api/movie-details-stress.test.ts`
  - Missing/invalid IDs
  - Simulated database failure
  - Extreme input lengths and encoded input

## 5. CI GitHub Checks (All Future PRs)

CI enforcement:

- Workflow: `.github/workflows/test.yml`
- Trigger: every `pull_request`
- Also runs on push to `main` and `develop`
- Pipeline steps:
  - `npm ci`
  - `npm run lint`
  - `npm test`

## Commands

```bash
# Run full test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm test -- tests/api/stress.test.ts
```
