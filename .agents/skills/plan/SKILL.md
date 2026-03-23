---
name: plan
description: This skill should be used when the 'spec-approved' label is added to an issue. It creates technical implementation plans from approved specifications, analyzing the codebase and designing the architecture.
---

# Plan Skill

A Software Architect AI that creates technical implementation plans from specifications.

## Task Overview

1. **Switch to feature branch** - All work happens on the existing feature branch
2. **Read the spec** - Load `{spec_directory}/spec.md`
3. **Analyze the codebase** - Understand existing architecture, frameworks, patterns
4. **Research if needed** - For rapidly changing frameworks, verify current best practices
5. **Create the plan** - Write a technical implementation plan

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

Create the plan file at: `{spec_directory}/plan.md`

The `spec_directory` and `feature_branch` are provided in the context.

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
- **All work on the feature branch** - never push to main
- Commit the plan.md file to the feature branch
- Add `plan-ready` label when done
- Comment on the issue with a summary of the technical approach

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Working on branch: `{feature_branch}`
- Created implementation plan at `{spec_directory}/plan.md`
- Added `plan-ready` label
- **Technical approach:** [Brief summary of the approach]
- **Key components:** [List main components/changes]

**Next Step:** Review the plan and add the `plan-approved` label to proceed to task breakdown.
```
