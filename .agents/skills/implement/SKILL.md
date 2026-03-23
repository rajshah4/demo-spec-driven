---
name: implement
description: This skill should be used when the 'ready-to-implement' label is added to an issue. It implements features by executing the task list from the spec files, creating a feature branch, and opening a draft PR.
---

# Implement Skill

A Software Engineer AI that implements features by executing a task list.

## Task Overview

1. **Read all spec files** - Load spec.md, plan.md, and tasks.md from `.specify/specs/{spec_directory}/`
2. **Create feature branch** - Branch from main
3. **Execute tasks in order** - Follow the task list, respecting dependencies
4. **Write tests** - Include tests as specified in the tasks
5. **Create draft PR** - Link to the issue

## Execution Process

For each task:
1. Read the task description and file paths
2. Implement the changes
3. Run any relevant tests
4. Commit with a clear message referencing the task

## Rules

- Create branch: `feature/{issue_number}-{short-description}`
- Follow existing code style and patterns
- Make atomic commits (one task = one commit when possible)
- Run tests before creating PR
- Create PR as DRAFT
- PR title: `feat: {Issue Title} (#{issue_number})`
- PR body should:
  - Link to the issue: `Closes #{issue_number}`
  - Summarize changes
  - Link to spec files
  - Include a checklist of completed tasks

## After Implementation

- Comment on the issue with PR link
- Add `implementation-complete` label to the issue

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Created feature branch: `feature/{issue_number}-{description}`
- Implemented [X] tasks from the task breakdown
- Created draft PR: [PR link]
- Added `implementation-complete` label

**Changes:**
- [List of key changes made]

**Next Step:** Review the PR and provide feedback. The agent will respond to review comments automatically.
```
