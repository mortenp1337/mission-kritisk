# Implementation Tasks: Automatic Semantic Versioning & Build Metadata Tracking

**Feature**: `005-semantic-versioning`  
**Branch**: `005-semantic-versioning`  
**Last Updated**: November 23, 2025  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Overview

Tasks organized by user story (P1 features first) with clear file paths and dependencies. Each phase builds independently and is testable. MVP scope is Phase 3 (User Stories 1 & 2); Phase 4+ covers P2 features.

### Scope Summary

- **MVP (P1)**: Production version tracking + PR preview metadata
- **Enhancement (P2)**: Manual release workflows + version info accessibility
- **Deliverables**: 2 workflow modifications, 1 Vite plugin, 1 manual workflow, tests updated

---

## Phase 1: Setup & Foundation

*Prerequisite tasks for all user stories*

- [ ] T001 Create Vite plugin file structure in `vite/plugins/generate-build-info.js` with basic plugin boilerplate
- [ ] T002 Add TypeScript type definition for build-info.json schema in `src/types/BuildInfo.ts` (export interface BuildInfo)
- [ ] T003 Create initial git tag v1.4.0 if not present to establish version baseline (one-time setup)
- [ ] T004 Document version tag naming convention in `.github/version-strategy.md` (format: vX.Y.Z, semver compliant)

---

## Phase 2: User Story 1 - DevOps Engineer: Track Production Deployment Versions (P1)

*Enable version tracking for main branch deployments*

### 2.1 Vite Plugin Implementation

- [ ] T005 [P] Implement version extraction logic in `vite/plugins/generate-build-info.js` using `git describe --tags --abbrev=0`
- [ ] T006 [P] Implement commit SHA extraction in plugin using `git rev-parse HEAD` and `git rev-parse --short HEAD`
- [ ] T007 [P] Implement ISO 8601 timestamp generation in plugin (build completion time)
- [ ] T008 [P] Implement build-info.json generation in plugin writing to `dist/.meta/build-info.json` directory
- [ ] T009 Ensure plugin handles missing git tags gracefully (fallback to package.json version)
- [ ] T010 Register build-info plugin in `vite/config.prod.mjs` and verify it loads on build

### 2.2 Workflow Modifications - deploy-main.yml

- [ ] T011 [P] Add version extraction step to `.github/workflows/deploy-main.yml` that outputs current version from git tags
- [ ] T012 [P] Pass VITE_APP_VERSION env variable from extracted version to build step in deploy-main.yml
- [ ] T013 Add validation step in deploy-main.yml to verify `dist/.meta/build-info.json` exists before deployment
- [ ] T014 Add validation step to parse and validate build-info.json as valid JSON in deploy-main.yml
- [ ] T015 Add check in deploy-main.yml that build-info.json contains required fields (version, commit_sha, build_timestamp)

### 2.3 Testing & Validation

- [ ] T016 Add test in `tests/build.spec.ts` to verify build-info.json is deployed to production site
- [ ] T017 Add test to validate build-info.json JSON schema for production deployments
- [ ] T018 [P] Add test to verify version in build-info.json matches git tag
- [ ] T019 [P] Add test to verify commit SHA in build-info.json matches deployed commit
- [ ] T020 Add manual test procedure documentation in `docs/version-tracking-testing.md`

---

## Phase 3: User Story 2 - Developer: Track PR Preview Deployment Commits (P1)

*Enable PR metadata injection into preview deployments*

### 3.1 PR Metadata Extraction - deploy-pr-preview.yml

- [ ] T021 [P] Add PR metadata extraction steps to `.github/workflows/deploy-pr-preview.yml` (PR number, title, branch, base branch)
- [ ] T022 [P] Extract GitHub PR URL and construct in deploy-pr-preview.yml: `https://github.com/${{ github.repository }}/pull/${{ github.event.pull_request.number }}`
- [ ] T023 [P] Pass PR metadata as environment variables to build step: VITE_PR_NUMBER, VITE_PR_TITLE, VITE_PR_HEAD_BRANCH, VITE_PR_BASE_BRANCH, VITE_PR_URL
- [ ] T024 Pass VITE_COMMIT_SHA env variable to build step in deploy-pr-preview.yml
- [ ] T025 Add conditional logic in deploy-pr-preview.yml to handle workflow_dispatch events (fallback to non-PR metadata)

### 3.2 Plugin Enhancement for PR Metadata

