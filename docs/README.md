# Build Metadata Documentation

Complete guide to the automatic semantic versioning and build metadata system for Mission Kritisk.

## Quick Start

### View Current Version

```bash
# Check production version
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .version

# Check which commit is deployed
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .commit_short
```

### Bump Version

1. Go to GitHub Actions → [Bump Version](https://github.com/mortenp1337/mission-kritisk/actions/workflows/bump-version.yml)
2. Click **"Run workflow"**
3. Select bump type: `patch` | `minor` | `major`
4. Click **"Run workflow"**

New version tag created automatically!

### Check PR Preview

```bash
# Which PR is in preview?
curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .pr_metadata.number

# Link to PR
curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq -r .pr_metadata.pr_url
```

## Documentation Files

### 1. **accessing-build-metadata.md** 📡
**For**: Developers, QA, DevOps  
**Contains**: 
- Quick access examples with curl
- Common use cases
- Troubleshooting guide
- Integration examples

**When to use**: Need to know HOW to get the data

---

### 2. **understanding-build-metadata.md** 📖
**For**: Technical leads, DevOps, Developers  
**Contains**:
- Complete JSON schema reference
- Field definitions and data types
- Production vs preview examples
- Version format explanation
- Common queries

**When to use**: Need to understand WHAT data means

---

### 3. **version-bumping-guide.md** 🚀
**For**: Release managers, Team leads  
**Contains**:
- Step-by-step version bump procedures
- Semantic versioning rules (patch/minor/major)
- Decision flowchart for choosing bump type
- Workflow instructions
- Before/after checklists
- Complete version lifecycle examples

**When to use**: Creating a new version release

---

### 4. **pr-preview-testing-guide.md** ✅
**For**: QA, Reviewers, Testers  
**Contains**:
- How to verify PR preview deployments
- PR metadata verification
- Practical testing scenarios
- Comparison methods (production vs preview)
- Troubleshooting
- Manual testing checklist

**When to use**: Testing a PR before merge

---

### 5. **.github/version-strategy.md** 🏗️
**For**: Maintainers, architects  
**Contains**:
- Version management strategy overview
- Git tag approach explanation
- Version format and lifecycle
- Relationships with package.json

**When to use**: Understanding system design

---

## Common Tasks

| Task | File | Command |
|------|------|---------|
| Access build metadata | accessing-build-metadata.md | `curl /.meta/build-info.json \| jq .` |
| Understand schema | understanding-build-metadata.md | View the file |
| Create new version | version-bumping-guide.md | Actions → Bump Version |
| Test PR preview | pr-preview-testing-guide.md | Refer to testing checklist |
| Understand design | version-strategy.md | View the file |

## File Structure

```
/.meta/build-info.json                  # Production metadata
/preview/.meta/build-info.json          # Preview metadata (PR)
docs/
  ├── accessing-build-metadata.md        # Quick access guide
  ├── understanding-build-metadata.md    # Schema reference
  ├── version-bumping-guide.md           # Release procedures
  ├── pr-preview-testing-guide.md        # Preview testing
  ├── README.md                          # This file
.github/
  ├── version-strategy.md                # Technical design
  └── workflows/
      ├── deploy-main.yml                # Production deployment
      ├── deploy-pr-preview.yml          # Preview deployment
      └── bump-version.yml               # Version control
```

## Key Concepts

### Version Format
- **Format**: `vX.Y.Z` (semantic versioning)
- **Example**: `v0.0.5` (major 0, minor 0, patch 5)
- **Source**: Git tags (source of truth)

### Build Metadata Fields
- `version` - Application version from git tag
- `commit_sha` - Full git commit hash (40 hex characters)
- `commit_short` - Short commit hash (7 hex characters)
- `build_timestamp` - When built (ISO 8601 UTC)
- `deployment_type` - "production" or "preview"
- `pr_metadata` - GitHub PR info (preview only)

### Deployment Types
- **Production**: Main branch deployment, no PR metadata
- **Preview**: PR deployment, includes PR metadata

## Real-World Examples

### Example 1: Check Production Version

```bash
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .
```

Output:
```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "a1b2c3d4...",
  "commit_short": "a1b2c3d",
  "build_timestamp": "2025-11-23T14:22:18.456Z",
  "deployment_type": "production"
}
```

**Interpretation**: Version 0.0.5 is deployed from commit a1b2c3d

---

### Example 2: Create New Feature Release

1. Finish implementing feature on your PR
2. Get PR merged to main
3. Go to Actions → Bump Version
4. Select `minor` (because it's a new feature)
5. Click "Run workflow"
6. New version `v0.1.0` created
7. Next deploy uses version 0.1.0

---

### Example 3: Test PR Before Merge

```bash
# Check which PR is in preview
curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .pr_metadata

# Output shows:
{
  "number": 42,
  "title": "Add rainbow tower",
  "branch": "feature/rainbow-tower",
  "base_branch": "main",
  "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
}
```

**Interpretation**: PR #42 is in preview, ready for testing

---

## Troubleshooting

### "404 Not Found" on build-info.json

**Problem**: Cannot access `/.meta/build-info.json`

**Causes**:
1. Build hasn't completed yet (wait ~5 minutes)
2. Workflow failed (check Actions tab)
3. File not deployed (check GitHub Pages settings)

**Solution**: Check workflow logs in GitHub Actions

---

### "PR metadata is null" on production

**Problem**: Production has `"pr_metadata": null` or missing

**Expected**: This is correct! PR metadata only exists on previews.

**Verification**: Check production shows `"deployment_type": "production"` (no pr_metadata)

---

### Version number incorrect

**Problem**: Version shows wrong number

**Causes**:
1. Latest git tag is old
2. Bump workflow didn't create tag

**Solution**:
```bash
# Check current git tags
git tag -l | tail -5

# Manually create tag if needed
git tag -a v0.0.6 -m "Bug fix release"
git push origin v0.0.6
```

---

## Testing

### Run Build Tests

```bash
# Using production build (recommended)
npm test -- --config=playwright.config.prod.ts tests/build.spec.ts

# Tests verify:
# ✓ build-info.json accessibility
# ✓ JSON schema validity
# ✓ Version format (X.Y.Z)
# ✓ Commit SHA format
# ✓ Timestamp format
```

### Manual Verification

```bash
# 1. Build production
npm run build-nolog

# 2. Check build-info.json exists
ls -la dist/.meta/build-info.json

# 3. Verify JSON is valid
cat dist/.meta/build-info.json | jq .

# 4. Check required fields
cat dist/.meta/build-info.json | jq 'keys'
```

## Further Reading

- **GitHub Semantic Versioning Guide**: https://semver.org/
- **ISO 8601 Timestamp Format**: https://en.wikipedia.org/wiki/ISO_8601
- **Git Tagging**: https://git-scm.com/book/en/v2/Git-Basics-Tagging
- **Vite Plugin API**: https://vitejs.dev/guide/api-plugin.html

## Support

- **Questions about accessing data**: See `accessing-build-metadata.md`
- **Questions about data structure**: See `understanding-build-metadata.md`
- **Questions about versioning**: See `version-bumping-guide.md`
- **Questions about testing**: See `pr-preview-testing-guide.md`
- **Questions about design**: See `.github/version-strategy.md`

---

**Last Updated**: November 23, 2025  
**Status**: Complete and Production Ready  
**Tests**: All Passing (24/24)
