# Implementation Plan: Add Employee Search and Salary Range Filter

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

Extend the existing `GET /` route to accept `search`, `minSalary`, and `maxSalary` query parameters, applying all filtering server-side via SQLite (consistent with the app's established SSR pattern). Filter parameters are parsed and validated in `server.js`, forwarded to updated `db.js` functions that build dynamic WHERE clauses, and threaded through to `render.js`, which renders a filter bar above the roster, active filter badges with a clear button, filtered summary stats, and an empty-state message when no employees match. Filter state is preserved through CRUD redirects by appending query params to the redirect URL.

## Technology Stack

- **Framework:** Express 4 (existing)
- **Database:** SQLite via `better-sqlite3` (existing)
- **Templating:** Server-side string templates (existing `render.js` pattern)
- **Testing:** Node.js built-in `node:test` runner (no additional dependencies required)
- **Patterns:** Dynamic SQL WHERE clauses, `escapeHtml`, query-param state, `redirectWithMessage` extension

## Architecture

### Components

1. **Filter-aware `listEmployees(filters)`** – Updated `db.js` function that builds a dynamic WHERE clause from an optional `{ search, minSalary, maxSalary }` object, matching `name` or `title` for the text search (case-insensitive via SQLite `LIKE`), and bounding salary with `>=` / `<=` predicates.
2. **Filter-aware `getSummary(filters)`** – Updated `db.js` function that applies the same WHERE clause so summary stats (headcount, total payroll, average salary) reflect the filtered result set when filters are active.
3. **Filter param parser/validator** – New `parseFilterParams(query)` helper in `server.js` that extracts, trims, and validates `search`, `minSalary`, and `maxSalary` from `req.query`, rejecting non-integer or negative salary values and coercing min > max into a validation error or safe swap.
4. **Filter-aware redirect helper** – `redirectWithMessage(res, message, filters)` updated to preserve active filter params in the `Location` header so CRUD operations return the user to the same filtered view.
5. **`renderFilterBar(filters)`** – New helper in `render.js` that renders the search input, min/max salary inputs, an Apply button (form submit), active filter badges, and a Clear Filters link that removes all params.
6. **`renderEmptyState()`** – New helper in `render.js` that returns a styled empty-state message when the filtered employee list is empty.
7. **CSS additions** – `.filter-bar`, `.filter-controls`, `.filter-tag`, `.empty-state` rules appended to `styles.css`.

### Data Model

No schema changes. All filtering is applied at query time via the existing `employees` table:

```sql
-- Example generated WHERE clause (params bound via prepared statement values)
WHERE
  (name LIKE '%' || ? || '%' OR title LIKE '%' || ? || '%')
  AND salary >= ?
  AND salary <= ?
```

Clauses are added conditionally only when the corresponding filter value is present.

### API Contracts

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/` | `search`, `minSalary`, `maxSalary`, `message` | Dashboard. Returns filtered roster and stats. All params optional. |
| `POST` | `/employees` | — | Unchanged. Redirect preserves active filters. |
| `POST` | `/employees/:id/update` | — | Unchanged. Redirect preserves active filters. |
| `POST` | `/employees/:id/delete` | — | Unchanged. Redirect preserves active filters. |

## File Changes

### New Files

- `src/test/filter.test.js` – Unit tests for `listEmployees` filter combinations and `getSummary` with filters using `node:test` and an in-memory SQLite database.

### Modified Files

- `src/db.js` – Update `listEmployees()` to accept an optional `filters` object and build a dynamic WHERE clause; update `getSummary()` similarly; export both with backward-compatible default parameter (`filters = {}`).
- `src/server.js` – Add `parseFilterParams(query)` helper; update `GET /` handler to parse filters and pass them to `listEmployees` and `getSummary`; update `redirectWithMessage` to accept and forward filter params; import no new packages.
- `src/render.js` – Add `renderFilterBar(filters)` helper; add `renderEmptyState()` helper; update `renderDashboard` signature to accept `filters`; insert filter bar above the roster table; show filtered stats label when any filter is active; render empty state in place of table body when employees list is empty.
- `src/public/styles.css` – Add styles for `.filter-bar`, `.filter-controls`, `.filter-tag`, `.filter-tag-close`, `.filter-clear`, and `.empty-state`.

## Integration Points

- **`GET /` route** is the sole entry point changed. All CRUD POST routes redirect to `GET /` (via `redirectWithMessage`), so filter preservation is fully handled there without touching route logic for add/update/delete.
- **`renderDashboard`** receives a `filters` prop alongside `employees`, `summary`, and `message`; no other render functions require changes.
- **`/api/employees`** and **`/health`** endpoints are unaffected (no filter support needed on JSON API endpoints per scope).

## Testing Strategy

- **Unit tests (`src/test/filter.test.js`)** using `node:test`:
  - `listEmployees()` with no filters returns all employees
  - `listEmployees({ search: 'sophia' })` returns only matching name (case-insensitive)
  - `listEmployees({ search: 'specialist' })` returns only matching title
  - `listEmployees({ minSalary: 100000 })` excludes employees below threshold
  - `listEmployees({ maxSalary: 100000 })` excludes employees above threshold
  - `listEmployees({ minSalary: 90000, maxSalary: 160000 })` returns inclusive range
  - `listEmployees({ search: 'chen', minSalary: 100000 })` combined filter
  - `listEmployees({ search: 'zzz' })` returns empty array
  - `getSummary({ minSalary: 100000 })` headcount and totals reflect filtered set
- **Integration smoke test** via `curl` commands documented in `AGENTS.md` (existing pattern)

Add a `test` script to `package.json`:

```json
"test": "node --test src/test/filter.test.js"
```

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SQL injection via filter inputs | Use parameterized values (never string interpolation) for all user-supplied filter values in SQLite queries |
| `min > max` salary range producing zero results silently | Validate in `parseFilterParams`: if both present and min > max, surface a visible error message via the banner instead of returning empty results |
| Redirect loop if message + filter params exceed URL length | Search and salary values are short; no practical risk at demo scale |
| Filter bar clutters existing layout on small screens | Filter bar uses a responsive `flex-wrap` layout that stacks vertically below the existing media-query breakpoints |
| Existing CRUD redirects lose filter state | `redirectWithMessage` updated to accept and re-append filter params to the redirect URL |

## Dependencies

No new npm packages required. All implementation uses:
- `better-sqlite3` (already installed) for dynamic prepared queries
- `node:test` (built into Node.js ≥ 18) for unit tests
- Native Express query string parsing (`req.query`) already enabled
