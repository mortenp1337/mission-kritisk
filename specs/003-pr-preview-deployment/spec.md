# Feature Specification: PR Preview Deployment System

**Feature Branch**: `003-pr-preview-deployment`  
**Created**: 2025-11-23  
**Status**: Draft  
**Input**: User description: "I want to work on this workflow for a bit. I only want to use actions that come from GitHub not random third parties, we can somewhat use Github script, but it should be minimal. I'm thinking that when I raise a PR, that I could do a complete deployment to pages, meaning that we would still want to package what is in the Main branch a push it to the root, but I want the content of the PR to be packaged up together with the project in a subfolder called preview in the dist folder. When deploying from Main, we should still only deploy the main branch, and not anything to preview - that can be done either with workflow dispatch or on PR"

## Clarifications

### Session 2025-11-23

- Q: What happens if the main branch build fails during a PR deployment? Should the PR deployment fail or continue with the last successful main build? → A: Continue with last successful main build and mark as warning
- Q: How does the system handle concurrent PR deployments? Can multiple PRs have active previews simultaneously? → A: Each PR deployment overwrites; only latest PR preview available
- Q: How should manual preview deployments via workflow_dispatch identify which content to deploy? → A: Workflow uses triggering branch context automatically
- Q: Should concurrent workflow runs be allowed to cancel in-progress deployments? → A: Allow cancel-in-progress for PR deployments
- Q: What path should preview deployments use (PR number, branch name, or generic)? → A: Generic preview path (no identification needed)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - PR Author Previews Changes (Priority: P1)

A developer opens a pull request with changes to the game. They want to immediately see their changes running in a live environment without affecting the production deployment. They visit the preview URL provided in the PR and can play the modified version of the game.

**Why this priority**: Core value proposition - enables rapid feedback loop for PR authors to validate changes before merge.

**Independent Test**: Can be fully tested by creating a PR, waiting for deployment completion, and accessing the preview URL. Delivers immediate value of being able to test PR changes in isolation.

**Acceptance Scenarios**:

1. **Given** a developer has opened a new PR with game changes, **When** the PR workflow completes successfully, **Then** a preview deployment is available at a predictable URL containing the PR content
2. **Given** a PR preview is deployed, **When** the developer visits the preview URL, **Then** they see their modified version of the game running correctly
3. **Given** a PR is updated with new commits, **When** the workflow runs again, **Then** the preview deployment is updated with the latest changes

---

### User Story 2 - Production Deployment Remains Clean (Priority: P1)

When changes are merged to the main branch, the production deployment contains only the main branch content at the root level. No preview folders or PR artifacts are present in the production deployment, ensuring a clean user experience.

**Why this priority**: Critical for production integrity - prevents confusion and maintains clean deployment structure for end users.

**Independent Test**: Can be fully tested by triggering a main branch deployment and verifying that the deployed site contains only production content with no preview folders. Delivers value of maintaining production quality.

**Acceptance Scenarios**:

1. **Given** the main branch is updated, **When** the main deployment workflow runs, **Then** the deployed site contains only main branch content at the root
2. **Given** PR previews existed before, **When** main branch deploys, **Then** no preview folders are present in the production deployment
3. **Given** a user visits the production URL, **When** they browse the site, **Then** they see only production content without any preview artifacts

---

### User Story 3 - Reviewers Test PR Changes (Priority: P2)

A code reviewer receives a pull request for review. Instead of checking out the branch locally, they click a link to the preview deployment and can immediately test the functionality in a browser. This enables non-technical stakeholders to provide feedback on visual and gameplay changes.

**Why this priority**: Enhances collaboration and speeds up review process by making PR testing accessible to all stakeholders.

**Independent Test**: Can be fully tested by assigning a reviewer to a PR, sharing the preview URL, and having them validate the changes without local setup. Delivers value of democratizing PR testing.

**Acceptance Scenarios**:

1. **Given** a reviewer is assigned to a PR, **When** they receive the preview URL, **Then** they can access and test the game without any local environment setup
2. **Given** multiple reviewers are testing the same PR, **When** they access the preview URL simultaneously, **Then** all reviewers see the same version of the changes
3. **Given** a non-technical stakeholder wants to review visual changes, **When** they click the preview link, **Then** they can interact with the game and provide feedback

