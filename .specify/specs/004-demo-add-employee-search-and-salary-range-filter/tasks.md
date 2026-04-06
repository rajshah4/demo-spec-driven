# Task Breakdown: Add Employee Search and Salary Range Filter

> Spec: [spec.json](./spec.json)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [ ] Confirm feature branch `feature/4-demo-add-employee-search-and-s` is checked out
- [ ] Confirm `npm install` has been run and `better-sqlite3` native bindings are compiled

---

## Phase 1: Database Layer

### Task 1.1: Update `listEmployees()` with dynamic filter support
- **File(s):** `src/db.js`
- **Description:** Add an optional `filters = {}` parameter to `listEmployees()`. Build a dynamic SQL `WHERE` clause that conditionally adds `(name LIKE ? OR title LIKE ?)` for a non-empty `search`, `AND salary >= ?` for a non-empty `minSalary`, and `AND salary <= ?` for a non-empty `maxSalary`. All user-supplied values must be bound via parameterized queries (never string interpolation) to prevent SQL injection. Ensure the function is backward-compatible when called with no arguments.
- **Depends on:** None
- **Parallel:** No

### Task 1.2: Update `getSummary()` with dynamic filter support
- **File(s):** `src/db.js`
- **Description:** Add the same optional `filters = {}` parameter to `getSummary()`. Reuse the same WHERE clause building logic (or extract a shared `buildWhereClause(filters)` helper) so headcount, total payroll, and average salary all reflect the filtered result set when any filter is active.
- **Depends on:** Task 1.1 (share WHERE clause logic)
- **Parallel:** No

---

## Phase 2: Server Controller

### Task 2.1: Add `parseFilterParams()` helper to `server.js`
- **File(s):** `src/server.js`
- **Description:** Create a `parseFilterParams(query)` function that extracts `search`, `minSalary`, and `maxSalary` from `req.query`. Trim whitespace from `search`. Coerce `minSalary` and `maxSalary` to integers; reject (return a validation error or null) non-integer or negative values. If both are present and `min > max`, return a validation error message so the banner can display it rather than silently returning zero results.
- **Depends on:** None
- **Parallel:** No

### Task 2.2: Update `redirectWithMessage()` to forward filter params [P]
- **File(s):** `src/server.js`
- **Description:** Extend the existing `redirectWithMessage(res, message)` signature to `redirectWithMessage(res, message, filters = {})`. Serialize non-empty filter values as additional query parameters on the `Location` URL so that CRUD operations (add, update, delete) return the user to the same filtered view. Keep the call signature backward-compatible for callers that don't pass `filters`.
- **Depends on:** Task 2.1
- **Parallel:** Yes (can run with 2.3)

### Task 2.3: Update `GET /` route handler to apply filters [P]
- **File(s):** `src/server.js`
- **Description:** In the `GET /` handler, call `parseFilterParams(req.query)` to obtain a `{ filters, error }` result. If a validation error is present, pass it as the banner message. Call `listEmployees(filters)` and `getSummary(filters)` instead of the current no-argument calls. Pass `filters` into `renderDashboard` so the filter bar renders pre-populated with current values.
- **Depends on:** Task 2.1, Task 1.1, Task 1.2
- **Parallel:** Yes (can run with 2.2)

---

## Phase 3: Rendering Layer

### Task 3.1: Add `renderFilterBar(filters)` helper to `render.js` [P]
- **File(s):** `src/render.js`
- **Description:** Create a `renderFilterBar(filters)` function that returns an HTML string containing: a `<form>` with `method="GET"` and `action="/"`, a text input for `search` (pre-populated from `filters.search`), number inputs for `minSalary` and `maxSalary` (pre-populated from filter values), a submit button ("Apply Filters"), a row of active filter badges (`.filter-tag`) for any non-empty filter value, and a "Clear Filters" link (href="/") that strips all params. Use `escapeHtml` on all rendered values.
- **Depends on:** None
- **Parallel:** Yes (can run with 3.2 and 3.4)

### Task 3.2: Add `renderEmptyState()` helper to `render.js` [P]
- **File(s):** `src/render.js`
- **Description:** Create a `renderEmptyState()` function that returns a styled HTML block (`.empty-state`) with a message like "No employees match the current filters." rendered in place of the employee table body when the filtered `employees` array is empty.
- **Depends on:** None
- **Parallel:** Yes (can run with 3.1 and 3.4)

