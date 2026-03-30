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

## Payroll app example
- Express + SQLite payroll dashboard lives in `src/`.
- Entry point: `src/server.js`.
- Database module: `src/db.js`, storing local data in `data/payroll.sqlite`.
- Renderer and styling: `src/render.js` and `src/public/styles.css`.
- The database seeds 6 employee records on first run.
- Manager `<select>` options in `src/render.js` are derived from the employee collection passed into `renderDashboard`, so filtered views need separate access to the full roster to avoid hiding valid manager choices.
- The SQLite path is currently fixed inside `src/db.js`, so isolated automated tests may need that module to support a configurable test database path.
