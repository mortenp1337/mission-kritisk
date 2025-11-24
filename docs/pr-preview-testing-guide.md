# PR Preview Testing Guide

**How to verify PR preview deployments and metadata with practical examples**

## Overview

When you create a pull request, GitHub Actions automatically:
1. Builds your code with the PR's changes
2. Deploys to a preview URL
3. Includes PR metadata in build-info.json
4. Keeps production deployment unchanged

This guide helps you verify that everything works correctly.

## Preview URL

**Location**: `/preview/` subdirectory on GitHub Pages

**Example URLs**:
- Production: https://mortenp1337.github.io/mission-kritisk/
- Preview: https://mortenp1337.github.io/mission-kritisk/preview/

**Important**: Only ONE preview can exist at a time. Each new PR deployment replaces the previous preview.

## Quick Verification Checklist

When a PR preview deploys:

- [ ] Wait ~5 minutes for workflow completion
- [ ] Visit preview URL: https://mortenp1337.github.io/mission-kritisk/preview/
- [ ] Game loads without 404 errors
- [ ] Game content appears correct
- [ ] Check build metadata: https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json
- [ ] Verify `deployment_type` is "preview"
- [ ] Verify `pr_metadata` exists and has correct PR number
- [ ] Compare with production metadata to ensure different versions

## Accessing Build Metadata in Preview

### Method 1: Browser Developer Tools

1. Open preview: https://mortenp1337.github.io/mission-kritisk/preview/
2. Open DevTools: `F12` or `Cmd+Option+I` (Mac)
3. Go to Console tab
4. Paste:
   ```javascript
   fetch('/.meta/build-info.json').then(r => r.json()).then(d => console.log(d))
   ```
5. View the output showing metadata

### Method 2: Direct URL in Browser

1. Visit: https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json
2. Browser displays JSON file
3. Can view source or format with JSON extension

### Method 3: Command Line (curl)

```bash
# View all metadata
curl https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .

# Pretty print
curl https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq . | less
```

### Method 4: Just the PR Number

```bash
curl https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .pr_metadata.number
```

## Metadata Structure in Preview

