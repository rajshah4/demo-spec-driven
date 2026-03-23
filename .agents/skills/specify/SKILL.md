---
name: specify
description: This skill should be used when a new issue is opened and needs a functional specification. It transforms rough feature ideas into detailed spec.md documents with user stories, requirements, and acceptance criteria, while also posting clarifying questions.
---

# Specify Skill

A Product Manager AI that transforms rough ideas into detailed functional specifications.

## Task Overview

1. **Create feature branch** - All work happens on a feature branch, never directly on main
2. **Read the issue** - Understand what the user wants to build and why
3. **Explore the codebase** - Understand existing patterns, architecture, and conventions
4. **Create the spec** - Write an initial specification draft based on available information
5. **Post clarifying questions** - Post a comment with questions to help refine the spec

## Branch Management

**IMPORTANT**: All work must be done on the feature branch specified in the context (`feature_branch`).

1. Create the feature branch from main if it doesn't exist:
   ```bash
   git checkout -b {feature_branch} main
   ```
2. All commits go to this branch
3. Push the branch to origin after committing
4. **Never push directly to main**

## Output Location

Create the specification file at: `{spec_directory}/spec.md`

The `spec_directory` and `feature_branch` are provided in the context.

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
- **All work on the feature branch** - never push to main
- Commit the spec.md file to the feature branch
- Add `spec-ready` label when done
- Post clarifying questions as a comment on the issue

## Clarifying Questions

After creating the initial spec draft, post a comment on the issue with clarifying questions. This helps refine the requirements. Include:

1. **3-5 thoughtful questions** about ambiguous aspects of the request
2. **A link to the conversation** so users can provide detailed responses
3. Questions should focus on:
   - Unclear requirements or edge cases
   - User experience expectations
   - Integration with existing features
   - Priority of different aspects

Example comment format:
```markdown
## 📋 Initial Spec Created

I've created an initial specification based on the issue description. You can find it here: [spec.md]({spec_directory}/spec.md)

## ❓ Clarifying Questions

To help refine this specification, I have a few questions:

1. **[Question about scope]** - ...?
2. **[Question about user experience]** - ...?
3. **[Question about edge cases]** - ...?
4. **[Question about priorities]** - ...?

💬 **Please respond in the conversation** to discuss these questions: [conversation_url]

Your answers will help me refine the spec before moving to the planning phase.
```

## Responding to Feedback

If users provide responses in the conversation:
1. Update the spec.md file based on their feedback
2. Commit the changes to the feature branch
3. Update the tracking comment with what was changed

## Completion Summary

When the task is complete, update the tracking comment (identified by `tracking_comment_marker` in context) with a summary:

```markdown
<!-- openhands-tracking-comment -->
🤖 **Task Complete!** Track my progress here: [conversation_url](conversation_url)

---
## Summary

- Created feature branch: `{feature_branch}`
- Created specification at `{spec_directory}/spec.md`
- Posted clarifying questions for refinement
- Added `spec-ready` label

**Next Step:** Review the spec, answer any clarifying questions, then add the `spec-approved` label to proceed to planning.
```
