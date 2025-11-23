# Workflow Contract: Main Deployment Modifications

**File**: `.github/workflows/deploy-main.yml`  
**Purpose**: Deploy production content only (no preview folders) from main branch  
**Modifications**: Minor adjustments to ensure no preview artifacts in production

## Current State Analysis

### Existing Behavior

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build-nolog

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

**Current Flow**:
1. Checkout main branch
2. Build project → `dist/`
3. Upload `dist/` as-is to Pages

**Issue**: If a PR was previously deployed, the `dist/` folder from main build won't have a `preview/` folder, so this already works correctly. However, we should add explicit validation to ensure production purity.

---

## Required Modifications

### 1. Add Pre-Upload Validation

**Purpose**: Explicitly verify no preview artifacts present before production deployment

**Implementation**:
```yaml
- name: Validate production build
  run: |
    if [ -d "dist/preview" ]; then
      echo "::error::Preview directory found in production build - aborting"
      exit 1
    fi
    
    test -f dist/index.html || (echo "::error::Missing index.html" && exit 1)
    test -d dist/assets || (echo "::error::Missing assets directory" && exit 1)
    
    echo "✅ Production build validated"
```

**Placement**: After `Build project` step, before `Setup Pages`

---

### 2. Add Deployment Type Indicator

**Purpose**: Clearly identify production deployments in logs and UI

**Implementation**:
```yaml
- name: Identify deployment type
  run: |
    echo "::notice::Production deployment from main branch"
    echo "::notice::Commit: ${{ github.sha }}"
    echo "::notice::No preview content will be deployed"
```

**Placement**: Before `Build project` step

---

### 3. Maintain Existing Concurrency Settings

**Current**:
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

**Keep As-Is**: This ensures production deployments complete without interruption. Different from preview workflow which uses `cancel-in-progress: true`.

---

### 4. Optional: Add Post-Deploy Verification

**Purpose**: Confirm production site is accessible and preview path returns 404

**Implementation** (optional, can be added in future iteration):
```yaml
- name: Verify production deployment
  run: |
    URL="${{ steps.deployment.outputs.page_url }}"
    
    # Check production root accessible
    curl -f -s -o /dev/null "$URL" || (echo "::error::Production URL not accessible" && exit 1)
    echo "✅ Production URL accessible"
    
    # Check preview path returns 404 (as expected)
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/preview/" || true)
    if [ "$STATUS" != "404" ]; then
      echo "::warning::Preview path returned status $STATUS (expected 404)"
    else
      echo "✅ No preview artifacts present (404 as expected)"
    fi
```

**Placement**: After `Deploy to GitHub Pages` step

---

## Modified Workflow Structure

### Complete Modified File

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Identify deployment type
      run: |
        echo "::notice::Production deployment from main branch"
        echo "::notice::Commit: ${{ github.sha }}"
        echo "::notice::No preview content will be deployed"

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build-nolog

    - name: Validate production build
      run: |
        if [ -d "dist/preview" ]; then
          echo "::error::Preview directory found in production build - aborting"
          exit 1
        fi
        
        test -f dist/index.html || (echo "::error::Missing index.html" && exit 1)
        test -d dist/assets || (echo "::error::Missing assets directory" && exit 1)
        
        echo "✅ Production build validated"

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

---

## Changes Summary

| Change | Type | Rationale |
|--------|------|-----------|
| Add deployment type notice | New step | Improves observability |
| Add production build validation | New step | Ensures no preview artifacts |
| Keep concurrency settings | No change | Maintains production stability |
| Optional post-deploy verification | Future enhancement | Validates deployment success |

---

## Backward Compatibility

✅ **No Breaking Changes**: Modifications are additive validation only  
✅ **Same Trigger Conditions**: Still triggers on push to main and workflow_dispatch  
✅ **Same Build Process**: Still uses `npm run build-nolog`  
✅ **Same Deployment Mechanism**: Still uses `actions/deploy-pages@v4`  
✅ **Same Permissions**: No permission changes required  
✅ **Same Performance**: Validation adds <5 seconds to workflow

---

## Testing Strategy

### Pre-Modification Validation

1. **Capture current behavior**:
   ```bash
   # Trigger current workflow
   git push origin main
   # Note: deployment time, URL, behavior
   ```