---

### User Story 4 - Combined Deployment Structure (Priority: P2)

When a PR is opened, the deployment system combines both the main branch content (at root) and the PR content (in a preview subfolder) into a single GitHub Pages deployment. This allows the same Pages environment to serve both production and preview content simultaneously.

**Why this priority**: Enables preview functionality while maintaining production availability - critical for continuous operation during review cycles.

**Independent Test**: Can be fully tested by deploying a PR and verifying that both the root URL serves main content and the preview subfolder serves PR content. Delivers value of unified deployment infrastructure.

**Acceptance Scenarios**:

1. **Given** a PR is opened, **When** the PR deployment completes, **Then** the root URL continues to serve main branch content
2. **Given** a PR is opened, **When** the PR deployment completes, **Then** the preview subfolder contains the PR branch content
3. **Given** both deployments are active, **When** users access different URLs, **Then** they receive the correct version without conflicts

---

### User Story 5 - Manual Preview Deployment (Priority: P3)

A developer wants to create a preview deployment outside of the normal PR flow (for testing, demos, or experiments). They can manually trigger the deployment workflow using workflow dispatch. The workflow automatically detects the selected branch: if it's the main branch, it performs a production deployment; otherwise, it creates a preview deployment in the preview folder.

**Why this priority**: Provides flexibility for edge cases and special scenarios, but not essential for core PR workflow.

**Independent Test**: Can be fully tested by manually triggering the workflow on different branches and verifying correct deployment behavior (production for main, preview for others). Delivers value of ad-hoc deployment capabilities.

**Acceptance Scenarios**:

1. **Given** a developer wants to deploy a feature branch, **When** they trigger workflow_dispatch on that branch, **Then** a preview deployment is created automatically
2. **Given** a developer manually triggers the workflow on main branch, **When** the workflow completes, **Then** a production-only deployment is created
3. **Given** a manual preview is deployed, **When** the developer shares the URL, **Then** others can access the preview deployment

---

### Edge Cases

- What happens when a PR is closed or merged? Should the preview deployment be automatically removed or persist?
- How are preview URLs communicated to PR authors and reviewers? Should they be automatically posted as PR comments?
- What happens when someone force-pushes to a PR branch? Does the preview update automatically?
- How does the system handle very large PR content that might exceed GitHub Pages size limits?
- What happens if the PR branch has conflicts with the main branch during the combined build process?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST trigger a preview deployment workflow when a pull request is opened, synchronized, or reopened
- **FR-002**: System MUST build both the main branch content and the PR branch content during PR deployments
- **FR-003**: System MUST place main branch content at the root of the deployment artifact
- **FR-004**: System MUST place PR branch content in a subfolder: `preview/`
- **FR-005**: System MUST combine both main and PR builds into a single deployment artifact
- **FR-006**: System MUST deploy the combined artifact to GitHub Pages when triggered by a PR event
- **FR-007**: System MUST use only official GitHub Actions (from `actions/*` organization) for all workflow steps
- **FR-008**: System MUST minimize usage of `actions/github-script` - only use when shell scripts cannot accomplish the task
- **FR-009**: Main branch deployment workflow MUST remove any preview folders before deploying
- **FR-010**: Main branch deployment workflow MUST deploy only main branch content to the root
- **FR-011**: System MUST maintain the existing build process (`npm run build-nolog`)
- **FR-012**: System MUST preserve the current GitHub Pages configuration and permissions
- **FR-013**: Preview deployments MUST NOT interfere with production deployments on the main branch
- **FR-014**: System MUST generate preview URLs following the pattern: `https://{owner}.github.io/{repo}/preview/`
- **FR-015**: System MUST support manual preview deployments via workflow_dispatch trigger
- **FR-016**: PR preview builds MUST use the same build configuration as production builds
- **FR-017**: Preview deployment workflows MUST use cancel-in-progress concurrency strategy to allow newer deployments to cancel outdated ones; production deployments MUST NOT cancel in-progress runs
- **FR-018**: System MUST provide clear success/failure status for preview deployments
- **FR-019**: Preview folder structure MUST be compatible with the existing Vite `base: './'` configuration
- **FR-020**: System MUST checkout both main and PR branches during PR deployment workflows
- **FR-021**: When main branch build fails during PR deployment, system MUST continue deployment using last successful main build and mark deployment with warning status
- **FR-022**: Each PR deployment completely replaces the GitHub Pages site; only the most recently deployed PR preview will be available at any given time
- **FR-023**: System MUST automatically detect the triggering branch and deploy accordingly: main branch triggers production-only deployment, non-main branches trigger preview deployment to preview folder

