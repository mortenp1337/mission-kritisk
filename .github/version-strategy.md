# Version Strategy

**Document**: Semantic versioning and version tag management for Mission Kritisk  
**Created**: November 23, 2025

## Overview

Mission Kritisk uses **git tags** as the single source of truth for versioning. Version is calculated at build-time from the latest git tag, not stored in the application code or automatically incremented in CI/CD.

## Version Format

All version tags follow **semantic versioning** (semver):

```
vX.Y.Z
```

Where:
- **X** = Major version (breaking changes)
- **Y** = Minor version (new features)
- **Z** = Patch version (bug fixes)

### Examples

- `v1.4.0` - Version 1.4.0
- `v1.4.1` - Version 1.4.1 (patch bump)
- `v2.0.0` - Version 2.0.0 (major bump)
- `v1.5.0` - Version 1.5.0 (minor bump)

**Note**: Tags are prefixed with `v` for consistency with Git conventions.

## Version Lifecycle

### Current Version Retrieval

During build, the Vite plugin retrieves the current version using:

```bash
git describe --tags --abbrev=0
```

This returns the latest tag (regardless of branch), which is then stripped of the `v` prefix.

**Fallback**: If no tags exist, version defaults to the `version` field in `package.json`.

### Version Bumping

**Manual Process**: DevOps engineer manually triggers the `bump-version.yml` workflow with:
- Bump type: `patch` | `minor` | `major`

**Workflow Actions**:
1. Extracts current version from latest tag
2. Calculates new version based on bump type
3. Creates new git tag with new version
4. Pushes tag to repository
5. (Optional) Updates `package.json` and commits to main

**Example Flow**:
- Current tag: `v1.4.2`
- Manual trigger: Bump type = `minor`
- Result: New tag `v1.5.0` created and pushed

### Initial Setup

The initial version baseline is established by an initial git tag. For Mission Kritisk:

```bash
git tag -a v1.4.0 -m "Initial version baseline"
git push origin v1.4.0
```

This creates the foundation from which all future versions are calculated.

## Relationship with package.json

The `package.json` version field is **optional** and used for:
- NPM package metadata (if package is published)
- Fallback version if no git tags exist
- Reference documentation

The `version` field in `package.json` should be kept approximately in sync with the latest git tag, but this is **not enforced** by CI/CD. It is updated manually via the `bump-version.yml` workflow when desired (optional step).

## Build-Time Version Injection

During Vite build:

1. Plugin reads latest git tag
2. Extracts version (removes `v` prefix)
3. Passes to build via environment variable
4. Writes to `build-info.json` in deployed artifact

**Timeline**:
- Version determined at **build time** (not deployment time)
- Version is **deterministic** from git history
- Version is **immutable** once deployed

## Accessing Current Version

### For DevOps

Access deployed `build-info.json`:

```bash
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json
```

Output:
```json
{
  "version": "1.4.2",
  "commit_sha": "abc123def456...",
  "build_timestamp": "2025-11-23T15:30:45.123Z",
  "deployment_type": "production"
}
```

### Via Git

List all version tags:

```bash
git tag -l "v*" --sort=-version:refname
```

Show specific tag:

```bash
git describe --tags --abbrev=0
```

## Workflow Documentation

See `.github/workflows/bump-version.yml` for the manual workflow that handles version bumping.

## Troubleshooting

### "No git tags found" Warning

If you see: `[build-info] No git tags found, falling back to package.json version`

**Solution**: Initialize the first version tag:

```bash
git tag -a v1.4.0 -m "Initial version"
git push origin v1.4.0
```

### Version Mismatch Between Deployments

Versions should monotonically increase. If you see decreasing versions:

**Likely cause**: Deployment from older branch without newer tags

**Solution**: Ensure all version tags are pushed to origin: `git push origin --tags`

### build-info.json Shows "unknown" Version

If version shows as "unknown" or "0.0.0":

1. Check git tags exist: `git tag -l`
2. Check git describe works: `git describe --tags --abbrev=0`
3. Check package.json has version field as fallback

## Best Practices

1. **Always push tags**: After creating a new tag, push it: `git push origin v1.5.0`
2. **Use consistent naming**: Always use `vX.Y.Z` format
3. **Create descriptive tag messages**: `git tag -a v1.5.0 -m "Release v1.5.0: Add feature X and fix Y"`
4. **Update package.json periodically**: Keep it in sync with latest tag for clarity
5. **Document major versions**: Create release notes with each major version bump

## Related Documentation

- Implementation plan: `/specs/005-semantic-versioning/plan.md`
- Build metadata schema: `/specs/005-semantic-versioning/data-model.md` (TBD)
- Workflow documentation: `.github/workflows/bump-version.yml` (TBD)
