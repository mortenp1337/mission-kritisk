# Workflow Contract: PR Preview Deployment

**File**: `.github/workflows/deploy-pr-preview.yml`  
**Purpose**: Deploy PR changes to `/preview/` subdirectory with main branch content at root  
**Triggers**: PR opened/synchronized/reopened, manual workflow_dispatch

## Contract Specification

### Inputs

**Automatic (from GitHub context)**:
- `github.ref_name`: Branch name (determines if preview or production)
- `github.sha`: Commit SHA for deployment tracking
- `github.event_name`: Event type (pull_request or workflow_dispatch)
- `github.repository`: Repository identifier

**No manual inputs required** - workflow auto-detects deployment type

---

### Outputs

**GitHub Actions Outputs**:
- `page_url`: Deployed site URL (from `actions/deploy-pages`)
- `preview_url`: Preview subdirectory URL (computed: `{page_url}/preview/`)

**Artifacts**:
- `github-pages`: Combined deployment artifact uploaded to GitHub Actions

**Deployment Result**:
- Production content accessible at: `https://{owner}.github.io/{repo}/`
- Preview content accessible at: `https://{owner}.github.io/{repo}/preview/`

---

### Behavior

#### Trigger Conditions

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]
  workflow_dispatch:
```

**When Triggered by PR**:
- Runs on PR open, update (new commits), or reopen
- Targets PRs against `main` branch only

**When Triggered by workflow_dispatch**:
- Can be manually triggered from Actions UI
- Uses the branch selected in UI as the "PR branch"
- Detects if selected branch is `main` → production-only deployment

#### Job Flow

```
Job: build-main
│
├─ Checkout: main branch (forced)
├─ Setup: Node.js 18
├─ Install: npm ci
├─ Build: npm run build-nolog
└─ Upload: dist-main artifact

Job: build-pr (if not main branch)
│
├─ Checkout: PR/triggering branch
├─ Setup: Node.js 18
├─ Install: npm ci
├─ Build: npm run build-nolog
└─ Upload: dist-pr artifact

