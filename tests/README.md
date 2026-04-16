# Gradient Cart Test Suite

This directory contains unit and integration tests for the Gradient Cart online store.

## Setup

1. Install dependencies:
   ```bash
   npm install --save-dev vitest jsdom @vitest/ui
   ```

2. Run tests:
   ```bash
   npm test
   ```

   For watch mode during development:
   ```bash
   npm run test:watch
   ```

   For UI test runner:
   ```bash
   npm run test:ui
   ```

## Test Files

### `app.test.js`
Frontend unit tests for core application logic.

**Covers:**
- Cart functionality (add, remove, update quantity)
- Discount code application and calculations
- Product filtering (search, category, price range)
- UI state updates (cart badge, totals)
- localStorage persistence

**Mocks:**
- `localStorage`
- Supabase client
- DOM via JSDOM

### `api.test.js`
API integration tests for Supabase and Edge Functions.

**Covers:**
- Product catalog queries
- Discount validation Edge Function
- Order creation Edge Function
- Row Level Security (RLS) policies
- Error handling and validation

**Mocks:**
- `fetch` for Edge Function calls
- Supabase client methods

## Test Structure

Tests are organized using `describe` blocks for features and `it` blocks for individual test cases. Each test follows the pattern:

1. **Arrange**: Set up test data and mocks
2. **Act**: Execute the function or interaction
3. **Assert**: Verify expected outcomes

## Running Specific Tests

Run a single test file:
```bash
npx vitest tests/app.test.js
```

Run tests matching a pattern:
```bash
npx vitest run -t "cart"
```

## Test Coverage

To generate coverage reports:
```bash
npx vitest run --coverage
```

Coverage reports will be available in the `coverage/` directory.

## Continuous Integration

These tests are designed to run in CI environments. Ensure the following environment variables are set for API tests:

- `SUPABASE_URL` (mockable)
- `SUPABASE_ANON_KEY` (mockable)

## Notes

- Tests are isolated and should not make real network calls
- Mock data reflects the structure defined in `db/schema.sql`
- Edge Function tests simulate HTTP requests/responses
- RLS tests verify security policies without actual database access