### Expected Fields

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "abc123...",
  "commit_short": "abc123d",
  "build_timestamp": "2025-11-23T15:30:45.123Z",
  "deployment_type": "preview",
  "pr_metadata": {
    "number": 42,
    "title": "Add feature",
    "branch": "feature/something",
    "base_branch": "main",
    "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
  }
}
```

**Verify each field**:
- `deployment_type`: Should be exactly `"preview"` (not `"production"`)
- `pr_metadata`: Must exist and be non-null (not present in production)
- `pr_metadata.number`: Matches the PR number in GitHub
- `pr_metadata.pr_url`: Links to correct PR

## Testing Scenarios

### Scenario 1: Verify Preview Deployment (Basic)

**Goal**: Confirm PR preview builds and deploys

**Steps**:
1. Create a test PR (any change to main)
2. Wait 5 minutes for Actions to complete
3. Go to PR and find "deploy-pr-preview" workflow
4. Verify workflow has green checkmark ✅
5. Visit preview URL: https://mortenp1337.github.io/mission-kritisk/preview/
6. **Expected**: Game loads without 404 errors

**What to check**:
- No 404 in browser console
- Game canvas appears
- Assets load (images, audio)
- Buttons clickable

---

### Scenario 2: Verify PR Metadata (Important)

**Goal**: Confirm preview includes correct PR information

**Steps**:
1. Create a PR with a descriptive title (e.g., "Add rainbow tower")
2. Note the PR number (e.g., #42)
3. Wait for deploy-pr-preview workflow to complete
4. Run:
   ```bash
   curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .pr_metadata
   ```
5. **Expected output**:
   ```json
   {
     "number": 42,
     "title": "Add rainbow tower",
     "branch": "feature/rainbow-tower",
     "base_branch": "main",
     "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
   }
   ```

**Verify each field**:
- `number`: Matches your PR number
- `title`: Matches your PR title exactly
- `branch`: Matches your feature branch name
- `base_branch`: Should be "main"
- `pr_url`: Clickable link to your PR

---

### Scenario 3: Version Consistency (Advanced)

**Goal**: Confirm version matches main branch

**Steps**:
1. Check production version:
   ```bash
   curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .version
   ```
   Output: `0.0.5`

2. Check preview version:
   ```bash
   curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq -r .version
   ```
   Output: `0.0.5`

3. **Expected**: Versions match (both should be same)

**Why**: Preview is built from same commit as main (your PR target)

---

### Scenario 4: Commit SHA Differences (Advanced)

**Goal**: Confirm preview has your PR's commit, not main's latest

**Steps**:
1. Get production commit:
   ```bash
   curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .commit_short
   ```
   Output: `a1b2c3d`

2. Get preview commit:
   ```bash
   curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq -r .commit_short
   ```
   Output: `x9y8z7w`

3. **Expected**: Different SHAs (preview has your PR's commit)

4. Verify preview SHA is in your PR:
   - Go to your PR page
   - Find "Commits" tab
   - Look for commit `x9y8z7w...` in list
   - Should be your latest commit in PR

---

### Scenario 5: Deployment After Merge (Advanced)

**Goal**: Verify preview disappears after merge

**Steps**:
1. Create and deploy a test PR
2. Verify preview works at `/preview/`
3. Merge the PR to main
4. Wait 5 minutes for deploy-main to complete
5. Try to access preview: https://mortenp1337.github.io/mission-kritisk/preview/
6. Check build-info.json: https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json

7. **Expected after merge**:
   - Preview directory still exists (contains previous main build)
   - When new PR opens, preview gets replaced with new PR data
   - OR if no new PRs opened, old preview remains until next PR

**Note**: Preview is meant for testing before merge. After merge, changes are in production.

## Comparing Production vs Preview

### Side-by-Side Comparison

**Script to compare both**:

```bash
#!/bin/bash
echo "=== PRODUCTION ==="
curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .

echo ""
echo "=== PREVIEW ==="
curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .
```

**Run it**:
```bash
chmod +x compare-builds.sh
./compare-builds.sh
```

### Expected Differences

| Field | Production | Preview |
|-------|-----------|---------|
| `deployment_type` | `"production"` | `"preview"` |
| `pr_metadata` | null (absent) | object with PR info |
| `commit_sha` | Latest main commit | Your PR's latest commit |
| `build_timestamp` | When main deployed | When PR built |
| `version` | Tag on main | Same tag (from main) |

### Expected Similarities

| Field | Same or Different? |
|-------|---|
| `schema_version` | SAME |
| `version` | SAME (both from latest tag) |
| `build_timestamp` | DIFFERENT (different build times) |

## Troubleshooting Preview Issues

### Problem: Preview Returns 404

```
curl: (22) The requested URL returned error: 404
```

**Causes & Solutions**:

1. **Preview doesn't exist yet**
   - Check GitHub Actions for deploy-pr-preview workflow
   - Wait ~5 minutes for deployment
   - Try again

2. **Workflow failed**
   - Click workflow in Actions tab
   - Check error in logs
   - Common: Timeout, build error, permissions
   - Fix error, push new commit to PR, try again

3. **Wrong PR deployed**
   - Only one preview can exist at a time
   - If another PR deployed after yours, it replaced your preview
   - Trigger new deployment or push new commit to your PR

**Solution command**:
```bash
# Wait and retry
echo "Waiting for deployment..." && sleep 10 && curl https://mortenp1337.github.io/mission-kritisk/preview/
```

### Problem: build-info.json is Valid But Shows Wrong PR Number

**Causes & Solutions**:

1. **Your PR was opened after another PR's preview deployed**
   - The preview shows the other PR's data
   - Close or merge the other PR
   - Push new commit to your PR to trigger new build
   - Your PR metadata will appear

2. **Viewing cached old data**
   - Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or use curl with no-cache: `curl -H "Cache-Control: no-cache"`

### Problem: Game Loads But Shows Errors

**Checklist**:
- [ ] Check browser console (F12) for errors
- [ ] Verify assets loaded: Network tab
- [ ] Try different browser (Chrome, Firefox, Safari)
- [ ] Check if error is in your PR's code
- [ ] Compare with production to see if regression

**Get logs from workflow**:
1. Go to Actions tab
2. Click deploy-pr-preview workflow
3. Click "build-pr" job
4. Scroll through logs to find errors
5. Fix code, push new commit, retry

## Manual Testing Checklist

For each PR preview deployment:

### Functionality Testing

- [ ] Game loads at preview URL
- [ ] Menu appears without errors
- [ ] Can click buttons
- [ ] Can play game level
- [ ] No console errors (F12)
- [ ] Assets display correctly (images, text)
- [ ] Performance reasonable (no freezes)

### Metadata Testing

- [ ] build-info.json accessible at `/.meta/build-info.json`
- [ ] JSON valid (can parse with jq)
- [ ] deployment_type is "preview"
- [ ] pr_metadata exists and not null
- [ ] PR number matches your PR
- [ ] PR title matches exactly
- [ ] PR URL is clickable and correct

### Comparison Testing

- [ ] Preview version matches production version
- [ ] Preview uses different commit SHA than production
- [ ] Production unaffected by preview
- [ ] Preview includes your PR's changes

## Automated Testing (For Developers)

### Run Playwright Tests Against Preview

If adding tests for preview metadata:

```bash
# Test production
npm test -- --grep "production" -- build.spec.ts

