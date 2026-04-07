# OpenHands Cloud: Fork Compatibility Issue

**Date**: April 7, 2026  
**Affected Repo**: `rajshah4/demo-spec-driven` (fork)  
**Working Repo**: `rajshah4/spec-driven-demo` (non-fork)  
**Related Issue**: https://github.com/OpenHands/OpenHands/issues/13769

---

## Summary

Forked repositories do not work properly with the OpenHands Cloud API. API calls to create conversations return `401 Unauthorized` errors even with a valid API key.

---

## Symptoms

1. **GitHub Actions workflow fails** when triggered by issue events
2. **No comments posted** on issues (the bot never responds)
3. **Workflow logs show**:
   ```
   httpx.HTTPStatusError: Client error '401 Unauthorized' for url 'https://app.all-hands.dev/api/v1/app-conversations'
   ```

---

## Debugging Steps Taken

### 1. Verified API Key
- Key format was correct (`sk-oh-...`, 38 characters)
- Key worked on non-forked repo (`rajshah4/dailyme`) ✅
- Key failed on forked repo (`rajshah4/demo-spec-driven`) ❌

### 2. Verified Workflow Configuration
- `OPENHANDS_API_KEY` was correctly set as a **repository secret**
- Workflow YAML was correctly referencing `${{ secrets.OPENHANDS_API_KEY }}`
- Event triggers were firing properly

### 3. Tested API Directly
```bash
# This returned 401 BearerTokenError for the forked repo
curl -X POST "https://app.all-hands.dev/api/v1/app-conversations" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "initial_message": {"content": [{"type": "text", "text": "test"}]},
    "selected_repository": "rajshah4/demo-spec-driven"
  }'
```

### 4. Found Related Slack Discussions
- Jamie Steinberg reported (April 3, 2026): *"There is an error where forks won't appear when searching for those repos on the cloud"*
- Robert Brennan confirmed: *"tbh I've had problems working on forks w/ OpenHands"*

---

## Root Cause

**OpenHands Cloud has a known bug where forked repositories are not properly accessible via the API.**

The issue appears to be related to:
- Repository visibility/access checks treating forks differently
- Possibly related to the new Organizations feature and "claiming" repos

---

## Workaround

Create a **non-forked repository** with the same code:

```bash
# 1. Create new repo on GitHub (not a fork)
# 2. Clone the forked repo locally
git clone https://github.com/rajshah4/demo-spec-driven.git /tmp/new-repo
cd /tmp/new-repo

# 3. Remove git history and reinitialize
rm -rf .git
git init
git add -A
git commit -m "Initial commit"

# 4. Push to new non-forked repo
git remote add origin https://github.com/rajshah4/spec-driven-demo.git
git push -u origin main

# 5. Add OPENHANDS_API_KEY secret to new repo
# 6. Test by creating an issue
```

---

## Evidence

### Failed Workflow Run (Forked Repo)
- **Run ID**: 24058289709
- **Repo**: `rajshah4/demo-spec-driven`
- **Status**: Failed
- **Error**: `401 Unauthorized`

### Successful Workflow Run (Non-Forked Repo)
- **Run ID**: 24059257995
- **Repo**: `rajshah4/spec-driven-demo`
- **Status**: Success
- **Comment Posted**: ✅ "OK, working on `spec`. [Track my progress here](...)"

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 00:11:51 | Last successful run on forked repo (before issues started) |
| 00:22:52 | First 401 failure |
| 00:35:37 | Multiple subsequent failures |
| 01:10:06 | Created non-forked repo, immediate success |

---

## Recommendations for OpenHands Team

1. **Investigate fork handling** in the API's repository access layer
2. **Add clear error message** when a fork is not supported (instead of generic 401)
3. **Document limitation** if forks are intentionally unsupported
4. **Consider the Organizations "claim" feature** - forks may need special handling

---

## Contact

For questions about this issue, contact the repo owner or reference this document when reporting to the OpenHands team.