- [ ] T026 [P] Update plugin in `vite/plugins/generate-build-info.js` to read VITE_PR_* environment variables
- [ ] T027 [P] Implement conditional PR metadata inclusion in build-info.json (include pr_metadata object only if VITE_PR_NUMBER present)
- [ ] T028 [P] Set deployment_type to "preview" when PR metadata is present in plugin
- [ ] T029 Ensure plugin generates correct build-info.json for both production and preview contexts

### 3.3 Preview Workflow Validation

- [ ] T030 Add validation step in deploy-pr-preview.yml to verify both `dist/.meta/build-info.json` (for main) and `dist/preview/.meta/build-info.json` (for PR preview)
- [ ] T031 Add check in deploy-pr-preview.yml that preview build-info.json includes all required PR fields

### 3.4 Testing & Validation

- [ ] T032 Add test in `tests/build.spec.ts` to verify build-info.json is deployed to preview site at `/preview/.meta/build-info.json`
- [ ] T033 [P] Add test to validate build-info.json JSON schema for preview deployments includes PR metadata
- [ ] T034 [P] Add test to verify PR number in preview build-info.json matches GitHub context
- [ ] T035 [P] Add test to verify PR title is correctly captured in build-info.json
- [ ] T036 [P] Add test to verify commit SHA in preview matches PR head commit
- [ ] T037 Add manual test procedure for PR preview metadata in `docs/pr-preview-testing.md`

### 3.5 Documentation

- [ ] T038 Create `docs/accessing-build-metadata.md` explaining how to access build-info.json from deployed site
- [ ] T039 Document curl examples to inspect build-info.json: `curl https://mortenp1337.github.io/mission-kritisk/.meta/build-info.json`

---

## Phase 4: User Story 3 - DevOps Engineer: Manual Release Workflow (P2)

*Enable manual version bumping via workflow*

### 4.1 Version Bump Workflow Creation

- [ ] T040 Create `.github/workflows/bump-version.yml` with workflow_dispatch trigger
- [ ] T041 [P] Add inputs to bump-version.yml for version bump type: major | minor | patch
- [ ] T042 [P] Implement version extraction from git tags in bump-version.yml
- [ ] T043 [P] Implement version increment logic in bump-version.yml based on selected bump type
- [ ] T044 [P] Create new git tag with bumped version in bump-version.yml
- [ ] T045 [P] Push created tag to repository in bump-version.yml
- [ ] T046 Add optional step in bump-version.yml to update `package.json` version field and commit to main
- [ ] T047 Add output to bump-version.yml showing old version → new version transition

### 4.2 Testing & Documentation

- [ ] T048 Create manual test procedure for bump-version.yml in `docs/version-bumping.md`
- [ ] T049 Document major, minor, and patch version bump examples with expected outcomes

---

## Phase 5: User Story 4 - Reviewer/QA: Access Version Info from Deployed Site (P2)

*Ensure build-info.json accessibility and consistency*

### 5.1 File Structure & Accessibility

- [ ] T050 [P] Create `.meta/` directory structure in `public/` (optional placeholder if needed during build)
- [ ] T051 Verify `.meta/build-info.json` is deployed and accessible at `/.meta/build-info.json` and `/preview/.meta/build-info.json`
- [ ] T052 Ensure `.meta/build-info.json` is not minified and remains human-readable JSON

### 5.2 Testing & Documentation

- [ ] T053 Add test to verify `.meta/build-info.json` returns correct Content-Type header
- [ ] T054 Document JSON schema publicly in `public/.meta/schema.json` for reference
- [ ] T055 Create user guide in `docs/understanding-build-metadata.md` explaining all fields in build-info.json

---

## Phase 6: Integration, Testing & Polish

*End-to-end validation and documentation*

### 6.1 Cross-Story Integration

- [ ] T056 [P] Run full Playwright test suite (`npm run test:prod`) to validate all changes in production environment
- [ ] T057 [P] Verify no regressions in existing tests (game.spec.ts must still pass)
- [ ] T058 Manually trigger deploy-main.yml and verify build-info.json deployed correctly
- [ ] T059 [P] Create PR with test changes to verify deploy-pr-preview.yml generates correct PR metadata

### 6.2 Documentation & Knowledge Transfer

- [ ] T060 Update main `README.md` to mention version tracking availability
- [ ] T061 Create troubleshooting guide in `docs/versioning-troubleshooting.md` for common issues
- [ ] T062 Document workflow setup prerequisites (git tags, Node.js version, etc.)

