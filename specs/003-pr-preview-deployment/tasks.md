---

description: "Implementation tasks for PR Preview Deployment System"
---

# Tasks: PR Preview Deployment System

**Input**: Design documents from `/specs/003-pr-preview-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - no test tasks included

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing infrastructure is ready for preview deployments

- [x] T001 Verify GitHub Pages is enabled and configured at repository settings
- [x] T002 Verify repository permissions include `pages: write` and `id-token: write`
- [x] T003 Create feature branch `003-pr-preview-deployment` from main (if not exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Review existing `.github/workflows/deploy-main.yml` workflow structure
- [x] T005 Document existing build process and artifact structure from main branch
- [x] T006 Verify Vite configuration `base: './'` supports subdirectory deployments
- [x] T007 Test that existing build output (`dist/`) has correct relative paths for assets

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - PR Author Previews Changes (Priority: P1) 🎯 MVP

**Goal**: Enable PR authors to see their changes in a live preview environment immediately after opening a PR

**Independent Test**: Create a test PR with game changes, wait for workflow completion, access preview URL at `https://{owner}.github.io/{repo}/preview/`, verify changes are visible and game functions correctly

### Implementation for User Story 1

- [x] T008 [US1] Create `.github/workflows/deploy-pr-preview.yml` workflow file with basic structure and triggers
- [x] T009 [US1] Add workflow triggers in `.github/workflows/deploy-pr-preview.yml`: pull_request events (opened, synchronize, reopened) targeting main branch
- [x] T010 [US1] Add concurrency control in `.github/workflows/deploy-pr-preview.yml`: group "pages-preview", cancel-in-progress true
- [x] T011 [US1] Add permissions in `.github/workflows/deploy-pr-preview.yml`: contents read, pages write, id-token write
- [x] T012 [P] [US1] Create `build-main` job in `.github/workflows/deploy-pr-preview.yml` with checkout main branch (forced), setup Node.js 18, npm ci, npm run build-nolog, upload dist-main artifact
- [x] T013 [P] [US1] Create `build-pr` job in `.github/workflows/deploy-pr-preview.yml` with conditional execution (if ref_name != 'main'), checkout triggering branch, setup Node.js 18, npm ci, npm run build-nolog, upload dist-pr artifact
- [x] T014 [US1] Create `deploy` job in `.github/workflows/deploy-pr-preview.yml` with needs: [build-main, build-pr], environment: github-pages
- [x] T015 [US1] Add artifact download steps in deploy job: download dist-main artifact to main-build/, conditionally download dist-pr artifact to pr-build/ (if exists)
- [x] T016 [US1] Add artifact combination shell script in deploy job: copy main-build/* to combined/, conditionally copy pr-build/* to combined/preview/ (if branch != main)
- [x] T017 [US1] Add GitHub Pages upload steps in deploy job: configure-pages, upload-pages-artifact from combined/, deploy-pages
- [x] T018 [US1] Add deployment summary output in deploy job: log page_url and computed preview_url (page_url + '/preview/')
- [ ] T019 [US1] Test workflow by creating a test PR with minor game change (e.g., modify menu text)
- [ ] T020 [US1] Verify preview URL is accessible and displays PR changes correctly with functional game assets

**Checkpoint**: At this point, User Story 1 should be fully functional - PR authors can access preview deployments

---

## Phase 4: User Story 2 - Production Deployment Remains Clean (Priority: P1)

**Goal**: Ensure main branch deployments contain only production content without any preview artifacts

**Independent Test**: Trigger main branch deployment, download deployed artifact, verify no `preview/` folder exists in root, verify all production files are present and correct

### Implementation for User Story 2

- [x] T021 [US2] Add validation step in `.github/workflows/deploy-main.yml` after build: check for preview directory, fail if found
- [x] T022 [US2] Add validation step in `.github/workflows/deploy-main.yml` after build: verify index.html exists in dist/
- [x] T023 [US2] Add validation step in `.github/workflows/deploy-main.yml` after build: verify assets directory exists in dist/
- [x] T024 [US2] Add deployment type notice in `.github/workflows/deploy-main.yml` before deployment: log "Deploying production build (main branch only)"
- [x] T025 [US2] Update concurrency group in `.github/workflows/deploy-main.yml`: ensure it differs from preview ("pages" vs "pages-preview"), cancel-in-progress false
- [ ] T026 [US2] Test main branch deployment by merging a small change to main (or using workflow_dispatch)
- [ ] T027 [US2] Verify production deployment contains no preview folder and all files are present

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - PRs have previews, main deployments are clean

---

## Phase 5: User Story 3 - Reviewers Test PR Changes (Priority: P2)

**Goal**: Enable reviewers to test PR changes without local setup by accessing preview URL

**Independent Test**: Assign a reviewer to a test PR, share preview URL, have reviewer access and validate changes without cloning repository

### Implementation for User Story 3

- [x] T028 [US3] Update `.github/copilot-instructions.md` with preview system documentation: explain PR preview URLs, when they're available, how to access
- [x] T029 [US3] Add troubleshooting section to `.github/copilot-instructions.md`: common issues (404s, broken assets, deployment failures)
- [x] T030 [US3] Update `README.md` deployment section: document PR preview system, explain URL pattern, note single preview limitation
- [x] T031 [US3] Add reviewer workflow to `README.md`: how to find preview URL, what to test, how to provide feedback
- [ ] T032 [US3] Test reviewer experience: create test PR, share preview URL with team member, gather feedback on accessibility
- [ ] T033 [US3] Verify preview URL is accessible within 1 minute of workflow completion (per SC-008)

**Checkpoint**: Reviewers can now easily test PR changes without local setup

---

## Phase 6: User Story 4 - Combined Deployment Structure (Priority: P2)

**Goal**: Ensure deployment artifact correctly combines main branch content at root with PR content in preview subdirectory

**Independent Test**: Create PR deployment, inspect uploaded artifact structure, verify main content at root/ and PR content at root/preview/, test both URLs serve correct content

### Implementation for User Story 4

- [x] T034 [US4] Add artifact structure logging in `.github/workflows/deploy-pr-preview.yml` deploy job: log directory tree of combined/ before upload
- [x] T035 [US4] Add size validation in `.github/workflows/deploy-pr-preview.yml` deploy job: check combined artifact size, warn if approaching 1GB limit
- [x] T036 [US4] Add deployment verification step in `.github/workflows/deploy-pr-preview.yml`: after deployment, log both root URL and preview URL
- [ ] T037 [US4] Test combined deployment: create PR, wait for deployment, verify root URL serves main content
- [ ] T038 [US4] Test combined deployment: verify preview URL serves PR content with correct asset paths
- [ ] T039 [US4] Test that Vite's `base: './'` configuration works correctly in both root and preview contexts

**Checkpoint**: Combined deployment structure is validated and both URLs serve correct content

---

## Phase 7: User Story 5 - Manual Preview Deployment (Priority: P3)

**Goal**: Enable manual preview deployments via workflow_dispatch with automatic branch detection

**Independent Test**: Manually trigger workflow on feature branch via Actions UI, verify preview deployment created; trigger on main branch, verify production-only deployment

### Implementation for User Story 5

- [x] T040 [US5] Add `workflow_dispatch:` trigger to `.github/workflows/deploy-pr-preview.yml` (no inputs required)
- [x] T041 [US5] Verify branch detection logic works for workflow_dispatch: if github.ref_name == 'main', skip build-pr job
- [x] T042 [US5] Add usage documentation to `.github/copilot-instructions.md`: explain manual deployment process, branch selection, expected behavior
- [ ] T043 [US5] Test manual deployment on feature branch: trigger workflow_dispatch, select feature branch, verify preview created
- [ ] T044 [US5] Test manual deployment on main branch: trigger workflow_dispatch, select main, verify production-only deployment (no preview)

**Checkpoint**: All user stories complete - manual deployments work with automatic branch detection

---

## Phase 8: Error Handling & Edge Cases

**Purpose**: Implement robust error handling for main build failures and other edge cases

- [x] T045 Add error handling in `.github/workflows/deploy-pr-preview.yml` build-main job: continue-on-error for main build, cache last successful artifact
- [ ] T046 Add fallback logic in deploy job: if build-main failed, attempt to download cached main artifact from previous successful run
- [ ] T047 Add warning notice in deploy job: if using cached main build, log warning with SHA and cache timestamp
- [ ] T048 Add main build cache strategy: cache dist-main artifact on successful builds with key based on main branch SHA
- [ ] T049 Test error handling: create test scenario where main branch build fails, verify PR preview still deploys with cached main
- [ ] T050 Add deployment failure notifications: ensure workflow failures are visible in PR checks and Actions UI

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Finalization and validation of complete system

- [ ] T051 [P] Review all workflow YAML files for consistency: naming conventions, step descriptions, error messages
- [ ] T052 [P] Verify all official GitHub Actions use latest stable versions: checkout@v4, setup-node@v4, deploy-pages@v4, etc.
- [ ] T053 [P] Validate no third-party actions used: scan both workflows, confirm only actions/* organization
- [ ] T054 [P] Test all success criteria from spec.md: SC-001 through SC-008 validation
- [ ] T055 Verify deployment time meets performance goal: PR preview < 5 minutes (SC-001), main deployment no regression (SC-006)
- [ ] T056 Run through quickstart.md scenarios: validate all documented workflows function as described
- [ ] T057 Create test PR for final validation: test all triggers (open, synchronize, reopen), verify URLs, test game functionality
- [ ] T058 Verify zero preview folders in main deployments: run main deployment after PR preview, confirm clean production
- [ ] T059 Validate predictable preview URL: confirm `/preview/` path is consistent across all deployments (SC-004)
- [ ] T060 Final documentation review: ensure README.md and copilot-instructions.md are accurate and complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Must complete first - establishes core preview workflow
  - User Story 2 (Phase 4): Can start after US1, modifies different file (deploy-main.yml)
  - User Story 3 (Phase 5): Depends on US1 completion - documents working system
  - User Story 4 (Phase 6): Can run after US1 - adds validation to existing workflow
  - User Story 5 (Phase 7): Depends on US1 completion - adds trigger to existing workflow
- **Error Handling (Phase 8)**: Depends on US1 completion - enhances core workflow
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - core functionality, must complete first
- **User Story 2 (P1)**: Independent of US1 (different file) but tests require US1 workflow for context
- **User Story 3 (P2)**: Hard dependency on US1 - documents working preview system
- **User Story 4 (P2)**: Depends on US1 - adds validation to existing workflow
- **User Story 5 (P3)**: Depends on US1 - adds manual trigger to existing workflow

### Within Each User Story

**User Story 1 (Core Preview Workflow)**:
- T008-T011: Workflow structure (sequential - each builds on previous)
- T012-T013: Build jobs (parallel - independent jobs)
- T014-T018: Deploy job (sequential - depends on both build jobs)
- T019-T020: Testing (sequential - validation)

**User Story 2 (Production Validation)**:
- T021-T025: Workflow modifications (sequential - logical order)
- T026-T027: Testing (sequential - validation)

**User Story 3 (Documentation)**:
- T028-T031: Documentation updates (parallel - different files)
- T032-T033: Testing (sequential - validation)

**User Story 4 (Validation)**:
- T034-T036: Workflow enhancements (sequential - logical order)
- T037-T039: Testing (parallel - different test aspects)

**User Story 5 (Manual Trigger)**:
- T040-T042: Workflow and documentation (parallel - different concerns)
- T043-T044: Testing (parallel - different branches)

### Parallel Opportunities

**Within Foundational Phase (Phase 2)**:
- T004-T007 can all be investigated in parallel (reading different files/configs)

**Within User Story 1**:
- T012 (build-main job) and T013 (build-pr job) are parallel - different jobs in same workflow

**Within User Story 3**:
- T028-T029 (copilot-instructions.md) parallel with T030-T031 (README.md) - different files

**Within User Story 4**:
- T037-T039 can be tested in parallel - different URL/behavior validations

**Within User Story 5**:
- T040-T041 (workflow) parallel with T042 (documentation) - different files
- T043-T044 can be tested in parallel - different branches

**Within Polish Phase (Phase 9)**:
- T051, T052, T053, T054 are all parallel - independent validation tasks

**Cross-Story Parallelism**:
- After US1 completes, US2 and US3 can proceed in parallel (different files)
- US4 and US5 can proceed in parallel after US1 (enhance same workflow in different ways)

---

## Parallel Example: User Story 1 Core Implementation

```bash
# After foundational phase, implement US1 build jobs in parallel
git checkout 003-pr-preview-deployment

# Developer A: Implement build-main job
# Edit: .github/workflows/deploy-pr-preview.yml (lines for build-main job)

# Developer B: Implement build-pr job (parallel - same file, different section)
# Edit: .github/workflows/deploy-pr-preview.yml (lines for build-pr job)

# Merge both sections, then proceed with deploy job (T014-T018) sequentially
```

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Target**: User Story 1 only (Phase 3)
**Deliverable**: Basic PR preview functionality
**Tasks**: T001-T020 (Setup + Foundational + US1)
**Value**: PR authors can test changes in live environment
**Time Estimate**: 2-3 hours

### Incremental Delivery

**Iteration 1 (MVP)**: US1 - Core preview workflow
- Delivers: PR authors can see their changes live
- Tests: Create PR, access preview URL, verify game works

**Iteration 2**: US2 + US3 - Production integrity + Documentation
- Delivers: Clean main deployments, documented system for reviewers
- Tests: Main deployment validation, reviewer workflow walkthrough

**Iteration 3**: US4 + US5 - Validation + Manual trigger
- Delivers: Enhanced validation, manual deployment capability
- Tests: Structure validation, workflow_dispatch testing

**Iteration 4**: Phase 8 + 9 - Error handling + Polish
- Delivers: Production-ready system with robust error handling
- Tests: All success criteria validated

### Suggested Execution Order

1. **Days 1-2**: MVP (T001-T020)
   - Get basic PR preview working end-to-end
   - Validate with test PR

2. **Day 3**: Production & Documentation (T021-T033)
   - Clean up main deployments
   - Document for team usage

3. **Day 4**: Enhancement (T034-T044)
   - Add validation and manual triggers
   - Test edge cases

4. **Day 5**: Finalization (T045-T060)
   - Implement error handling
   - Complete validation and polish
   - Final acceptance testing

---

## Success Criteria Validation

**SC-001**: PR preview accessible within 5 minutes → Validate with T019-T020, T055
**SC-002**: 100% official GitHub Actions → Validate with T053
**SC-003**: Zero preview folders in main → Validate with T027, T058
**SC-004**: Predictable preview URL at `/preview/` → Validate with T059
**SC-005**: Functional game content with working assets → Validate with T020, T038
**SC-006**: No performance regression on main → Validate with T055
**SC-007**: No manual intervention required → Validate with T019, T026
**SC-008**: Reviewers access preview in <1 minute → Validate with T033

---

## Notes

- **Tests not included**: Specification does not explicitly request test creation; existing Playwright tests validate deployments
- **File paths are absolute**: All workflow files in `.github/workflows/`, documentation in root and `.github/`
- **Bilingual compliance**: All code and workflows in English (standard for YAML/CI), no user-facing text in workflows
- **Constitution alignment**: Implements documented CI/CD preview system from Constitution Section IV
- **Official actions only**: All tasks use `actions/*` organization actions per requirement FR-007
- **Single preview limitation**: Only one preview active at a time due to GitHub Pages replacement behavior (documented in research.md)
