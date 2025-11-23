# Feature Specification: Automatic Semantic Versioning & Build Metadata Tracking

**Feature Branch**: `005-semantic-versioning`  
**Created**: November 23, 2025  
**Status**: Draft  
**Input**: User description: "Implement automatic semantic versioning for main branch deployments and inject commit/PR metadata into preview deployments to track which version is running. Auto-increment patch version (0.0.x) for main branch builds, with manual workflows available for major/minor releases. Include commit SHA and PR information in preview deployments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - DevOps Engineer: Track Production Deployment Versions (Priority: P1)

As a DevOps engineer, I want to see which version of the game is deployed to the production GitHub Pages site so that I can coordinate deployments, understand which commits are live, and troubleshoot version-specific issues.

**Why this priority**: This is the core requirement - production visibility is essential for deployment tracking and troubleshooting.

**Independent Test**: Can be fully tested by checking the deployed site's metadata and confirming it reflects the deployed commit and semantic version.

**Acceptance Scenarios**:

1. **Given** a push to `main` branch with commits, **When** the deploy-main workflow completes, **Then** a build-info.json file is deployed containing the semantic version (1.4.1, 1.4.2, etc.), commit SHA, and build timestamp
2. **Given** the production site is live, **When** a user/DevOps engineer checks the build metadata, **Then** they can determine the exact version running without checking git history
3. **Given** multiple deployments to main, **When** viewing build metadata across deployments, **Then** the patch version increments (1.4.0 → 1.4.1 → 1.4.2) automatically

---

### User Story 2 - Developer: Track PR Preview Deployment Commits (Priority: P1)

As a developer, I want to know which commit, PR number, and PR title correspond to the preview deployment I'm testing so that I can easily identify the exact changes being tested and trace them back to the PR discussion.

**Why this priority**: PR preview metadata is essential for testing validation and developer workflow. Developers need to confirm they're testing the right code.

**Independent Test**: Can be fully tested by opening a PR, checking the preview deployment's metadata, and confirming it matches the PR information visible in GitHub.

**Acceptance Scenarios**:

1. **Given** a PR is opened with a specific commit and title, **When** the deploy-pr-preview workflow completes, **Then** build-info.json in `/preview/` contains the PR number, PR title, commit SHA, and branch name
2. **Given** a developer is testing a preview deployment, **When** they check the preview build metadata, **Then** they can immediately identify which PR this preview corresponds to
3. **Given** a PR is updated with new commits, **When** the preview redeployment completes, **Then** the build metadata reflects the new commit SHA and is updated automatically

---

### User Story 3 - DevOps Engineer: Manual Release Workflow for Major/Minor Versions (Priority: P2)

As a DevOps engineer, I want manual workflows to create major and minor version releases so that I can control when significant releases happen independently of the automatic patch versioning.

**Why this priority**: Provides control over release cadence for strategic releases. P2 because automatic patch versioning alone provides immediate value; manual control is an enhancement.

**Independent Test**: Can be tested by manually triggering a release workflow and confirming package.json version updates appropriately (e.g., 1.4.10 → 2.0.0 or 1.4.10 → 1.5.0).

**Acceptance Scenarios**:

1. **Given** the deploy-main workflow exists, **When** a DevOps engineer manually triggers a major version release workflow, **Then** version increments from X.Y.Z to (X+1).0.0
2. **Given** a major version release workflow is triggered, **When** the deployment completes, **Then** the package.json version is updated and committed to main
3. **Given** the deploy-main workflow exists, **When** a DevOps engineer manually triggers a minor version release workflow, **Then** version increments from X.Y.Z to X.(Y+1).0

---

### User Story 4 - Reviewer/QA: Access Version Info from Deployed Site (Priority: P2)

As a code reviewer or QA tester, I want to easily access version/build information directly from the deployed site (not just from workflow artifacts) so that I can quickly confirm which version I'm testing without hunting through GitHub Actions logs.

**Why this priority**: Improves developer experience and testing workflow. P2 because it's primarily a convenience feature; the data exists if users check artifacts.

**Independent Test**: Can be tested by accessing a URL endpoint or file and confirming it returns valid build metadata in a consistent format.

**Acceptance Scenarios**:

1. **Given** a deployment is complete, **When** a tester accesses `/.meta/build-info.json`, **Then** they receive a JSON response containing version, commit, timestamp, and (if preview) PR information
2. **Given** multiple deployments exist, **When** comparing build-info.json files across deployments, **Then** the data structure is consistent and complete

---

### Edge Cases

