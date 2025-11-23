# Phase 0: Research & Decisions

**Feature**: PR Preview Deployment System  
**Date**: 2025-11-23  
**Status**: Complete

## Research Questions Resolved

### 1. GitHub Pages Deployment Behavior

**Question**: Can GitHub Pages serve multiple preview deployments simultaneously?

**Answer**: No. Each call to `actions/deploy-pages@v4` creates a new deployment that completely replaces the entire GitHub Pages site. There is no "merging" or "preserving" of previous content.

**Source**: GitHub Actions `deploy-pages` repository analysis, API endpoint `POST /repos/{owner}/{repo}/pages/deployments` creates singular deployment.

**Decision**: Only one preview can be active at a time. Each PR deployment overwrites the entire site. Use cancel-in-progress for PR workflows to avoid wasting resources on outdated deployments.

**Impact**: 
- Preview path simplified to `/preview/` (no PR number needed)
- Concurrent PRs cannot have simultaneous previews
- Last deployment wins

---

### 2. Branch Detection Strategy

**Question**: How should the workflow identify whether to deploy production or preview content?

**Answer**: Use GitHub Actions context variable `github.ref` to detect triggering branch. If `refs/heads/main`, deploy production-only. Otherwise, deploy combined (production + preview).

**Source**: GitHub Actions documentation, standard practice for branch-aware workflows.

**Decision**: Single unified workflow that auto-detects deployment type based on branch context. No manual inputs required for workflow_dispatch.

**Impact**:
- Simplified workflow logic
- Consistent behavior for PR events and manual triggers
- No user input required

---

### 3. Main Branch Build Failure During PR Deployment

**Question**: If main branch build fails when deploying a PR preview, should the entire deployment fail?

**Answer**: Continue with last successful main build, mark deployment with warning status.

**Rationale**: PR authors need to test their changes even if main is broken. Blocking PR previews due to unrelated main branch issues hurts developer velocity.

**Decision**: Attempt main build first. If fails, fetch last successful artifact from cache or previous deployment. Log warning but proceed with PR preview deployment.

**Impact**:
- Requires artifact caching strategy
- Warning/notification mechanism needed
- PR previews remain available during main branch issues

---

### 4. Concurrency Control

**Question**: Should workflows queue or cancel in-progress deployments?

**Answer**: Different strategies for different triggers:
- **PR deployments**: `cancel-in-progress: true` (save resources, only latest matters)
- **Main deployments**: `cancel-in-progress: false` (ensure production deploys complete)

**Rationale**: Since only one preview exists, canceling outdated PR deployments is safe and efficient. Production deployments should complete to avoid partial/failed deployments.

**Decision**: Use concurrency groups with trigger-specific cancel-in-progress settings.

**Impact**:
- Faster feedback for rapid PR updates
- Resource optimization
- Production stability

---

## Technology Decisions

### Official GitHub Actions Only

**Requirement**: Use only actions from `actions/*` organization, minimize `actions/github-script`.

**Selected Actions**:
- `actions/checkout@v4` - Repository checkout
- `actions/setup-node@v4` - Node.js environment
- `actions/upload-pages-artifact@v3` - Artifact preparation
- `actions/deploy-pages@v4` - GitHub Pages deployment
- `actions/configure-pages@v4` - Pages configuration
- `actions/download-artifact@v4` - Artifact retrieval (for caching strategy)

**Shell Script Usage**: Artifact combination, directory manipulation, branch detection logic implemented in bash/shell scripts within workflow steps.

**Rationale**: Official actions provide reliability, security, and GitHub support. Shell scripts handle custom logic without third-party dependencies.

---

### Artifact Combination Strategy

**Question**: How to combine main and PR builds into single deployment artifact?