### Task 3.3: Update `renderDashboard()` to accept and use filters
- **File(s):** `src/render.js`
- **Description:** Add `filters = {}` to the `renderDashboard` parameter object (or signature). Insert a `renderFilterBar(filters)` call above the roster table. Replace the table body with `renderEmptyState()` when `employees.length === 0`. Add a visual indicator on the summary stats section (e.g., a small "Filtered results" label) when any filter is active so users know the totals reflect the current filter.
- **Depends on:** Task 3.1, Task 3.2
- **Parallel:** No

### Task 3.4: Add CSS styles for filter components [P]
- **File(s):** `src/public/styles.css`
- **Description:** Append styles for `.filter-bar`, `.filter-controls`, `.filter-tag`, `.filter-tag-close`, `.filter-clear`, and `.empty-state`. The filter bar should use `flex-wrap: wrap` so it stacks gracefully at narrow viewport widths. Ensure styles are consistent with the existing palette and component style.
- **Depends on:** None
- **Parallel:** Yes (can run with 3.1 and 3.2)

---

## Phase 4: Testing

### Task 4.1: Create `src/test/filter.test.js` unit tests
- **File(s):** `src/test/filter.test.js`
- **Description:** Create the test file using `node:test` with an in-memory SQLite database seeded with known fixture records. Cover the following cases:
  - `listEmployees()` with no filters returns all employees
  - `listEmployees({ search: 'sophia' })` matches name (case-insensitive)
  - `listEmployees({ search: 'specialist' })` matches title
  - `listEmployees({ minSalary: 100000 })` excludes employees below threshold
  - `listEmployees({ maxSalary: 100000 })` excludes employees above threshold
  - `listEmployees({ minSalary: 90000, maxSalary: 160000 })` returns inclusive range
  - `listEmployees({ search: 'chen', minSalary: 100000 })` combined filter
  - `listEmployees({ search: 'zzz' })` returns empty array
  - `getSummary({ minSalary: 100000 })` headcount and totals reflect filtered set
- **Depends on:** Task 1.1, Task 1.2
- **Parallel:** No

### Task 4.2: Add `test` script to `package.json` [P]
- **File(s):** `package.json`
- **Description:** Add `"test": "node --test src/test/filter.test.js"` to the `scripts` section of `package.json`. Also add `"test:all": "node --test src/test/**/*.test.js"` for future extensibility.
- **Depends on:** None
- **Parallel:** Yes (can run with 4.1)

### Task 4.3: Run tests and confirm all pass
- **File(s):** `src/test/filter.test.js`
- **Description:** Execute `npm test` and confirm all unit tests pass with no failures. Fix any assertion errors, SQL logic bugs, or import issues before proceeding. Document any notable findings.
- **Depends on:** Task 4.1, Task 4.2
- **Parallel:** No

---

## Phase 5: Integration & Validation

### Task 5.1: Smoke test the full filter flow via curl
- **File(s):** `src/server.js` (running instance)
- **Description:** Start the app with `PORT=13001 node src/server.js` and run the following curl checks:
  - `curl "http://127.0.0.1:13001/?search=sophia"` – verify filtered HTML contains only matching rows
  - `curl "http://127.0.0.1:13001/?minSalary=150000"` – verify only high-salary employees appear
  - `curl "http://127.0.0.1:13001/?minSalary=90000&maxSalary=130000"` – verify range filter
  - `curl "http://127.0.0.1:13001/?search=zzz"` – verify empty-state message appears
  - `curl "http://127.0.0.1:13001/?minSalary=200000&maxSalary=50000"` – verify validation error appears
  - `curl "http://127.0.0.1:13001/health"` and `curl "http://127.0.0.1:13001/api/employees"` – verify unfiltered endpoints are unaffected
- **Depends on:** Task 2.3, Task 3.3
- **Parallel:** No

### Task 5.2: Validate spec.json against OpenSpec schema
- **File(s):** `.specify/specs/004-demo-add-employee-search-and-salary-range-filter/spec.json`
- **Description:** Run `npm run validate:openspec` and confirm it exits with code 0. Fix any schema violations before opening the PR.
- **Depends on:** None (can run any time after the spec file exists)
- **Parallel:** No

---

## Checkpoints

- [ ] **After Phase 1:** `listEmployees` and `getSummary` accept filters and return correct results in manual SQLite REPL test
- [ ] **After Phase 2:** `GET /?search=sophia` returns an HTML page that only shows matching employees
- [ ] **After Phase 3:** Filter bar renders above the roster, active badges appear, Clear Filters link works
- [ ] **After Phase 4:** `npm test` exits 0 with all unit test cases passing
- [ ] **After Phase 5:** All curl smoke tests pass; `npm run validate:openspec` exits 0; app is ready for PR
