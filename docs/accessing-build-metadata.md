# Accessing Build Metadata

**How to view version and deployment information for Mission Kritisk**

## Quick Access

View the deployment metadata directly from the deployed site:

```bash
curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json
```

Or open in your browser:
- **Production**: https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json
- **Preview**: https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json

## What Information is Available

### Production Deployment

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "abc123def456... (40 hex chars)",
  "commit_short": "abc123d",
  "build_timestamp": "2025-11-23T15:30:45.123Z",
  "deployment_type": "production"
}
```

**Available Fields**:
- `version`: Semantic version (X.Y.Z format) from git tag
- `commit_sha`: Full git commit hash (40 characters)
- `commit_short`: Short git commit hash (7 characters)
- `build_timestamp`: When the build was created (ISO 8601 format)
- `deployment_type`: Always "production" for main branch

### Preview Deployment

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "def456abc123... (40 hex chars)",
  "commit_short": "def456a",
  "build_timestamp": "2025-11-23T16:45:30.456Z",
  "deployment_type": "preview",
  "pr_metadata": {
    "number": 42,
    "title": "Add version tracking feature",
    "branch": "feature/semantic-versioning",
    "base_branch": "main",
    "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
  }
}
```

**Additional Fields for Preview**:
- `pr_metadata`: Contains pull request information
  - `number`: PR number on GitHub
  - `title`: PR title
  - `branch`: Feature branch name
  - `base_branch`: Base branch (usually "main")
  - `pr_url`: Direct link to the pull request

## Use Cases

### For Developers

**Verify you're testing the right code:**

1. Open your PR preview: https://mortenp1337.github.io/mission-kritisk/preview/
2. Check the metadata: https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json
3. Verify `pr_metadata.number` matches your PR number
4. Compare `commit_short` with your latest commit

### For QA/Testers

**Confirm deployment before testing:**

```bash
# Check production version
curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq .version

# Check if it's your expected version
# Output should be X.Y.Z format
```

### For DevOps

**Track version history:**

1. Visit production site
2. Check `.meta/build-info.json` 
3. Note the version and timestamp
4. Compare with previous deployments

**Verify deployment succeeded:**

- If `.meta/build-info.json` is accessible and valid JSON → deployment succeeded
- If file is missing or invalid → deployment may have failed

### Automated Monitoring

Use in scripts or monitoring tools:

```bash
#!/bin/bash
# Check if current production is a specific version
CURRENT_VERSION=$(curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .version)

if [ "$CURRENT_VERSION" = "0.0.6" ]; then
  echo "✅ Production is on version 0.0.6"
else
  echo "⚠️  Production is on version $CURRENT_VERSION (expected 0.0.6)"
fi
```

## Understanding Version Format

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.?.?): Breaking changes in the game
- **MINOR** (?.X.?): New features (backwards compatible)
- **PATCH** (?.?.X): Bug fixes

Examples:
- `0.0.5` → Initial releases, patch fixes
- `0.1.0` → First feature release
- `1.0.0` → First stable release
- `1.1.0` → New feature in stable version
- `2.0.0` → Major breaking changes

### How Versions are Created

1. **Manual bumping**: DevOps triggers `bump-version.yml` workflow
   - Selects bump type: patch | minor | major
   - Workflow calculates new version
   - Creates git tag (e.g., `v0.0.6`)
   - Pushes tag to GitHub

2. **Build time**: Vite plugin reads latest git tag
   - Extracts version from tag
   - Includes in `build-info.json`
   - Deployed with site

3. **Optional**: Update `package.json`
   - bump-version.yml can optionally update package.json
   - Keeps npm metadata in sync

## Troubleshooting

### "build-info.json not found"

**Problem**: Accessing `.meta/build-info.json` returns 404

**Solution**:
- Wait 5-10 minutes for deployment to complete
- Check GitHub Actions workflow status
- Verify URL is correct (check for typos)
- Try production: https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json

### "Invalid JSON"

**Problem**: File exists but contains invalid JSON

**Solution**:
- Try again (it may still be deploying)
- Check recent workflow failures
- Report issue if consistently invalid

### "Version doesn't match expected"

**Problem**: Deployed version is different from expected

**Solution**:
- Check if your version bump was successful in Actions
- Verify git tag was created: `git tag -l | grep v0.0`
- May take 5 minutes to deploy after tag push

### Preview URL shows production content

**Problem**: `/preview/.meta/build-info.json` shows production data

**Solution**:
- Preview only exists during open PRs
- After PR is closed/merged, preview is removed
- Production remains at root

## Related Documentation

- [Version Strategy](../.github/version-strategy.md) - How versioning works
- [Implementation Plan](../specs/005-semantic-versioning/plan.md) - Technical details
