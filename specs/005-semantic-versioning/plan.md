# Implementation Plan: Automatic Semantic Versioning & Build Metadata Tracking

**Branch**: `005-semantic-versioning` | **Date**: November 23, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-semantic-versioning/spec.md`

## Summary

Implement automatic semantic versioning and build metadata tracking for Mission Kritisk CI/CD pipeline. Version will be calculated from git tags at build-time (source of truth), with build-info.json generated during Vite build containing semantic version, commit SHA, timestamp, deployment type, and (for previews) PR metadata. This enables DevOps to track which version is deployed to production and developers to verify which PR commits correspond to preview deployments.

**Technical Approach**:
- Calculate version from latest git tag using `git describe --tags --abbrev=0` during build
- Create Vite build plugin to generate `.meta/build-info.json` with version, commit, timestamp, deployment type
- Extract PR metadata in deploy-pr-preview workflow and pass via environment variables
- Add separate manual workflow for intentional version bumps (create tags, optionally update package.json)
- Add build validation to confirm build-info.json exists before GitHub Pages deployment

## Technical Context

**Language/Version**: TypeScript (target ES2020), Node.js 18+ (per package.json)  
**Primary Dependencies**: Vite (build tool), GitHub Actions (CI/CD orchestration), Git (version source)  
**Storage**: Git tags for version history, build-info.json static file in deployed site  
**Testing**: Playwright end-to-end tests (existing), workflow validation via build success  
**Target Platform**: GitHub Pages (web deployment), GitHub Actions (CI/CD)
**Project Type**: Vite web application with GitHub Actions CI/CD  
**Performance Goals**: <30 seconds additional build time from versioning logic; version metadata available within 5 minutes of deployment  
**Constraints**: Must not break existing build process; version must be deterministic from git history; no database or external APIs  
**Scale/Scope**: 2 workflow files modified, 1 Vite plugin created (~100 LOC), build-info.json JSON schema defined

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Primary Principles Alignment

| Principle | Status | Impact |
|-----------|--------|--------|
| **I. Scene-Based Architecture** | ✅ Not affected | Versioning is CI/CD layer; no scene changes needed |
| **II. Bilingual Implementation** | ✅ Compliant | build-info.json is machine-readable metadata; no user-facing text |
| **III. Test-Driven Development** | ✅ Compliant | Existing Playwright tests will validate deployment artifacts; new tests for build-info.json validation |
| **IV. CI/CD Pipeline** | ✅ Enhances | This feature improves CI/CD pipeline by adding version tracking and deployment metadata |
| **V. Type Safety & Build Optimization** | ✅ Aligned | TypeScript interfaces for build-info schema; Vite plugin leverages existing build chain |

### Quality Gates

- ✅ **Build Success**: Vite build must complete successfully with new plugin
- ✅ **Test Coverage**: Playwright tests must validate build-info.json presence in deployed artifacts
- ✅ **Type Safety**: build-info JSON schema must be TypeScript-typed
- ✅ **Deployment Validation**: Workflows must verify build-info.json before GitHub Pages deployment
- ✅ **No Regression**: Existing Playwright tests must pass on modified workflows

**Gate Status**: ✅ PASSES - Feature aligns with all constitutional principles; enhances testing and CI/CD practices.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-semantic-versioning/
├── spec.md                          # Feature specification
├── plan.md                          # This file (Phase 1+ design)
├── research.md                      # Phase 0: Research findings (TBD)
├── data-model.md                    # Phase 1: Data model & JSON schema (TBD)
├── quickstart.md                    # Phase 1: Implementation guide (TBD)
├── checklists/
│   └── requirements.md              # Specification quality checklist (✅ complete)
└── contracts/
    ├── build-metadata-schema.md     # Phase 1: build-info.json schema
    ├── version-workflow.md          # Phase 1: Version increment workflow spec
    └── pr-metadata-contract.md      # Phase 1: PR metadata passing contract
```

### Source Code (repository root)

**Workflow Files (GitHub Actions)**
```text
.github/workflows/
├── deploy-main.yml                  # MODIFIED: Add version extraction & build-info.json validation
├── deploy-pr-preview.yml            # MODIFIED: Add PR metadata extraction & environment passing
├── ci.yml                           # UNCHANGED: Regular CI pipeline
└── [NEW] bump-version.yml           # NEW: Manual workflow for version bumps
```

**Build Configuration**
```text
vite/
├── config.prod.mjs                  # MODIFIED: Add build-info.json plugin
└── plugins/
    └── [NEW] generate-build-info.js # NEW: Vite plugin to create build-info.json
```

**Public Assets (deployed)**
```text
.meta/
└── build-info.json                  # Generated during build, deployed to /.meta/build-info.json (production) and /.meta/build-info.json (preview)
```

**Testing**
```text
tests/
├── build.spec.ts                    # MODIFIED: Add assertions for build-info.json presence & validity
└── game.spec.ts                     # UNCHANGED: Existing game tests
```