2. **Verify production site**:
   - Visit production URL
   - Confirm game loads correctly
   - Check `/preview/` returns 404

### Post-Modification Validation

1. **Test modified workflow**:
   ```bash
   # Merge PR with workflow changes
   git push origin main
   ```

2. **Verify same behavior**:
   - Deployment completes successfully
   - Production site loads correctly
   - No `/preview/` directory present
   - Workflow logs show validation steps

3. **Test error detection**:
   ```bash
   # Manually add preview folder to test validation
   mkdir dist/preview
   echo "test" > dist/preview/test.html
   # Workflow should fail with clear error
   ```

---

## Rollback Plan

**If Modifications Cause Issues**:

1. **Immediate**: Revert PR that introduced changes
2. **Deploy**: Automatic deployment restores previous workflow version
3. **Verify**: Production deployment works with previous workflow

**Revert Command**:
```bash
git revert <commit-sha-of-workflow-changes>
git push origin main
```

**Risk**: Low - changes are minimal validation additions

---

## Success Criteria

**Modified workflow succeeds when**:
1. ✅ Deploys production content to root successfully
2. ✅ Validation confirms no preview artifacts present
3. ✅ Deployment time remains within 5 minutes (no regression)
4. ✅ Production site is accessible and functional
5. ✅ Preview path correctly returns 404

**Failure Indicators**:
1. ❌ Validation step fails (preview directory detected)
2. ❌ Build or deployment steps fail
3. ❌ Deployment time significantly increases (>10% regression)
4. ❌ Production site inaccessible or broken

---

## Integration with Preview Workflow

### Coordination

**Preview Workflow Deploys**:
- Main content at root
- Preview content at `/preview/`
- Replaces entire site

**Main Workflow Deploys**:
- Main content at root only
- Replaces entire site (including removing `/preview/` if present)

**Result**: Main deployments automatically clean up preview deployments by replacing entire site.

### State Transitions

```
State 1: Production Only
- Root: main content
- /preview/: 404

    ↓ [PR deployed]

State 2: Production + Preview
- Root: main content
- /preview/: PR content

    ↓ [Main deployed OR different PR deployed]

State 3a: Production Only (main deployed)
- Root: main content
- /preview/: 404

State 3b: Production + Different Preview (new PR deployed)
- Root: main content (from new PR deployment)
- /preview/: new PR content
```

---

## Documentation Updates Required

### README.md Section

**Add to "Deployment" section**:

```markdown
### Deployment Workflows

**Production Deployment** (`.github/workflows/deploy-main.yml`)
- Triggers: Push to `main` branch
- Deploys: Production content only (no preview)
- URL: https://mortenp1337.github.io/mission-kritisk/
- Concurrency: Queued (ensures completion)

**Preview Deployment** (`.github/workflows/deploy-pr-preview.yml`)
- Triggers: PR opened/updated, manual workflow dispatch
- Deploys: Production (root) + Preview (/preview/)
- URLs:
  - Production: https://mortenp1337.github.io/mission-kritisk/
  - Preview: https://mortenp1337.github.io/mission-kritisk/preview/
- Concurrency: Cancels in-progress (latest only)

**Note**: Only one preview can be active at a time. Each deployment replaces the entire site.
```

### Copilot Instructions Update

**Add to `.github/copilot-instructions.md`**:

```markdown
## Deployment System

- Production deployments (main branch) deploy only main content to root
- PR deployments deploy main content (root) + PR content (/preview/)
- Preview URL is always `/preview/` - no PR number or branch name
- Each deployment completely replaces the GitHub Pages site
- Only the most recent deployment is active
```

---

## Contract Guarantees

✅ **Production Purity**: No preview artifacts in production deployments  
✅ **Validation**: Explicit checks prevent accidental preview inclusion  
✅ **Observability**: Clear logging of deployment type and status  
✅ **Backward Compatible**: No breaking changes to existing behavior  
✅ **Performance**: No significant regression (<5 seconds added)  
✅ **Constitution Compliant**: Maintains all CI/CD principles  
✅ **Idempotent**: Repeated deployments produce identical results  
✅ **Safe**: Low-risk modifications with clear rollback path
