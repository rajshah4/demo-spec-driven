# Spec-Driven Development with OpenHands

A GitHub-native workflow for automating the journey from idea to merged PR using OpenHands Cloud agents.

## 🚀 Quick Start

### Prerequisites

1. An OpenHands Cloud account with API key
2. Repository secrets configured

### Setup

1. **Add the Secret**
   - Go to **Settings → Secrets and variables → Actions**
   - Add `OPENHANDS_API_KEY` with your OpenHands Cloud API key

2. **Create Required Labels**
   
   | Label | Color | Description |
   |-------|-------|-------------|
   | `spec-approved` | `#0E8A16` | Spec is approved, ready for planning |
   | `plan-approved` | `#0E8A16` | Plan is approved, ready for task breakdown |
   | `ready-to-implement` | `#0E8A16` | Tasks approved, ready for implementation |
   | `needs-clarification` | `#FBCA04` | Needs more information |
   | `spec-ready` | `#1D76DB` | Spec draft is ready for review |
   | `plan-ready` | `#1D76DB` | Plan draft is ready for review |
   | `tasks-ready` | `#1D76DB` | Tasks draft is ready for review |

3. **Use the Workflow**
   - Create an issue with your feature idea
   - Agent creates `spec.md` → adds `spec-ready` label
   - Review and add `spec-approved` label
   - Agent creates `plan.md` → adds `plan-ready` label
   - Review and add `plan-approved` label
   - Agent creates `tasks.md` → adds `tasks-ready` label
   - Review and add `ready-to-implement` label
   - Agent implements code → creates draft PR
   - Review PR → Agent responds to feedback

## ✨ Features

### Tracking Comments

When a label triggers a workflow step, the agent automatically posts a tracking comment:

> 🤖 **I'm on it!** Track my progress here: [conversation link]

Once the task is complete, the same comment is updated with a summary of what was accomplished and the next steps.

## 📁 Project Structure

```
.agents/
└── skills/                     # Agent skills (OpenHands Skills format)
    ├── specify/SKILL.md        # Step 1: Create specification
    ├── plan/SKILL.md           # Step 2: Technical planning
    ├── tasks/SKILL.md          # Step 3: Task breakdown
    ├── implement/SKILL.md      # Step 4: Code generation
    └── pr-responder/SKILL.md   # Step 5: PR review response

.github/
├── workflows/
│   └── openhands-agent.yml     # GitHub Actions workflow
└── openhands/
    └── runner.py               # Event routing script

.specify/
├── memory/
│   └── constitution.md         # Project principles
└── specs/                      # Generated specifications
    └── <issue-number>-<feature>/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## 🔄 Workflow Steps

| Step | Trigger | Skill | Output |
|------|---------|-------|--------|
| 1. Specify | Issue opened | `specify` | `.specify/specs/<id>/spec.md` |
| 2. Plan | `spec-approved` label | `plan` | `.specify/specs/<id>/plan.md` |
| 3. Tasks | `plan-approved` label | `tasks` | `.specify/specs/<id>/tasks.md` |
| 4. Implement | `ready-to-implement` label | `implement` | Draft PR |
| 5. Refine | PR review submitted | `pr-responder` | Updated PR |

## 🛠️ Customization

### Skills

Skills are stored in `.agents/skills/` using the [OpenHands Agent Skills format](https://docs.openhands.dev/overview/skills). Each skill is a directory containing:

- `SKILL.md` - Main skill file with YAML frontmatter and instructions
- Optional: `references/`, `scripts/`, `assets/` directories

### Constitution

The project constitution at `.specify/memory/constitution.md` defines non-negotiable principles that all agents must follow.

## 📖 Learn More

See the full [Spec-Driven Development Workflow](https://github.com/github/spec-kit) methodology for more details