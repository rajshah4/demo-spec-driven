# Task Breakdown: Demo: Add employee search and salary range filter

> Spec: [spec.md](./spec.md)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [ ] Confirm the plan assumption that summary cards remain based on the full employee roster unless reviewers explicitly choose filtered summaries.

## Phase 1: Foundation

### Task 1.1: Extract dashboard filter parsing and return-state helpers
- **File(s):** `src/dashboardFilters.js`, `src/server.js`
- **Description:** Introduce a small helper for normalizing `search`, `minSalary`, and `maxSalary`, validating contradictory ranges, and safely serializing a local dashboard return target so server logic stays focused and reusable.
- **Depends on:** None
- **Parallel:** No

### Task 1.2: Establish isolated dashboard test coverage [P]
- **File(s):** `package.json`, `src/db.js`, `test/dashboard.test.js`
- **Description:** Add a `test` script plus a lightweight integration harness that can run the Express app against an isolated SQLite database path instead of mutating `data/payroll.sqlite`.
- **Depends on:** None
- **Parallel:** Yes (can run with 1.1)

## Phase 2: Filtered Data Flow

### Task 2.1: Add parameterized filter-aware employee queries
- **File(s):** `src/db.js`
- **Description:** Extend employee listing access to support case-insensitive partial name/title matching and inclusive min/max salary filtering while preserving the current unfiltered default query.
- **Depends on:** Task 1.1
- **Parallel:** No

### Task 2.2: Pass filtered and full-roster data through request handlers
- **File(s):** `src/server.js`, `src/db.js`
- **Description:** Use the parsed filter state in `GET /` and `GET /api/employees`, keep summary cards on full-roster data by default, and pass both the filtered roster and full employee list where the renderer needs unfiltered manager options.
- **Depends on:** Task 1.1, Task 2.1
- **Parallel:** No

## Phase 3: Dashboard UI

### Task 3.1: Render filter controls, active state, and empty results
- **File(s):** `src/render.js`
- **Description:** Add a GET-based filter form, keep submitted values populated, show active-filter summary and validation guidance, provide a clear-all action, and render a no-results state when the filtered roster is empty.
- **Depends on:** Task 2.2
- **Parallel:** No

### Task 3.2: Style the filter experience and empty states [P]
- **File(s):** `src/public/styles.css`
- **Description:** Add layout and presentation rules for the filter bar, active-filter summary, validation banner, and empty-state components so the new controls remain easy to scan during demos across desktop and mobile layouts.
- **Depends on:** Task 2.2
- **Parallel:** Yes (can run with 3.1)

## Phase 4: CRUD Continuity & Verification

### Task 4.1: Preserve safe filtered return behavior for CRUD actions
- **File(s):** `src/server.js`, `src/dashboardFilters.js`, `src/render.js`
- **Description:** Add validated hidden return targets (or equivalent query preservation) to create, update, and delete flows so successful mutations land back on the current filtered dashboard without introducing unsafe redirects.
- **Depends on:** Task 1.1, Task 3.1
- **Parallel:** No

### Task 4.2: Add regression coverage for filter behavior and CRUD continuity
- **File(s):** `package.json`, `src/db.js`, `test/dashboard.test.js`
- **Description:** Verify name search, title search, min-only and max-only filtering, inclusive salary ranges, invalid salary handling, active-filter rendering, clear-all behavior, empty states, and unchanged CRUD workflows with filtered return context.
- **Depends on:** Task 1.2, Task 2.2, Task 3.1, Task 3.2, Task 4.1
- **Parallel:** No

## Checkpoints

- [ ] After Phase 1: Filter helpers and isolated test setup are in place
- [ ] After Phase 2: Backend filtering works for dashboard and API handlers without changing summary defaults
- [ ] After Phase 3: UI clearly shows filters, validation, and no-results feedback
- [ ] After Phase 4: CRUD flows preserve dashboard context and all automated tests pass
