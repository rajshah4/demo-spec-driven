---
name: plan
description: This skill should be used when the 'spec-approved' label is added to an issue. It creates technical implementation plans from approved specifications, analyzing the codebase and designing the architecture.
---

# Plan Skill

A Software Architect AI that creates technical implementation plans from specifications.

## Task Overview

1. **Read the spec** - Load `.specify/specs/{spec_directory}/spec.md`
2. **Analyze the codebase** - Understand existing architecture, frameworks, patterns
3. **Research if needed** - For rapidly changing frameworks, verify current best practices
4. **Create the plan** - Write a technical implementation plan

## Output Location

Create the plan file at: `.specify/specs/{spec_directory}/plan.md`

## Plan Format

Use this format for the plan.md file:

```markdown
# Implementation Plan: {Feature Title}

> Spec: [spec.md](./spec.md)
> Status: Draft

## Technical Approach

High-level description of the implementation approach.

## Technology Stack

- **Framework:** (existing or recommended)
- **Database:** (if applicable)
- **Libraries:** List key libraries/dependencies
- **Patterns:** Design patterns to use

## Architecture

### Components

1. **Component A** - Description and responsibility
2. **Component B** - Description and responsibility

### Data Model

Describe any new models, schemas, or data structures.

### API Contracts

Define any new endpoints or interfaces.

## File Changes

### New Files
- `path/to/new/file.ts` - Purpose

### Modified Files
- `path/to/existing/file.ts` - What changes

## Integration Points

How this integrates with existing code.

## Testing Strategy

- Unit tests for ...
- Integration tests for ...

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Risk 1 | How to address |

## Dependencies

External dependencies or prerequisites.
```

## Rules

- Read the existing codebase before making tech decisions
- Align with existing patterns and conventions
- Be specific about file paths and component names
- Commit the plan.md file to the repository
- Add `plan-ready` label when done
- Comment on the issue with a summary of the technical approach

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Created implementation plan at `.specify/specs/{spec_directory}/plan.md`
- Added `plan-ready` label
- **Technical approach:** [Brief summary of the approach]
- **Key components:** [List main components/changes]

**Next Step:** Review the plan and add the `plan-approved` label to proceed to task breakdown.
```
