#!/usr/bin/env python3
"""
OpenHands Agent Runner - Routes GitHub events to appropriate skills.

This script:
1. Parses the GitHub event to determine which skill to invoke
2. Creates a tracking comment on the issue with conversation URL
3. Constructs a self-contained prompt with full context
4. Creates an OpenHands Cloud conversation to execute the skill
5. The agent will update the tracking comment with a summary when done
"""

import json
import os
import sys
from pathlib import Path

import httpx

# ============================================================================
# CONFIGURATION
# ============================================================================

# Skills are stored in .agents/skills/ directory (Agent Skills format)
REPO_ROOT = Path(__file__).parent.parent.parent
SKILLS_DIR = REPO_ROOT / ".agents" / "skills"
OPENHANDS_API_URL = "https://app.all-hands.dev/api/v1"
GITHUB_API_URL = "https://api.github.com"

# Routing rules: (event_name, action, label, skill_name)
# label=None means "no specific label required"
# For labeled events, only the newly added label triggers the skill
ROUTING_RULES = [
    # Step 1: New issue -> SPECIFY (create spec)
    ("issues", "opened", None, "specify"),
    
    # Step 2: Spec approved -> PLAN (create technical plan)
    ("issues", "labeled", "spec-approved", "plan"),
    
    # Step 3: Plan approved -> TASKS (break down into tasks)
    ("issues", "labeled", "plan-approved", "tasks"),
    
    # Step 4: Ready to implement -> IMPLEMENT (write code)
    ("issues", "labeled", "ready-to-implement", "implement"),
    
    # Step 5: PR review -> respond to feedback
    ("pull_request_review", "submitted", None, "pr-responder"),
]


# ============================================================================
# OPENHANDS CLOUD CLIENT
# ============================================================================