# Test preview (manually set to /preview/ path)
# Or create separate test for preview
```

### Test Script Example

```bash
#!/bin/bash
# test-preview.sh

PREVIEW_URL="https://mortenp1337.github.io/mission-kritisk/preview"
METADATA_URL="$PREVIEW_URL/.meta/build-info.json"

echo "Testing preview metadata..."

# Check if accessible
if ! curl -sf "$METADATA_URL" > /dev/null; then
  echo "❌ FAIL: Preview metadata not accessible"
  exit 1
fi

# Check if valid JSON
if ! curl -s "$METADATA_URL" | jq . > /dev/null; then
  echo "❌ FAIL: Invalid JSON"
  exit 1
fi

# Check required fields
DEPLOYMENT_TYPE=$(curl -s "$METADATA_URL" | jq -r .deployment_type)
if [ "$DEPLOYMENT_TYPE" != "preview" ]; then
  echo "❌ FAIL: deployment_type is not 'preview'"
  exit 1
fi

# Check PR metadata exists
if ! curl -s "$METADATA_URL" | jq -e .pr_metadata > /dev/null; then
  echo "❌ FAIL: pr_metadata missing"
  exit 1
fi

echo "✅ PASS: Preview metadata valid"
```

Run it:
```bash
chmod +x test-preview.sh
./test-preview.sh
```

## Reporting Preview Issues

If preview isn't working correctly:

1. **Collect information**:
   ```bash
   # Save both for comparison
   echo "=== Production ===" > debug.txt
   curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq . >> debug.txt
   
   echo "" >> debug.txt
   echo "=== Preview ===" >> debug.txt
   curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq . >> debug.txt
   ```

2. **Check workflow logs**:
   - Actions → deploy-pr-preview
   - Click the failed workflow
   - Copy error message

3. **Report issue** with:
   - PR number
   - Error message from workflow
   - Output of debug.txt
   - What you expected vs what happened

## Quick Reference Commands

| Task | Command |
|------|---------|
| View preview | Open https://mortenp1337.github.io/mission-kritisk/preview/ |
| View preview metadata | curl https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json \| jq . |
| Get PR number | curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json \| jq .pr_metadata.number |
| Compare prod vs preview | Run compare-builds.sh script above |
| Check deployment type | curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json \| jq -r .deployment_type |
| Verify version match | curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json \| jq .version && curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json \| jq .version |