### 6.3 Edge Case Handling

- [ ] T063 Test workflow_dispatch trigger on deploy-pr-preview.yml (verify non-PR metadata handling)
- [ ] T064 Test initial build when no git tags exist (verify fallback to package.json)
- [ ] T065 Test version consistency across multiple sequential deployments

### 6.4 Code Quality

- [ ] T066 Ensure TypeScript strict mode compliance for all new code
- [ ] T067 Add JSDoc comments to Vite plugin explaining each function
- [ ] T068 Validate all workflow YAML syntax using GitHub Actions linter

---

## Task Dependencies & Parallelization

### Dependency Graph

```
Setup Phase (T001-T004)
    ↓
Phase 2: Vite Plugin (T005-T010) [can run parallel with T011-T015]
    ↓
Phase 2: Workflows (T011-T015) [parallelizable: T005-T010]
    ↓
Phase 2: Tests (T016-T020)
    ↓
Phase 3: PR Metadata (T021-T039) [mostly parallelizable: T026-T029]
    ↓
Phase 4: Version Bump Workflow (T040-T049)
    ↓
Phase 5: Accessibility (T050-T055)
    ↓
Phase 6: Integration (T056-T068)
```

### Parallel Execution Examples

**Parallel Set 1 (after Setup)**:
- T005-T010 (Vite plugin implementation)
- T011-T015 (deploy-main.yml modifications)
- Can proceed simultaneously, no dependencies between them

**Parallel Set 2 (after Phase 2 plugin)**:
- T016-T020 (Production tests)
- T021-T025 (PR metadata extraction)
- Can start tests while PR metadata work proceeds

**Parallel Set 3 (PR workflow complete)**:
- T026-T029 (Plugin PR enhancement)
- T030-T031 (PR validation steps)
- Independent implementations

---

## MVP Scope (Recommended First Deliverable)

**Phases**: 1, 2, 3 (User Stories 1 & 2)  
**Tasks**: T001-T039  
**Value Delivered**: 
- Production deployments show version in build-info.json ✅
- PR preview deployments show commit SHA and PR metadata ✅
- DevOps can track which version is deployed ✅
- Developers can verify which PR corresponds to preview ✅

**Estimated Effort**: 40-50 tasks (parallelizable to ~2-3 parallel work streams)

---

## Testing Strategy by Phase

### Phase 2 & 3: Unit/Integration Tests
- Vite plugin generates valid JSON
- Environment variables correctly passed
- Git commands handle edge cases

### Phase 2 & 3: E2E Tests (Playwright)
- build-info.json present in deployed artifacts
- JSON schema validation passes
- Version/commit/PR data accuracy

### Phase 6: Full Integration Testing
- All workflows pass CI/CD pipeline
- No regressions in existing functionality
- Manual workflows execute correctly

---

## Success Criteria Checklist

- [ ] **SC-001**: Build metadata available within 5 minutes of deployment (verified via manual test)
- [ ] **SC-002**: Version auto-increments with 100% accuracy across 5+ test deployments
- [ ] **SC-003**: PR metadata matches GitHub info with 100% accuracy
- [ ] **SC-004**: DevOps identifies version in <10 seconds (accessibility test)
- [ ] **SC-005**: Version history trackable via sequential build-info.json files
- [ ] **SC-006**: Zero new build failures introduced (CI/CD passes)
- [ ] **SC-007**: <30 second overhead added to build time (performance measurement)

---

## Implementation Notes

### Task ID Naming
- Format: T### (T001, T002, etc.) in execution order
- [P] marker indicates parallelizable tasks (different files, no blocker dependencies)
- [Story] labels map to user story phases (not used for setup/foundation)

### File Paths
All paths are relative to repository root or absolute where needed.

### Estimated Task Times
- Setup (T001-T004): ~30 min
- Phase 2 (T005-T020): ~3 hours (parallel: ~1.5 hours)
- Phase 3 (T021-T039): ~2.5 hours (parallel: ~1.5 hours)
- Phase 4 (T040-T049): ~1.5 hours
- Phase 5 (T050-T055): ~45 min
- Phase 6 (T056-T068): ~1.5 hours
- **Total: ~9 hours sequential** (~5-6 hours with parallelization)

### Quality Gates
- ✅ All TypeScript compiles without errors
- ✅ All Playwright tests pass
- ✅ All workflow YAML is valid
- ✅ No regressions in existing game functionality
- ✅ build-info.json present in all deployments
