# Version Bumping Guide

**How to create new versions of Mission Kritisk using the manual release workflow**

## Quick Start

To bump the version:

1. Go to GitHub → **Actions** tab
2. Find **"Bump Version"** workflow
3. Click **"Run workflow"**
4. Select **bump type**:
   - `patch` - Bug fixes (0.0.5 → 0.0.6)
   - `minor` - New features (0.0.5 → 0.1.0)
   - `major` - Breaking changes (0.0.5 → 1.0.0)
5. Optionally check `update-package-json` to sync package.json version
6. Click **"Run workflow"**

New version will be created as a git tag and pushed to GitHub.

## Understanding Semantic Versioning

### Version Format

`MAJOR.MINOR.PATCH`

Example: `0.0.5`

### Bump Types

| Type | When to Use | Example | Used For |
|------|------------|---------|----------|
| **Patch** | Bug fixes, minor improvements | 0.0.5 → 0.0.6 | Hotfixes, patches |
| **Minor** | New features, backward compatible | 0.0.5 → 0.1.0 | Feature releases |
| **Major** | Breaking changes, incompatible | 0.0.5 → 1.0.0 | Major milestones |

### Decision Flowchart

```
Did you change code?
├─ Bug fix, performance improvement? → PATCH
├─ Add new feature (backward compatible)? → MINOR
├─ Remove feature, break compatibility? → MAJOR
└─ Only docs/comments? → Don't bump
```

## Workflow Details

### The bump-version.yml Workflow

**Location**: `.github/workflows/bump-version.yml`

**What it does**:
1. Reads the current version from the latest git tag (e.g., v0.0.5)
2. Calculates the new version based on bump type
3. Creates a new git tag (e.g., v0.0.6)
4. Pushes the tag to GitHub
5. Optionally updates package.json and commits to main

**Outputs**: Displays the release summary in the workflow output

### Workflow Inputs

**bump-type** (required):
- `patch` - Increment patch version
- `minor` - Increment minor version, reset patch to 0
- `major` - Increment major version, reset minor and patch to 0

**update-package-json** (optional):
- Checked: Updates `version` in package.json and commits to main
- Unchecked: Only creates git tag (default)

## Step-by-Step: Creating a New Release

### Scenario 1: Bug Fix Release (Patch)

**Current version**: 0.0.5
**Change**: Fixed zombie spawn bug
**New version**: 0.0.6

**Steps**:
1. Merge your bugfix PR to main
2. Go to Actions → Bump Version
3. Select `patch`
4. Leave `update-package-json` unchecked
5. Click "Run workflow"
6. Wait for completion (~10 seconds)
7. GitHub creates tag `v0.0.6` and pushes it

**Result**: Next deploy to main will use version 0.0.6

### Scenario 2: Feature Release (Minor)

**Current version**: 0.0.5
**Change**: Added new tower type
**New version**: 0.1.0

**Steps**:
1. Merge your feature PR to main
2. Go to Actions → Bump Version
3. Select `minor`
4. Check `update-package-json` (optional but recommended)
5. Click "Run workflow"
6. Wait for completion
7. GitHub creates tag `v0.1.0` and optionally commits to main

**Result**: Package.json synced, next deploy uses version 0.1.0

### Scenario 3: Major Release (Major)

**Current version**: 0.1.5
**Change**: Complete game redesign
**New version**: 1.0.0

**Steps**:
1. Merge breaking changes to main
2. Go to Actions → Bump Version
3. Select `major`
4. Check `update-package-json`
5. Click "Run workflow"
6. Wait for completion
7. GitHub creates tag `v1.0.0`

**Result**: Marks official 1.0 release

## Workflow Execution

### Running the Workflow

**Via GitHub UI**:
1. Navigate to repository home: https://github.com/mortenp1337/mission-kritisk
2. Click **Actions** tab
3. Click **Bump Version** in workflows list (left sidebar)
4. Click **"Run workflow"** button (blue dropdown)
5. Select inputs
6. Click **"Run workflow"** (in dialog)

**Via GitHub CLI**:
```bash
# Install GitHub CLI if needed
# Then:
gh workflow run bump-version.yml -f bump-type=patch -f update-package-json=false
```

### Monitoring Execution

1. Click on the workflow run that just started
2. Watch the job progress in real-time
3. Once green checkmark appears, version is bumped

### Workflow Output

After completion, you'll see:

```
Release Summary:
- Previous version: v0.0.5
- New version: v0.0.6
- Bump type: patch
- Git tag created: v0.0.6
- GitHub URL: https://github.com/mortenp1337/mission-kritisk/releases/tag/v0.0.6
```

## Important Considerations

### Version Tag Format

