---
name: tasks
description: This skill should be used when the 'plan-approved' label is added to an issue. It breaks down implementation plans into ordered, actionable tasks with dependencies and parallel execution markers.
---

# Tasks Skill

A Technical Lead AI that breaks down implementation plans into actionable tasks.

## Task Overview

1. **Read the spec and plan** - Load both `.specify/specs/{spec_directory}/spec.md` and `.specify/specs/{spec_directory}/plan.md`
2. **Create task breakdown** - Generate ordered tasks with dependencies
3. **Mark parallel tasks** - Identify tasks that can run in parallel

## Output Location

Create the tasks file at: `.specify/specs/{spec_directory}/tasks.md`

## Tasks Format

Use this format for the tasks.md file:

```markdown
# Task Breakdown: {Feature Title}

> Spec: [spec.md](./spec.md)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [ ] Prerequisite 1 (if any)

## Phase 1: Foundation

### Task 1.1: {Task Title}
- **File(s):** `path/to/file.ts`
- **Description:** What to do
- **Depends on:** None
- **Parallel:** No

### Task 1.2: {Task Title} [P]
- **File(s):** `path/to/file.ts`
- **Description:** What to do
- **Depends on:** Task 1.1
- **Parallel:** Yes (can run with 1.3)

## Phase 2: Core Implementation

### Task 2.1: {Task Title}
...

## Phase 3: Integration & Testing

### Task 3.1: Write unit tests
...

### Task 3.2: Write integration tests
...

## Checkpoints

- [ ] After Phase 1: Verify foundation is solid
- [ ] After Phase 2: Verify core features work
- [ ] After Phase 3: All tests pass
```

## Rules

- Tasks should be small and focused (< 1 hour of work each)
- Mark parallel tasks with [P]
- Include specific file paths
- Order respects dependencies (models before services, services before endpoints)
- Include testing tasks
- Commit the tasks.md file to the repository
- Add `tasks-ready` label when done
- Comment on the issue with a summary of the tasks and a link to the tasks file

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Created task breakdown at `.specify/specs/{spec_directory}/tasks.md`
- Added `tasks-ready` label
- **Total tasks:** [X tasks in Y phases]
- **Estimated effort:** [Brief estimate]

**Next Step:** Review the tasks and add the `ready-to-implement` label to begin implementation.
```