Job: deploy
│
├─ Needs: build-main [, build-pr]
├─ Download: dist-main artifact
├─ Download: dist-pr artifact (if exists)
├─ Combine: Create unified structure
│   ├─ dist-main/* → combined/
│   └─ dist-pr/* → combined/preview/ (if preview deployment)
├─ Configure Pages
├─ Upload Pages Artifact: combined/
└─ Deploy Pages
```

---

### Concurrency Control

```yaml
concurrency:
  group: "pages-preview"
  cancel-in-progress: true
```

**Behavior**:
- Only one preview deployment runs at a time
- New deployments cancel in-progress deployments
- Saves CI resources since only latest preview matters

**Rationale**: GitHub Pages completely replaces site on each deployment, so intermediate deployments are wasted effort.

---

### Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Required For**:
- `contents: read` - Checkout repository code
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC authentication for Pages deployment

---

### Environment

```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```

**Purpose**:
- Links deployment to GitHub Pages environment
- Enables environment protection rules (if configured)
- Provides deployment history and URLs

---

## Error Handling

### Main Branch Build Failure

**Scenario**: Building main branch fails during PR preview deployment

**Behavior**:
1. Log error with full build output
2. Check for cached main artifact from previous successful build
3. If cache exists:
   - Use cached artifact
   - Log warning: "Using cached main build from [SHA]"
   - Continue with preview deployment
4. If no cache:
   - Fail workflow with clear error message
   - Suggest fixing main branch first

**Implementation**:
```yaml
- name: Build main branch
  id: build-main
  continue-on-error: true
  run: npm run build-nolog

- name: Check build status
  if: steps.build-main.outcome == 'failure'
  run: |
    echo "::warning::Main branch build failed, attempting to use cached artifact"
    # Fetch from cache or fail
```

---

### PR Branch Build Failure

**Scenario**: Building PR branch fails

**Behavior**:
1. Fail workflow immediately
2. Display full build error logs
3. Mark PR check as failed
4. No deployment occurs

**Rationale**: PR author must fix their branch - no fallback appropriate.

---

### Artifact Upload Failure

**Scenario**: GitHub Pages artifact upload fails

**Behavior**:
1. Retry once after 10 second delay
2. If still fails, fail workflow
3. Log artifact size and structure for debugging

---

### Deployment Failure

**Scenario**: GitHub Pages deployment API call fails

**Behavior**:
1. Fail workflow with deployment error details
2. Display API response if available
3. Check GitHub Pages configuration (linked in error)

**Common Causes**:
- Pages not enabled for repository
- Insufficient permissions
- Artifact exceeds size limits

---

## Validation Steps

### Pre-Deploy Validation

**Combined Artifact Structure**:
```yaml
- name: Validate artifact structure
  run: |
    test -f combined/index.html || (echo "Missing index.html at root" && exit 1)
    test -d combined/assets || (echo "Missing assets directory" && exit 1)
    
    if [ "${{ github.ref_name }}" != "main" ]; then
      test -f combined/preview/index.html || (echo "Missing preview/index.html" && exit 1)
      test -d combined/preview/assets || (echo "Missing preview/assets" && exit 1)
    fi
    
    echo "✅ Artifact structure valid"
```

**Size Check**:
```yaml
- name: Check artifact size
  run: |
    SIZE=$(du -sm combined | cut -f1)
    if [ $SIZE -gt 1000 ]; then
      echo "::error::Artifact size ${SIZE}MB exceeds 1GB limit"
      exit 1
    fi
    echo "✅ Artifact size: ${SIZE}MB"
```

---

### Post-Deploy Validation

**URL Accessibility** (optional, can be added later):
```yaml
- name: Smoke test deployment
  run: |
    curl -f -s -o /dev/null ${{ steps.deployment.outputs.page_url }} || exit 1
    echo "✅ Production URL accessible"
    
    if [ "${{ github.ref_name }}" != "main" ]; then
      curl -f -s -o /dev/null ${{ steps.deployment.outputs.page_url }}/preview/ || exit 1
      echo "✅ Preview URL accessible"
    fi
```

---

## Performance Requirements

**Success Criteria (from spec)**:
- **SC-001**: PR preview accessible within 5 minutes
- **SC-006**: No significant regression vs current deployment time

**Target Metrics**:
- Build job (each): <3 minutes
- Deploy job: <2 minutes
- **Total workflow time**: <8 minutes for preview, <5 minutes for production

**Optimization Strategies**:
- Use `npm ci` with cache for faster installs
- Run build-main and build-pr in parallel (no dependencies)
- Cancel-in-progress for PR deployments reduces queue wait

---

## Branch Detection Logic

**Core Logic**:
```yaml
jobs:
  detect-type:
    runs-on: ubuntu-latest
    outputs:
      is-preview: ${{ steps.check.outputs.is-preview }}
    steps:
      - name: Check if preview deployment
        id: check
        run: |
          if [ "${{ github.ref_name }}" = "main" ]; then
            echo "is-preview=false" >> $GITHUB_OUTPUT
          else
            echo "is-preview=true" >> $GITHUB_OUTPUT
          fi

  build-pr:
    needs: detect-type
    if: needs.detect-type.outputs.is-preview == 'true'
    # ... build PR branch

  deploy:
    needs: [detect-type, build-main, build-pr]
    if: always() && needs.build-main.result != 'failure'
    # ... conditional combining based on is-preview
```

---

## Combining Strategy

### Production Deployment (main branch)

```bash
#!/bin/bash
mkdir -p combined
cp -r dist-main/* combined/
# No preview folder created
```

**Result**:
```
combined/
├── index.html
├── style.css
└── assets/
```

---

### Preview Deployment (non-main branch)

```bash
#!/bin/bash
mkdir -p combined
cp -r dist-main/* combined/          # Production at root
mkdir -p combined/preview
cp -r dist-pr/* combined/preview/    # Preview in subdirectory
```

**Result**:
```
combined/
├── index.html           # Main branch
├── style.css            # Main branch
├── assets/              # Main branch
│   └── ...
└── preview/            # PR branch
    ├── index.html
    ├── style.css
    └── assets/
        └── ...
```

---

## Success Indicators

**Workflow succeeds when**:
1. All build jobs complete with exit code 0
2. Artifact structure validation passes
3. Artifact size within limits
4. GitHub Pages deployment returns success
5. Deployment URL is accessible (optional smoke test)

**PR Check Status**:
- ✅ Green check: Deployment successful
- ⚠️ Yellow warning: Deployment succeeded with cached main (main build failed)
- ❌ Red X: Deployment failed

---

## Integration Points

**With Existing Workflows**:
- Does NOT interfere with `ci.yml` (runs independently)
- Shares Node.js setup patterns with existing workflows
- Uses same `npm run build-nolog` command

**With GitHub Pages**:
- Uses official deployment actions
- Respects Pages environment configuration
- Compatible with existing Pages settings

**With Game Code**:
- No changes to game source required
- Respects existing `base: './'` Vite configuration
- Maintains asset loading patterns

---

## Rollback Strategy

**If Deployment Fails**:
1. Previous deployment remains active (no partial deployment)
2. PR author sees failure, makes fixes, pushes new commit
3. New commit triggers fresh deployment attempt

**If Deployment Succeeds but Breaks Site**:
1. Revert PR or push fix to same branch
2. New deployment automatically triggered
3. Or: manually trigger workflow on last known good branch

**Emergency: Broken Main Deployment**:
1. Revert merge commit on main
2. Automatic main deployment restores previous version
3. Or: manually trigger workflow on specific commit SHA

---

## Monitoring & Observability

**GitHub Actions UI**:
- Workflow run status and logs
- Deployment URLs in job summaries
- Build time and resource usage

**GitHub Pages**:
- Deployment history in Pages settings
- Active deployment indicator
- Deployment timestamps

**Suggested Enhancements** (out of scope, future work):
- Comment preview URL on PR
- Slack/Discord deployment notifications
- Deployment analytics and usage tracking

---

## Contract Guarantees

✅ **Idempotency**: Running workflow multiple times with same commit produces identical deployment  
✅ **Atomicity**: Deployment is all-or-nothing (no partial deployments)  
✅ **Branch Detection**: Automatically determines production vs preview  
✅ **Concurrency Safe**: Cancel-in-progress prevents conflicts  
✅ **Resource Efficiency**: Only uses official GitHub Actions  
✅ **Performance**: Meets <5 minute target for preview deployments  
✅ **Failure Resilience**: Handles main build failures gracefully  
✅ **Constitution Compliant**: Aligns with all CI/CD principles