**Configuration Files**
```text
package.json                         # Version field updated periodically via manual workflow (not automated)
```

**Structure Decision**: This feature modifies existing GitHub Actions workflows and adds a Vite plugin. No new application source code directories needed since versioning is purely build-time/CI/CD concern. The only runtime output is static `build-info.json` deployed with other assets.

---

## Complexity Tracking

> **No constitutional violations identified.** All technical choices align with existing project patterns.

| Decision | Why Chosen | Alternatives Considered |
|----------|-----------|------------------------|
| Git tags as version source | Decouples version from CI/CD automation; explicit control; simple git integration | 1) Auto-increment in package.json (couples build to version); 2) External version service (adds infrastructure) |
| Static build-info.json | No server-side processing needed; works on GitHub Pages; simple to access | 1) Dynamic endpoint (requires server); 2) Embed in HTML (less structured); 3) Query param API (more complex) |
| Vite plugin for metadata | Integrates with existing build chain; no new dependencies; leverages Vite ecosystem | 1) Build script wrapper (less integrated); 2) Post-build step (harder to validate); 3) Template injection (less type-safe) |
| Manual version bump workflow | Explicit deployment events; clear audit trail; no accidental bumps | 1) Auto-increment on every main push (too aggressive); 2) Semantic-release tool (adds complexity) |

---

## Phase 0: Research & Requirements Clarification

**Completion Gate**: All questions resolved, design decisions documented

### Research Tasks

1. **Git tag versioning implementation** ✅ READY
   - Current state: mission-kritisk uses v1.4.0 tag naming (confirmed in existing tags)
   - Task: Document `git describe --tags --abbrev=0` usage in Vite plugin context
   - Deliverable: Example code for safe tag parsing and version extraction

2. **Vite plugin architecture** ✅ READY
   - Current state: vite/config.prod.mjs already uses custom plugins (build-time logging)
   - Task: Design plugin to read environment variables and write JSON to dist/.meta/
   - Deliverable: Plugin code pattern and integration point in config.prod.mjs

3. **GitHub Actions environment variable passing** ✅ READY
   - Current state: deploy-main.yml and deploy-pr-preview.yml already use env vars
   - Task: Document how to extract PR metadata and pass to build step
   - Deliverable: Workflow step examples with ${{ github.event.pull_request.* }} contexts

4. **build-info.json schema & validation** ✅ READY
   - Current state: No build-info.json exists yet
   - Task: Define JSON schema with version, commit, timestamp, deployment type, optional PR fields
   - Deliverable: TypeScript interface and JSON schema definition

5. **Playwright test integration** ✅ READY
   - Current state: tests/build.spec.ts already validates build output
   - Task: Add assertions for build-info.json presence and JSON validity
   - Deliverable: Test cases for both production and preview deployments

### Key Implementation Decisions

- **Version Tag Format**: Existing tags in format `v1.4.0` (e.g., `git tag -a v1.4.0 -m "Release 1.4.0"`). Build extracts: `git describe --tags --abbrev=0 | sed 's/^v//'` → `1.4.0`
- **build-info.json Location**: `.meta/build-info.json` in dist root → deployed to `/.meta/build-info.json` on site
- **PR Metadata Availability**: Only available in `pull_request` events; `workflow_dispatch` uses commit-only metadata
- **Backward Compatibility**: First deployment will use current package.json version (1.4.0) as baseline; subsequent deployments read from tags
- **Workflow Validation**: Add `- name: Validate build artifacts` step before GitHub Pages deployment to confirm build-info.json exists and is valid JSON

---

## Phase 1: Design & Contracts

**Prerequisite**: Phase 0 research complete  
**Deliverables**: data-model.md, build-metadata-schema.md, version-workflow.md, pr-metadata-contract.md, quickstart.md

### 1.1 Data Model (build-info.json schema)

**File**: `specs/005-semantic-versioning/data-model.md` (TBD - to be created)

Key entities:
- **BuildInfo**: Top-level object containing deployment metadata
  - `schema_version`: string (e.g., "1.0.0") - allows future extensibility
  - `version`: string - semantic version from git tag
  - `commit_sha`: string - full git commit hash
  - `commit_short`: string - short commit hash (7 chars)
  - `build_timestamp`: string - ISO 8601 timestamp of build completion
  - `deployment_type`: "production" | "preview"
  - `pr_metadata?`: optional object for preview deployments
    - `number`: number - PR number
    - `title`: string - PR title
    - `branch`: string - PR head branch
    - `base_branch`: string - PR base branch (should be "main")
    - `pr_url`: string - link to PR on GitHub

### 1.2 API Contracts

**File**: `specs/005-semantic-versioning/contracts/build-metadata-schema.md` (TBD - to be created)

```json
{
  "schema_version": "1.0.0",
  "version": "1.4.0",
  "commit_sha": "abc123def456...",
  "commit_short": "abc123d",
  "build_timestamp": "2025-11-23T15:30:45.123Z",
  "deployment_type": "production"
}
```

