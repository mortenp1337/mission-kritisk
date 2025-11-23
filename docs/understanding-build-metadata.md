# Understanding Build Metadata (build-info.json)

**Reference guide for the build-info.json structure and all available fields**

## File Location

- **Production**: `/.meta/build-info.json` on deployed site
- **Preview**: `/preview/.meta/build-info.json` on PR preview

**Example URLs**:
- https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json
- https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json

## Complete JSON Schema

### All Fields (Reference)

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "abc123def456abc123def456abc123def456abc1",
  "commit_short": "abc123d",
  "build_timestamp": "2025-11-23T15:30:45.123Z",
  "deployment_type": "production",
  "pr_metadata": null
}
```

### Field Definitions

| Field | Type | Presence | Description |
|-------|------|----------|-------------|
| `schema_version` | string | Always | Format: "X.Y.Z". Allows schema evolution. Current: "1.0.0" |
| `version` | string | Always | Semantic version from latest git tag. Format: "X.Y.Z" |
| `commit_sha` | string | Always | Full git commit hash. 40 hexadecimal characters |
| `commit_short` | string | Always | Short git commit hash. First 7 characters of commit_sha |
| `build_timestamp` | string | Always | ISO 8601 UTC timestamp of when build completed |
| `deployment_type` | string | Always | Either "production" or "preview" |
| `pr_metadata` | object | Preview only | GitHub PR information. Omitted for production |

### PR Metadata Object (Preview Only)

Only present when `deployment_type` is "preview":

```json
{
  "number": 42,
  "title": "Add semantic versioning support",
  "branch": "feature/semantic-versioning",
  "base_branch": "main",
  "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `number` | number | Pull request number on GitHub |
| `title` | string | Full title of the pull request |
| `branch` | string | Head branch name (feature branch) |
| `base_branch` | string | Base branch (usually "main") |
| `pr_url` | string | Direct URL to PR on GitHub.com |

## Production Deployment Example

When main branch is deployed:

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b",
  "commit_short": "a1b2c3d",
  "build_timestamp": "2025-11-23T14:22:18.456Z",
  "deployment_type": "production"
}
```

**Interpretation**:
- Game version: 0.0.5
- Deployed from commit: a1b2c3d (short) / a1b2c3d4e5f6... (full)
- Built: November 23, 2025 at 14:22:18 UTC
- Type: Production (not a PR preview)

## Preview Deployment Example

When PR #42 is deployed:

```json
{
  "schema_version": "1.0.0",
  "version": "0.0.5",
  "commit_sha": "x9y8z7w6v5u4x9y8z7w6v5u4x9y8z7w6v5u4x9y",
  "commit_short": "x9y8z7w",
  "build_timestamp": "2025-11-23T14:45:22.789Z",
  "deployment_type": "preview",
  "pr_metadata": {
    "number": 42,
    "title": "Add semantic versioning support",
    "branch": "feature/semantic-versioning",
    "base_branch": "main",
    "pr_url": "https://github.com/mortenp1337/mission-kritisk/pull/42"
  }
}
```

**Interpretation**:
- Preview of PR #42: "Add semantic versioning support"
- PR branch: feature/semantic-versioning (merging into main)
- Preview built from commit: x9y8z7w (short) / x9y8z7w6v5u4... (full)
- Built: November 23, 2025 at 14:45:22 UTC
- Type: Preview (temporary for PR testing)

## Version String Format

### Semantic Versioning (SemVer)

`MAJOR.MINOR.PATCH`

**Examples**:
- `0.0.1` - First patch release
- `0.0.5` - Fifth patch release
- `0.1.0` - First minor release (new features)
- `1.0.0` - First major release (stable)
- `1.2.3` - Major 1, Minor 2, Patch 3
- `2.0.0` - Second major version (breaking changes)

**Rules**:
- X, Y, Z are non-negative integers
- No leading zeros
- Increments are independent (e.g., 1.2.3 → 2.0.0, not 2.0.1)

## Commit Hash Format

### Full SHA
- 40 hexadecimal characters (0-9, a-f)
- Unique identifier for exact commit
- Example: `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b`

### Short SHA
- First 7 characters of full SHA
- Sufficient for most purposes in GitHub UI
- Example: `a1b2c3d` (from full above)

**Why both?**:
- Full SHA: For precise git operations
- Short SHA: For human-readable display and GitHub links

## Timestamp Format

### ISO 8601 UTC
- Format: `YYYY-MM-DDTHH:MM:SS.sssZ`
- Always UTC (Z suffix)
- Millisecond precision (sss)

**Examples**:
- `2025-11-23T14:22:18.456Z` - November 23, 2025 at 2:22:18 PM UTC
- `2025-12-31T23:59:59.999Z` - December 31, 2025 at 11:59:59 PM UTC

**Parsing**:
```javascript
const timestamp = new Date("2025-11-23T14:22:18.456Z");
console.log(timestamp); // Date object
console.log(timestamp.toLocaleString()); // Local time
```

## Schema Versioning

The `schema_version` field allows the build-info structure to evolve:

- **Current**: 1.0.0
- **Future updates**: Could be 1.1.0, 2.0.0, etc.

**Backward compatibility**: Tools should ignore unknown fields rather than erroring.

**Example migration scenario**:
- Version 1.0.0: Current (fields shown above)
- Version 1.1.0: Could add optional `build_duration` field
- Version 2.0.0: Could add required fields or remove old ones

Clients should:
1. Check `schema_version` to determine compatibility
2. Gracefully handle unknown fields
3. Warn if version is newer than supported

## Common Queries

### Get just the version number

```bash
curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .version
# Output: 0.0.5
```

### Get PR number from preview

```bash
curl -s https://mortenp1337.github.io/mission-kritisk/preview/.meta/build-info.json | jq .pr_metadata.number
# Output: 42
```

### Check deployment type

```bash
curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .deployment_type
# Output: production
```

### Get commit link

```bash
# Use commit_short to link on GitHub
# https://github.com/mortenp1337/mission-kritisk/commit/<commit_short>
```

### Verify build is recent

```bash
# Compare build_timestamp with current time
BUILD_TIME=$(curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq -r .build_timestamp)
echo "Built at: $BUILD_TIME"
```

## Integration Examples

### Check in CI/CD

```bash
#!/bin/bash
# Verify build-info.json exists and is valid
if ! curl -sf https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json | jq . > /dev/null 2>&1; then
  echo "ERROR: build-info.json is missing or invalid"
  exit 1
fi
echo "✅ Build metadata is valid"
```

### Monitor in application

```javascript
// JavaScript
fetch('/.meta/build-info.json')
  .then(r => r.json())
  .then(buildInfo => {
    console.log(`Running version ${buildInfo.version}`);
    console.log(`Built: ${buildInfo.build_timestamp}`);
  });
```

### Store in log

```bash
#!/bin/bash
# Log deployment metadata
METADATA=$(curl -s https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json)
echo "Deployment at $(date): $METADATA" >> deployment.log
```
