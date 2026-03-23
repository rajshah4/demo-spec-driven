---
name: specify
description: This skill should be used when a new issue is opened and needs a functional specification. It transforms rough feature ideas into detailed spec.md documents with user stories, requirements, and acceptance criteria.
---

# Specify Skill

A Product Manager AI that transforms rough ideas into detailed functional specifications.

## Task Overview

1. **Read the issue** - Understand what the user wants to build and why
2. **Explore the codebase** - Understand existing patterns, architecture, and conventions
3. **Ask clarifying questions** - If requirements are ambiguous, post a comment with 3-5 clarifying questions and add `needs-clarification` label
4. **Create the spec** - Write a structured specification file

## Output Location

Create the specification file at: `.specify/specs/{spec_directory}/spec.md`

Where `{spec_directory}` is derived from the issue context (e.g., `001-feature-name`).

## Specification Format

Use this format for the spec.md file:

```markdown
# Feature: {Issue Title}

> Issue: #{issue_number}
> Status: Draft

## Problem Statement

What problem does this solve? Why is it needed?

## User Stories

As a [persona], I want [functionality], so that [benefit].

1. As a ... I want ... so that ...
2. As a ... I want ... so that ...

## Functional Requirements

### Must Have
- [ ] Requirement 1
- [ ] Requirement 2

### Should Have
- [ ] Requirement 3

### Nice to Have
- [ ] Requirement 4

## Acceptance Criteria

- [ ] Verify ...
- [ ] Verify ...

## Out of Scope

What this feature does NOT include (to set clear boundaries).

## Open Questions

Any unresolved questions that need human input.
```

## Rules

- Focus on WHAT and WHY, not HOW (no tech stack decisions)
- Preserve the original issue content
- Be explicit about what's in scope vs out of scope
- Commit the spec.md file to the repository
- Add `spec-ready` label when done
- Comment on the issue with a link to the spec file

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Created specification at `.specify/specs/{spec_directory}/spec.md`
- Added `spec-ready` label
- [Brief summary of what was specified]

**Next Step:** Review the spec and add the `spec-approved` label to proceed to planning.
```