**File**: `specs/005-semantic-versioning/contracts/version-workflow.md` (TBD - to be created)

Workflow `bump-version.yml` contract:
- Inputs: version bump type (patch|minor|major)
- Process: Extract current version from tags → calculate new version → create git tag → optionally update package.json
- Output: New git tag created, workflow summary shows old→new version

**File**: `specs/005-semantic-versioning/contracts/pr-metadata-contract.md` (TBD - to be created)

Environment variables passed from deploy-pr-preview to build:
```
VITE_PR_NUMBER=${{ github.event.pull_request.number }}
VITE_PR_TITLE=${{ github.event.pull_request.title }}
VITE_PR_HEAD_BRANCH=${{ github.event.pull_request.head.ref }}
VITE_PR_BASE_BRANCH=${{ github.event.pull_request.base.ref }}
VITE_COMMIT_SHA=${{ github.sha }}
```

### 1.3 Quickstart Guide

**File**: `specs/005-semantic-versioning/quickstart.md` (TBD - to be created)

Will include:
- Step-by-step setup instructions
- How to access build-info.json from deployed site
- How to trigger manual version bumps
- Troubleshooting guide
- Example curl commands to inspect metadata

---

## Phase 2: Implementation (Task-Based)

**Prerequisite**: Phase 1 design complete  
**Output**: `/specs/005-semantic-versioning/tasks.md` - created via `/speckit.tasks` command

### High-Level Implementation Steps (Phase 2 will detail):

1. **Create Vite plugin** (`vite/plugins/generate-build-info.js`)
   - Read environment variables (version, commit, PR metadata)
   - Generate build-info.json
   - Write to dist/.meta/ directory

2. **Update vite/config.prod.mjs**
   - Import and register build-info plugin
   - Configure plugin options

3. **Modify .github/workflows/deploy-main.yml**
   - Add version extraction step using git tags
   - Pass version to build step via VITE_APP_VERSION env var
   - Add build-info.json validation before deployment

4. **Modify .github/workflows/deploy-pr-preview.yml**
   - Add PR metadata extraction steps
   - Pass PR data to build steps (both main and PR jobs)
   - Add validation for both production and preview build-info.json files

5. **Create .github/workflows/bump-version.yml** (new workflow)
   - Manual workflow for version bumps (patch/minor/major)
   - Create git tag with new version
   - Optional: update package.json and commit

6. **Update tests/build.spec.ts**
   - Add assertions for build-info.json presence
   - Validate JSON schema
   - Test both production and preview deployments

7. **Add git tags to repository** (one-time setup)
   - Ensure v1.4.0 tag exists (baseline version)
   - Document tag naming convention

8. **Documentation**
   - Create/update README with version tracking explanation
   - Document how to access build-info.json from deployed site
   - Add troubleshooting guide

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Git tag not found at build time | Medium | Fallback to package.json version if tag lookup fails; add git tag as prerequisite |
| Environment variables not passed correctly | Low | Test with simple echo steps in workflow; validate env vars in build output |
| build-info.json not generated | Medium | Add pre-deployment validation step; build fails if file missing |
| PR metadata missing (workflow_dispatch event) | Low | Expected behavior; PR metadata only available on pull_request events; documented as limitation |
| Performance impact on build | Low | Vite plugin is minimal; git operations are fast; <30s overhead well within tolerance |
| Cache busting issues | Low | Hashed filenames from Vite still apply; build-info.json can be version-tagged or immutable |

---

## Testing Strategy

### Unit Tests
- Vite plugin logic: Mock environment variables → verify JSON output structure
- Version parsing: Test git tag format handling

### Integration Tests (Playwright)
- Verify build-info.json deployed and accessible at `/.meta/build-info.json`
- Validate JSON schema for production deployments
- Validate PR metadata presence in preview deployments
- Test version incrementing across multiple deployments (via manual tag creation)

### Manual Testing
- Create test git tag (v1.4.1) → trigger deployment → verify build-info.json
- Open PR → check preview build-info.json contains correct PR metadata
- Manually bump version → verify new tag created and package.json updated

---

## Success Criteria Mapping

| Requirement | Implementation Component | Success Verification |
|-------------|-------------------------|---------------------|
| **SC-001**: Metadata available within 5 min | GitHub Pages deployment artifact | Check file exists after workflow |
| **SC-002**: 100% version accuracy | Vite plugin + git tag integration | Compare build-info.json version with git tag |
| **SC-003**: PR metadata matches GitHub | PR metadata extraction in workflow | Compare build-info.json with GitHub PR API |
| **SC-004**: Identify version in <10 sec | build-info.json accessibility | Manual test of file access |
| **SC-005**: Version history trackable | Sequential build-info.json files | Review archived deployments |
| **SC-006**: No build failures | Workflow validation steps | CI/CD test suite passes |
| **SC-007**: <30 sec overhead | Performance measurement | Time build with/without plugin |

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