**Answer**: Multi-step process within workflow:
1. Checkout and build main branch → output to `dist-main/`
2. Checkout and build PR branch → output to `dist-pr/`
3. Create combined directory:
   ```bash
   mkdir -p combined
   cp -r dist-main/* combined/           # Main content at root
   mkdir -p combined/preview
   cp -r dist-pr/* combined/preview/     # PR content in preview/
   ```
4. Upload `combined/` directory as Pages artifact

**Alternative Considered**: Build once, copy to multiple locations. Rejected because Vite output directory is configurable and this approach is more explicit.

**Decision**: Two-build approach with shell-based directory combination.

**Impact**:
- Clear separation of build contexts
- Explicit control over directory structure
- Works with existing `npm run build-nolog` command

---

### Preview Path Structure

**Question**: Should preview use PR number, branch name, or generic path?

**Answer**: Generic `/preview/` path.

**Rationale**: Only one preview can exist at a time due to GitHub Pages replacement behavior. PR numbers/branch names add unnecessary complexity.

**Decision**: All preview deployments go to `/preview/` subdirectory.

**Impact**:
- Simplified URL scheme: `https://{owner}.github.io/{repo}/preview/`
- No path generation logic needed
- Clear, consistent preview location

---

## Best Practices Applied

### GitHub Actions Workflow Design

1. **Separation of Concerns**: Different jobs for build and deploy phases
2. **Artifact Passing**: Use GitHub Actions artifacts to pass build outputs between jobs
3. **Conditional Logic**: Use `if` conditions to branch workflow behavior
4. **Environment Protection**: Use `github-pages` environment for deployment job
5. **Permissions Minimization**: Explicitly declare required permissions only

### Vite Build Compatibility

**Current Config**: `base: './'` (relative paths)

**Compatibility Analysis**:
- Relative paths work in subdirectories
- No hardcoded absolute paths in game code
- Phaser asset loading uses relative paths

**Verification**: Existing config supports `/preview/` subdirectory deployment without modification.

**Decision**: No Vite configuration changes required.

---

## Alternatives Considered & Rejected

### 1. Separate Preview Workflow Per PR

**Approach**: Each PR gets its own workflow file or deployment target.

**Rejected Because**: GitHub Pages limitation - only one active deployment. Would require external hosting or GitHub Pages preview feature (currently alpha/unavailable).

### 2. Branch Name in Preview Path

**Approach**: Deploy to `/preview/{branch-name}/`

**Rejected Because**: User requested generic path since only one preview exists. Simpler is better.

### 3. Manual PR Number Input

**Approach**: workflow_dispatch requires PR number parameter.

**Rejected Because**: Branch context is always available and auto-detection is simpler. No manual input needed.

### 4. Third-Party Deployment Actions

**Approach**: Use community actions for deployment orchestration.

**Rejected Because**: Requirement mandates official GitHub Actions only. Security and reliability concerns.

---

## Dependencies Validated

✅ **Node.js 18**: Available on `ubuntu-latest` runners  
✅ **npm ci**: Standard command for CI environments  
✅ **Git**: Available for multi-branch checkout  
✅ **GitHub Pages**: Already configured for repository  
✅ **Actions Permissions**: Repository has `pages: write` and `id-token: write`  
✅ **Existing Build Process**: `npm run build-nolog` command functional

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Main build failure blocks PR preview | Medium | High | Use cached main artifact as fallback |
| Concurrent deployments cause conflicts | High | Medium | Implement cancel-in-progress for PRs |
| Preview deployment breaks production | Low | Critical | Two-step verification: 1) combined artifact structure validation, 2) main-only cleanup |
| Vite paths break in subdirectory | Low | High | Verified `base: './'` works, add post-deployment smoke test |
| GitHub Pages size limit exceeded | Low | High | Existing CI validates build size, no new assets added |
| Workflow complexity increases maintenance | Medium | Medium | Extensive documentation, clear comments, constitution alignment |

---

## Next Steps → Phase 1

✅ Research complete - all clarifications resolved  
→ Proceed to Phase 1: Design data model and contracts