- Format: `vX.Y.Z` (e.g., `v0.0.5`)
- Always lowercase `v`
- Must be valid semantic version
- Tags are immutable once created

### Sync with package.json (Optional)

**When to check `update-package-json`**:
- Publishing to npm (if applicable)
- Want package.json version to match git version
- CI/CD reads version from package.json

**When to leave unchecked**:
- Don't publish to npm
- Git is source of truth
- Simpler workflow (fewer commits)

**Note**: For this project, git tags are the primary version source. Package.json update is optional synchronization.

### Before Bumping

Checklist before creating a new version:

- [ ] All changes merged to main
- [ ] All CI/CD tests passing
- [ ] No outstanding PRs with important fixes
- [ ] Ready to deploy this version immediately (or soon)
- [ ] Decided on bump type (patch/minor/major)
- [ ] Considered impact on users

### What Happens After Bumping

1. **Immediate**: Git tag created and pushed to GitHub
2. **Next commit to main**: New commit hashes won't use old version
3. **Next deployment to main**: Uses new version in build-info.json
4. **PR preview**: Still shows version based on latest tag on main

## Troubleshooting

### Workflow Failed

**Error**: "fatal: no tags found"

- **Cause**: No initial tag exists
- **Solution**: Repository should have v0.0.5 tag from setup. If missing, ask maintainer.

**Error**: "Permission denied"

- **Cause**: Insufficient GitHub permissions
- **Solution**: Must have write access to repository

### Accidental Version Bump

**Scenario**: Bumped to 0.0.6 but meant to bump to 0.1.0

**Solution**:
1. Delete the incorrect tag locally and remote:
   ```bash
   git tag -d v0.0.6
   git push origin :refs/tags/v0.0.6
   ```
2. Run workflow again with correct bump type

### Tag Already Exists

**Error**: "tag already exists"

- **Cause**: Tag was created manually or by mistake
- **Solution**: Delete and recreate using workflow

## Version Lifecycle

### Complete Version Timeline

```
v0.0.1          v0.0.5          v0.1.0
  |                |               |
  +--- Patch bugs--+-- Feature ----+-- Major
  |                |               |
  |                |               v
Deploy 0.0.1   Deploy 0.0.5    Deploy 0.1.0
  |                |               |
Build-info   Build-info       Build-info
shows 0.0.1  shows 0.0.5      shows 0.1.0
```

### Release Notes

When you bump a version, consider:

1. **Creating a GitHub Release**:
   - Go to Releases page
   - Click "Create release"
   - Select the newly created tag
   - Add release notes describing changes

2. **Changelog entry**:
   - Update CHANGELOG.md (if exists)
   - Document what changed since last version

## Integration with Deployments

### How Deployments Use Versions

1. **Workflow creates version tag**: `git tag v0.0.6`
2. **Deploy-main workflow runs**: Reads version from tag
3. **Vite build includes version**: `build-info.json` contains "0.0.6"
4. **GitHub Pages deployment**: Serves with build metadata
5. **Users can verify**: Check `/.meta/build-info.json` to confirm version

### Version Visibility

**In production**:
```bash
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .version
# Output: 0.0.6
```

**In GitHub**:
- Releases page: Shows v0.0.6 tag
- Deploy workflow logs: Show version extraction step

## Examples

### Example 1: Hotfix Release

```
Main branch: 0.0.5 (deployed in production)
Issue: Game crash bug found
Action: Create bugfix PR → merge to main
Workflow: Run with bump-type=patch
Result: Tag v0.0.6 created, deploy-main runs, version 0.0.6 now live
```

### Example 2: Quarterly Release

```
Main branch: 0.2.3 (deployed in production)
Development: New features finished in multiple PRs
Action: Merge all feature PRs → ensure all tests pass
Workflow: Run with bump-type=minor and update-package-json=true
Result: Tag v0.3.0 created, package.json updated, version 0.3.0 deployed
```

### Example 3: Stable Milestone

```
Main branch: 0.4.2 (deployed in production)
Milestone: Ready for v1.0.0 release
Action: All features complete, tested thoroughly
Workflow: Run with bump-type=major and update-package-json=true
Result: Tag v1.0.0 created, marks official 1.0 milestone
```

## Quick Reference

| Task | Command/Steps |
|------|---|
| Bump patch | Actions → Bump Version → patch → Run |
| Bump minor | Actions → Bump Version → minor → Run |
| Bump major | Actions → Bump Version → major → Run |
| Sync package.json | Check `update-package-json` when running |
| View current version | `git describe --tags --abbrev=0` |
| View all tags | `git tag -l` |
| Create manual tag (if needed) | `git tag -a v0.0.5 && git push origin v0.0.5` |
| Delete tag (undo mistake) | `git tag -d v0.0.5 && git push origin :refs/tags/v0.0.5` |