### Key Entities

- **Preview Deployment**: A deployment artifact containing both main branch content (root) and PR branch content (preview subfolder), deployed to GitHub Pages during PR lifecycle
- **Production Deployment**: A deployment artifact containing only main branch content at root, deployed when main branch is updated
- **Preview URL**: A predictable URL at `preview/` that serves the most recently deployed preview content
- **Deployment Artifact**: The combined directory structure uploaded to GitHub Pages, containing either production-only or production+preview content

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: PR authors can access their preview deployment within 5 minutes of opening a PR
- **SC-002**: 100% of workflows use only official GitHub Actions (no third-party actions outside GitHub organization)
- **SC-003**: Main branch deployments contain zero preview folders or PR artifacts
- **SC-004**: Preview URL is always at the same predictable location (`/preview/`) regardless of which branch is deployed
- **SC-005**: PR preview deployments successfully serve functional game content at the preview URL without broken assets or paths
- **SC-006**: Production deployment workflow completes in comparable time to current baseline (no significant regression)
- **SC-007**: Preview deployments complete without requiring manual intervention or approval steps
- **SC-008**: Reviewers can access and test PR changes in under 1 minute from receiving the preview URL (no authentication or setup required)

## Scope

### In Scope

- Creating a new workflow file for PR preview deployments
- Modifying existing main branch deployment workflow to exclude preview folders
- Building both main and PR branches during PR events
- Combining build outputs into a unified deployment structure
- Supporting workflow_dispatch for manual preview deployments
- Generating preview URLs following the specified pattern
- Maintaining compatibility with existing Vite build configuration

### Out of Scope

- Automatic cleanup of closed PR previews (addressed in future work)
- Posting preview URLs as PR comments (can be added later)
- Authentication or access control for preview URLs (inherits GitHub Pages public access model)
- Custom preview domains or URL patterns beyond the standard structure
- Preview deployment analytics or usage tracking
- Modifying the game's build process or Vite configuration
- Supporting preview deployments for branches without PRs (beyond manual workflow_dispatch)

## Assumptions

- GitHub Pages is already configured and operational for the repository
- The existing Vite `base: './'` configuration will work correctly for subdirectory deployments
- Preview deployments will inherit GitHub Pages' public access model (no additional authentication)
- PR numbers are sufficient for uniquely identifying preview deployments
- Preview content does not need to persist after PR is closed (persistence to be addressed separately)
- GitHub Actions concurrency limits will not be exceeded by simultaneous PR deployments
- Preview URLs can be manually constructed by users (automatic commenting may be added later)
- The repository uses GitHub-hosted runners (ubuntu-latest)
- Node.js version 18 is appropriate for all builds
- The `npm ci` command is appropriate for dependency installation in CI environments

## Dependencies

- GitHub Actions workflows must have Pages write permissions
- GitHub Pages must be enabled for the repository
- Repository must use GitHub Actions for deployments
- Node.js 18 and npm must be available in the CI environment
- Existing build scripts (`npm run build-nolog`) must remain functional
- Git must be available for checking out multiple branches

## Constraints

- Must use only official GitHub Actions from the `actions/*` organization
- Must minimize `actions/github-script` usage to essential cases only
- Must maintain backwards compatibility with existing main branch deployment workflow
- Must not modify the game's source code or build configuration
- Must work within GitHub Pages' deployment artifact size limits
- Must respect GitHub Actions concurrency model for Pages deployments
- Cannot use third-party deployment services or CDNs
- Must preserve existing GitHub Pages URL structure for production content
