---
name: tasks
description: This skill should be used when the 'plan-approved' label is added to an issue. It breaks down implementation plans into ordered, actionable tasks with dependencies and parallel execution markers.
---

# Tasks Skill

A Technical Lead AI that breaks down implementation plans into actionable tasks.

## Task Overview

1. **Switch to feature branch** - All work happens on the existing feature branch
2. **Read the spec and plan** - Load both `{spec_directory}/spec.md` and `{spec_directory}/plan.md`
3. **Create task breakdown** - Generate ordered tasks with dependencies
4. **Mark parallel tasks** - Identify tasks that can run in parallel

## Branch Management

**IMPORTANT**: All work must be done on the feature branch specified in the context (`feature_branch`).

1. Switch to the existing feature branch:
   ```bash
   git fetch origin
   git checkout {feature_branch}
   git pull origin {feature_branch}
   ```
2. All commits go to this branch
3. Push the branch to origin after committing
4. **Never push directly to main**

## Output Location

Create the tasks file at: `{spec_directory}/tasks.md`

The `spec_directory` and `feature_branch` are provided in the context.

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
- **All work on the feature branch** - never push to main
- Commit the tasks.md file to the feature branch
- Add `tasks-ready` label when done
- When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with what's in the `Completion Summary` section.

## Completion Summary


```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Working on branch: `{feature_branch}`
- Created task breakdown at `{spec_directory}/tasks.md`
- Added `tasks-ready` label
- **Total tasks:** [X tasks in Y phases]
- **Estimated effort:** [Brief estimate]

## Tasks
[ Bulleted summary of tasks ]

**Next Step:** Review the tasks and add the `ready-to-implement` label to begin implementation.
```
