# Implementation Plan: Demo: Add employee search and salary range filter

> Spec: [spec.md](./spec.md)
> Status: Draft

## Technical Approach

Implement dashboard filtering as server-rendered GET query parameters so the page can preserve filter state across refreshes and links without introducing client-side state management. The request layer will parse and validate a `search`, `minSalary`, and `maxSalary` filter object, pass that object into the existing SQLite-backed employee listing flow, and render the filtered roster plus a visible active-filter summary and clear action.

To keep existing CRUD behavior stable, the dashboard should continue to use the current POST create/update/delete routes, but those forms should preserve the current filtered return URL so users stay in context after a mutation. The implementation should keep top-level payroll summary cards on the existing full-roster dataset unless the open question in the spec is clarified otherwise, and only the roster/editing surfaces should reflect the active filters.

## Technology Stack

- **Framework:** Existing Express server-rendered application (`src/server.js`)
- **Database:** Existing SQLite database via `better-sqlite3`
- **Libraries:** Existing runtime dependencies; add a lightweight HTTP test dependency only if needed (for example `supertest`) alongside Node's built-in `node:test`
- **Patterns:** Parameterized SQL filtering, server-side form/query parsing, renderer-driven HTML composition, progressive enhancement through GET filters

## Architecture

### Components

1. **Dashboard filter parsing (`src/server.js` or a small helper module)** - Normalize query params, trim search input, validate salary bounds, and produce a safe filter state plus any non-fatal validation feedback.
2. **Filtered employee query (`src/db.js`)** - Extend employee listing to accept optional search and salary constraints using parameterized SQL while preserving the current default unfiltered behavior.
3. **Dashboard renderer updates (`src/render.js`)** - Render filter controls, active-filter summary, clear action, empty state, and filter-preserving CRUD form actions.
4. **Presentation styling (`src/public/styles.css`)** - Add layout and visual treatment for the filter bar, filter chips/summary, validation guidance, and empty results state.
5. **Regression and feature tests (`test/`)** - Verify filtering, validation, empty state, clear action, and unchanged CRUD flows with automated coverage.

### Data Model

No database schema changes are required.

Add an application-level dashboard filter state object passed from the request layer to the renderer, for example:

```js
{
  search: '',
  minSalary: '',
  maxSalary: '',
  applied: {
    search: null,
    minSalary: null,
    maxSalary: null,
  },
  hasActiveFilters: false,
  validationMessage: ''
}
```

Implementation should also preserve a safe local return path/query string for POST actions so create/update/delete redirects can return users to the filtered dashboard view.

### API Contracts

No new endpoints are required.

#### `GET /`

Support optional query parameters:

- `search` - case-insensitive partial match against employee name and title
- `minSalary` - inclusive lower salary bound
- `maxSalary` - inclusive upper salary bound
- `message` - existing flash-style banner message

Behavior:

- Blank filter values behave as unset.
- Invalid salary inputs should not crash the page.
- If `minSalary > maxSalary`, render a helpful validation message and avoid applying an invalid salary range.
- The response should keep form inputs populated with the submitted values.

#### Existing POST routes

- `POST /employees`
- `POST /employees/:id/update`
- `POST /employees/:id/delete`

Keep existing payloads and side effects unchanged, but add a validated hidden return target (or equivalent query-string preservation) so redirects can land back on the current filtered dashboard state.

## File Changes

### New Files
- `.specify/specs/001-demo-add-employee-search-and-salary-range-filter/plan.md` - Technical implementation plan for this feature
- `test/dashboard.test.js` - End-to-end server-rendering tests for filters, validation, empty states, clear action, and CRUD regressions
- `src/dashboardFilters.js` - Small helper module for parsing/serializing dashboard filter state and validating safe return URLs (recommended if server logic starts to grow)

### Modified Files
- `package.json` - Add a `test` script and any minimal dev dependency required for HTTP-level tests
- `src/server.js` - Parse filter query params, fetch filtered and unfiltered datasets as needed, preserve return-to state on redirects, and pass filter metadata into the renderer
- `src/db.js` - Extend `listEmployees` to support optional parameterized search/min/max salary filters; optionally allow a configurable DB path for isolated tests
- `src/render.js` - Add filter form, active-filter summary, clear button, no-results state, and hidden return state in CRUD forms
- `src/public/styles.css` - Style the new filter controls, active-filter UI, validation message, and empty-state components

## Integration Points

- **Request → data layer:** `src/server.js` will translate `req.query` into a validated filter object and call `listEmployees(filters)`.
- **Data layer → renderer:** The server should pass both the filtered employee list and the full employee roster to the renderer so manager dropdowns still include all employees even when the visible roster is filtered.
- **Renderer → existing CRUD routes:** Create/update/delete forms should include a safe hidden return target so redirects preserve the current dashboard context.
- **Testing → database setup:** Tests should run against an isolated SQLite file or temporary database path to avoid mutating `data/payroll.sqlite` during CI.

## Testing Strategy

- Unit tests for filter parsing/validation rules if a dedicated helper module is introduced
- Integration tests for `GET /` covering:
  - name search
  - title search
  - min-only salary filtering
  - max-only salary filtering
  - inclusive min/max range filtering
  - invalid salary inputs and `minSalary > maxSalary`
  - active-filter summary and clear action rendering
  - empty-state rendering when no employees match
- Regression tests for create, update, and delete flows to ensure they still succeed and can preserve a filtered return view

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Filtered datasets accidentally restrict manager dropdown choices | Pass the full employee roster separately for manager option rendering while only filtering the visible roster/cards |
| Invalid or contradictory salary inputs create confusing behavior | Centralize validation, keep entered values visible, and render a clear guidance message instead of throwing or breaking rendering |
| Query-string preservation introduces open redirect or unsafe navigation behavior | Only allow local dashboard return paths and validate/sanitize any hidden return target before redirecting |
| Test coverage is hard to add because the SQLite path is currently fixed | Make the DB path configurable for tests or initialize the database from a temporary file during test setup |
| Summary card behavior is ambiguous because the spec leaves it open | Preserve current full-roster summary behavior by default and call out the assumption for reviewer confirmation |

## Dependencies

- Existing runtime dependencies are sufficient for the feature itself
- A minimal test dependency may be added if HTTP-level assertions are cumbersome with built-in tools alone
- Reviewer confirmation on the spec's open question: whether summary cards should remain global or reflect the filtered employee subset