- What happens when a workflow_dispatch trigger is used instead of a pull_request event? (Build metadata should reflect dispatch context, not PR context)
- How does the system handle the first ever build after versioning is implemented? (Initialize from current package.json version)
- What if main branch build fails but PR preview succeeds? (PR preview should still include commit metadata even without main build context)
- What if a PR is opened against a branch other than main? (Metadata should still capture PR information correctly; warning if base branch isn't main)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The deploy-main workflow MUST automatically extract the current version from `package.json`, increment the patch version (third number), and pass it to the build process
- **FR-002**: The build process MUST generate a `build-info.json` file in the dist/ root containing: semantic version, commit SHA, build timestamp, and deployment type (production/preview)
- **FR-003**: The deploy-pr-preview workflow MUST extract PR metadata (number, title, branch, base branch) from GitHub Actions context and pass it to the build process
- **FR-004**: For preview deployments, the `build-info.json` file (in `dist/preview/`) MUST include: PR number, PR title, head branch, base branch, commit SHA, and a link back to the PR
- **FR-005**: The Vite build configuration MUST read environment variables containing version and metadata, inject them into the dist/ directory via build-info.json, and make them accessible without server-side processing
- **FR-006**: Version information MUST be calculated from the latest git tag during build, with version determined by semver tag format (e.g., v1.4.2)
- **FR-006b**: A separate manual workflow MUST exist to update `package.json` version field to match the latest git tag when desired (not automated with every build)
- **FR-007**: The build-info.json file MUST be valid JSON, properly formatted, and include a schema version for future extensibility
- **FR-008**: Workflows MUST validate that build-info.json exists and is properly formed before deploying to GitHub Pages

### Key Entities

- **Build Info**: Contains metadata about a deployment including version, commit SHA, timestamps, deployment type, and (optionally) PR information
  - Version: Semantic version string (e.g., "1.4.2")
  - Commit SHA: Full git commit hash
  - Build Timestamp: ISO 8601 timestamp of build completion
  - Deployment Type: "production" or "preview"
  - PR Metadata (preview only): number, title, branch, base branch, PR URL

- **Workflow Configuration**: GitHub Actions workflow files that orchestrate versioning and metadata injection
  - Version extraction and increment logic
  - Environment variable passing to build step
  - Build artifact validation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Build metadata is available and correct within 5 minutes of deployment completion (tested by checking deployed build-info.json)
- **SC-002**: Semantic version auto-increments for every main branch deployment with 100% accuracy (verified by reviewing 5+ consecutive deployments)
- **SC-003**: PR preview metadata matches the PR information visible in GitHub (PR number, title, commit SHA) with 100% accuracy
- **SC-004**: DevOps engineer can identify the deployed version within 10 seconds of accessing the site (measured by time to locate and understand build metadata)
- **SC-005**: Version history can be tracked by reviewing sequential build-info.json files (ability to see version progression from 1.4.0 → 1.4.1 → 1.4.2 across deployments)
- **SC-006**: No build failures are introduced by versioning/metadata logic (build success rate remains at 100%, no new build errors)
- **SC-007**: Deployment time increases by less than 30 seconds due to versioning logic (minimal performance impact)

## Assumptions

- **Version Strategy**: Using git tags as source of truth for semantic versioning; version calculated at build-time from latest tag. Manual workflow available to update package.json when desired (not required for every build, decouples version display from deployment automation)
- **Version Tag Format**: Git tags follow semver format (v1.4.0, v1.4.1, etc.). Build reads tags with `git describe --tags --abbrev=0` to determine current version
- **Version Increment Workflow**: New workflow allows DevOps to create version bumps: receives version type (patch/minor/major), creates git tag, optionally updates package.json, and pushes changes to main
- **GitHub Pages Structure**: Existing deployment structure (root for production, /preview/ for PR previews) remains unchanged
- **Build Configuration**: Vite config will be extended to support environment variables; no major refactoring of build process needed
- **Version Persistence**: For MVP, version is read from git tags at build-time; no automatic version updates during regular CI/CD. Separate manual workflow handles intentional version bumps and package.json updates
- **PR Context Availability**: PR metadata is only available during pull_request events; workflow_dispatch will use available context or default values
- **Accessibility**: build-info.json is publicly readable from deployed site; no authentication required to view metadata

## Future Enhancements (Out of Scope)

- Manual release workflows for major/minor versions (P2 feature, separate from MVP)
- Runtime display of version info in game UI
- Dashboard/visualization of deployment history
- Automated changelogs based on commits between versions
- Integration with external monitoring/analytics services
