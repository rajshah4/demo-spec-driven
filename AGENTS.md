# Repository Memory

## Workflow overview
- GitHub Actions workflow: `.github/workflows/openhands-agent.yml`
- Event router: `.github/openhands/runner.py`
- Step skills: `.agents/skills/{specify,plan,tasks,implement}/SKILL.md`

## Comment behavior
- The runner posts a fresh step-started acknowledgement comment for issue-opened and label-triggered steps in the format: OK, working on `{step_name}`. [Track my progress here]({conversation_url}).
- User-facing step names are `spec`, `plan`, `task`, and `implement`.
- Step completion details should be posted as new issue comments from the skill instructions; the workflow no longer relies on updating a previous tracking comment.

## Verification
- `python -m py_compile .github/openhands/runner.py`
- `npm install`
- `PORT=12000 npm start`
- `curl http://127.0.0.1:12000/health`

## Workflow notes
- The expected spec artifacts may be incomplete on long-running step chains; issue #1 reached the task step without a `plan.md` file in `.specify/specs/001-demo-add-employee-search-and-salary-range-filter/`, so verify the spec directory contents before assuming prior-step outputs exist.

## Payroll app example
- Express + SQLite payroll dashboard lives in `src/`.
- Entry point: `src/server.js`.
- Database module: `src/db.js`, storing local data in `data/payroll.sqlite`.
- Renderer and styling: `src/render.js` and `src/public/styles.css`.
- The database seeds 6 employee records on first run.
- Manager `<select>` options in `src/render.js` are derived from the employee collection passed into `renderDashboard`, so filtered views need separate access to the full roster to avoid hiding valid manager choices.
- Dashboard filters now live in `src/dashboardFilters.js`; the helper normalizes `search`, `minSalary`, and `maxSalary`, preserves safe return-to state for CRUD redirects, and rejects non-dashboard redirect targets.
- `src/db.js` supports a `PAYROLL_DB_PATH` environment override and exports `closeDatabase()` so integration tests can run against isolated SQLite files without touching `data/payroll.sqlite`.