class GitHubClient:
    """Minimal client for GitHub API operations."""
    
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        }
    
    def create_issue_comment(self, repo: str, issue_number: int, body: str) -> dict:
        """Create a comment on an issue."""
        resp = httpx.post(
            f"{GITHUB_API_URL}/repos/{repo}/issues/{issue_number}/comments",
            headers=self.headers,
            json={"body": body},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    
    def update_issue_comment(self, repo: str, comment_id: int, body: str) -> dict:
        """Update an existing comment."""
        resp = httpx.patch(
            f"{GITHUB_API_URL}/repos/{repo}/issues/comments/{comment_id}",
            headers=self.headers,
            json={"body": body},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()


class OpenHandsCloudWorkspace:
    """Minimal client for creating OpenHands Cloud conversations."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
    
    def create_conversation(
        self,
        initial_message: str,
        repository: str,
        branch: str = "main",
        title: str | None = None,
    ) -> dict:
        """Start a new OpenHands Cloud conversation."""
        payload = {
            "initial_message": {
                "role": "user",
                "content": [{"type": "text", "text": initial_message}],
                "run": True,
            },
            "selected_repository": repository,
            "selected_branch": branch,
        }
        if title:
            payload["title"] = title
        
        resp = httpx.post(
            f"{OPENHANDS_API_URL}/app-conversations",
            headers=self.headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()
    
    def get_conversation_url(self, conversation_id: str) -> str:
        return f"https://app.all-hands.dev/conversations/{conversation_id}"


# ============================================================================
# SKILL & CONTEXT HELPERS
# ============================================================================

def load_skill(skill_name: str) -> str:
    """Load skill prompt from SKILL.md file (Agent Skills format)."""
    skill_path = SKILLS_DIR / skill_name / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill not found: {skill_path}")
    return skill_path.read_text()


def load_constitution() -> str | None:
    """Load project constitution if it exists."""
    constitution_path = Path(".specify/memory/constitution.md")
    if constitution_path.exists():
        return constitution_path.read_text()
    return None


def get_spec_directory(issue_number: int, issue_title: str) -> str:
    """Generate spec directory path from issue number and title."""
    # Sanitize title for directory name
    slug = issue_title.lower()
    slug = "".join(c if c.isalnum() or c == " " else "" for c in slug)
    slug = "-".join(slug.split())[:50]
    return f".specify/specs/{issue_number:03d}-{slug}"


# ============================================================================
# EVENT ROUTING
# ============================================================================

def determine_skill(event_name: str, action: str, event_label: str | None, labels: list[str]) -> str | None:
    """Determine which skill to run based on the event."""
    for rule_event, rule_action, rule_label, skill in ROUTING_RULES:
        if event_name != rule_event or action != rule_action:
            continue
        
        # For labeled events, check if the newly added label matches
        if rule_label is not None:
            if event_label == rule_label:
                return skill
        else:
            # No label required
            return skill
    
    return None


def build_context(event: dict, event_name: str) -> dict:
    """Extract relevant context from GitHub event."""
    repo = event.get("repository", {}).get("full_name", "")
    
    if event_name in ("issues", "issue_comment"):
        issue = event.get("issue", {})
        issue_number = issue.get("number")
        issue_title = issue.get("title", "feature")
        
        context = {
            "type": "issue",
            "number": issue_number,
            "title": issue_title,
            "body": issue.get("body"),
            "url": issue.get("html_url"),
            "labels": [l.get("name") for l in issue.get("labels", [])],
            "repository": repo,
            "spec_directory": get_spec_directory(issue_number, issue_title),
        }
        
        # Include comment if this is a comment event
        if event_name == "issue_comment":
            comment = event.get("comment", {})
            context["comment"] = {
                "body": comment.get("body"),
                "user": comment.get("user", {}).get("login"),
            }
        
        return context
    
    elif event_name == "pull_request_review":
        pr = event.get("pull_request", {})
        review = event.get("review", {})
        return {
            "type": "pull_request_review",
            "pr_number": pr.get("number"),
            "pr_title": pr.get("title"),
            "pr_body": pr.get("body"),
            "pr_url": pr.get("html_url"),
            "pr_branch": pr.get("head", {}).get("ref"),
            "review_body": review.get("body"),
            "review_state": review.get("state"),
            "repository": repo,
        }
    
    return {"repository": repo}


# ============================================================================
# PROMPT CONSTRUCTION
# ============================================================================

def build_prompt(skill_content: str, context: dict, constitution: str | None) -> str:
    """Combine skill instructions with event context and constitution."""
    context_json = json.dumps(context, indent=2)
    
    parts = ["# Agent Instructions\n"]
    
    # Include constitution if available
    if constitution:
        parts.append("## Project Constitution (Non-Negotiable Principles)\n")
        parts.append(constitution)
        parts.append("\n---\n")
    
    # Skill instructions
    parts.append("## Task Instructions\n")
    parts.append(skill_content)
    parts.append("\n---\n")
    
    # Context
    parts.append("## Context\n")
    parts.append("The following GitHub event triggered this task:\n")
    parts.append(f"```json\n{context_json}\n```\n")
    parts.append("\nExecute the task instructions using this context. Be thorough and complete the task.")
    
    return "\n".join(parts)


# ============================================================================
# TRACKING COMMENT
# ============================================================================

TRACKING_COMMENT_MARKER = "<!-- openhands-tracking-comment -->"


def create_tracking_comment(github: GitHubClient, repo: str, issue_number: int, conversation_url: str) -> dict:
    """Create a tracking comment on the issue with the conversation URL."""
    body = f"""{TRACKING_COMMENT_MARKER}
🤖 **I'm on it!** Track my progress here: [{conversation_url}]({conversation_url})

---
_This comment will be updated with a summary once the task is complete._
"""
    return github.create_issue_comment(repo, issue_number, body)


# ============================================================================
# MAIN
# ============================================================================

def main():
    # Load environment
    api_key = os.environ.get("OPENHANDS_API_KEY")
    if not api_key:
        print("ERROR: OPENHANDS_API_KEY not set")
        sys.exit(1)
    
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("WARNING: GITHUB_TOKEN not set, tracking comments disabled")
    
    event_name = os.environ.get("EVENT_NAME", "")
    event_action = os.environ.get("EVENT_ACTION", "")
    event_label = os.environ.get("EVENT_LABEL", "")  # The label that was just added
    event_payload = json.loads(os.environ.get("EVENT_PAYLOAD", "{}"))
    
    print(f"Event: {event_name}, Action: {event_action}, Label: {event_label}")
    
    # Extract context
    context = build_context(event_payload, event_name)
    labels = context.get("labels", [])
    
    # Determine skill based on event and label
    skill_name = determine_skill(event_name, event_action, event_label or None, labels)
    if not skill_name:
        print("No matching skill for this event. Skipping.")
        sys.exit(0)
    
    print(f"Selected skill: {skill_name}")
    
    # Load skill and constitution
    skill_content = load_skill(skill_name)
    constitution = load_constitution()
    
    # Determine branch (use feature branch if available)
    branch = "main"
    if context.get("spec_directory"):
        # For spec-driven work, we might want to use a feature branch
        branch = f"feature/{context['number']}-{context['title'][:30].lower().replace(' ', '-')}"
    
    # Check if this is a label-triggered event (needs tracking comment)
    is_label_triggered = event_action == "labeled" and event_label
    issue_number = context.get("number")
    repo = context.get("repository", "")
    
    # Add tracking comment marker to context so agent knows to update it
    if is_label_triggered:
        context["tracking_comment_marker"] = TRACKING_COMMENT_MARKER
    
    # Build prompt with full context
    prompt = build_prompt(skill_content, context, constitution)
    
    # Create OpenHands conversation
    workspace = OpenHandsCloudWorkspace(api_key)
    
    result = workspace.create_conversation(
        initial_message=prompt,
        repository=repo,
        branch=branch if skill_name == "implement" else "main",
        title=f"[{skill_name}] #{context.get('number', '')} {context.get('title', context.get('pr_title', 'Task'))}",
    )
    
    conversation_id = result.get("app_conversation_id") or result.get("id")
    conversation_url = workspace.get_conversation_url(conversation_id)
    
    print(f"OpenHands conversation started: {conversation_url}")
    
    # Create tracking comment for label-triggered events on issues
    tracking_comment_id = None
    
    if github_token and is_label_triggered and issue_number and repo:
        try:
            github = GitHubClient(github_token)
            comment = create_tracking_comment(github, repo, issue_number, conversation_url)
            tracking_comment_id = comment.get("id")
            print(f"Created tracking comment: {tracking_comment_id}")
        except Exception as e:
            print(f"WARNING: Failed to create tracking comment: {e}")
    
    # Output for GitHub Actions
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"conversation_url={conversation_url}\n")
            f.write(f"skill={skill_name}\n")
            if tracking_comment_id:
                f.write(f"tracking_comment_id={tracking_comment_id}\n")


if __name__ == "__main__":
    main()
