# Implementation Plan: PR Preview Deployment System

**Branch**: `003-pr-preview-deployment` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-pr-preview-deployment/spec.md`

## Summary

Implement a GitHub Actions-based preview deployment system that automatically deploys PR changes to a `/preview/` subdirectory on GitHub Pages while maintaining production content at the root. The system uses branch context to determine deployment type: main branch triggers production-only deployment, non-main branches trigger combined deployment (production at root + preview in `/preview/` folder). Only the most recent deployment is active at any time due to GitHub Pages' complete site replacement model.

## Technical Context

**Language/Version**: YAML (GitHub Actions workflows), Shell scripting (Bash/Zsh)
**Primary Dependencies**: GitHub Actions (`actions/*` org only), Node.js 18, npm, Git  
**Storage**: GitHub Pages static site hosting, deployment artifacts  
**Testing**: Existing Playwright test suite (validates deployments)  
**Target Platform**: GitHub Actions runners (ubuntu-latest), GitHub Pages  
**Project Type**: CI/CD infrastructure (workflows)  
**Performance Goals**: <5 minutes PR preview deployment time, no regression on main deployment time  
**Constraints**: Official GitHub Actions only, minimal `actions/github-script`, GitHub Pages 1GB size limit, complete site replacement per deployment  
**Scale/Scope**: Single repository, unlimited PRs (but only 1 active preview), concurrent workflow execution with cancel-in-progress

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principle Compliance

**I. Scene-Based Architecture** ✅ N/A - Infrastructure change, does not affect game architecture

**II. Bilingual Implementation** ✅ COMPLIANT - Workflow files and technical comments in English (standard for YAML/CI), no user-facing text involved

**III. Test-Driven Development** ✅ COMPLIANT - Existing Playwright tests will validate preview deployments function correctly, no new game features require new tests

**IV. CI/CD Pipeline** ⚠️ **MODIFICATION REQUIRED**
- **Current state**: PR previews documented but not implemented
- **Proposed change**: Implement missing PR preview workflow, modify main deployment workflow
- **Impact**: Fulfills documented CI/CD principle for preview environments
- **Justification**: This change implements the documented preview system described in Constitution Section IV

**V. Type Safety & Build Optimization** ✅ COMPLIANT - No changes to build process, maintains existing `npm run build-nolog` command

### Quality Gates

**Pre-Merge Requirements**: ✅ All existing gates apply (tests pass, build succeeds, TypeScript clean)

**Deployment Gates**: ✅ Enhanced - workflows will enforce test suite passage before deployment

**Review Process**: ✅ Preview deployment enables manual QA as documented

### Technology Stack Compliance

✅ All existing stack preserved (TypeScript, Phaser, Vite, Playwright)
✅ Adds only GitHub Actions YAML configuration
✅ Maintains 1024x768 resolution, asset loading patterns, bilingual text approach

### Violations & Justifications

No violations. This change implements missing CI/CD infrastructure documented in the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/003-pr-preview-deployment/
├── plan.md              # This file
├── research.md          # Phase 0: GitHub Actions patterns, deployment strategies
├── data-model.md        # Phase 1: Workflow structure, artifact composition
├── quickstart.md        # Phase 1: Usage guide for developers
├── contracts/           # Phase 1: Workflow specifications
│   ├── pr-preview-workflow.md
│   └── main-deployment-modifications.md
└── checklists/
    └── requirements.md  # Validation checklist
```

### Source Code (repository root)

```text
.github/
├── workflows/
│   ├── deploy-main.yml           # MODIFIED: Add preview folder cleanup
│   ├── deploy-pr-preview.yml     # NEW: PR preview deployment workflow
│   └── ci.yml                    # UNCHANGED: Existing CI validation
└── copilot-instructions.md       # MODIFIED: Document preview system usage

README.md                          # MODIFIED: Update deployment documentation

specs/
└── 003-pr-preview-deployment/    # This feature's documentation

[No changes to game source code in src/, public/, vite/, tests/]
```

**Structure Decision**: This is a CI/CD infrastructure enhancement. All changes are in `.github/workflows/` directory with supporting documentation updates. No game code modifications required, preserving existing Scene-Based Architecture and bilingual implementation patterns.

## Complexity Tracking

No constitution violations. This section is not applicable.

---

## Implementation Phases

### Phase 0: Research & Discovery ✅ COMPLETE

**Objective**: Resolve ambiguities and validate technical approach

**Deliverables**:
- ✅ [research.md](./research.md) - GitHub Pages behavior analysis, deployment strategies, alternatives considered

**Key Decisions Made**:
- GitHub Pages replaces entire site per deployment (only 1 preview possible)
- Branch detection via `github.ref_name` (no manual inputs needed)
- Main build failures use cached artifact with warning
- Cancel-in-progress for PR deployments, queue for main deployments
- Generic `/preview/` path (no PR number/branch name)

**Duration**: Complete (part of specification phase)

---

### Phase 1: Design & Architecture ✅ COMPLETE

**Objective**: Define data structures, workflow contracts, and integration points

**Deliverables**:
- ✅ [data-model.md](./data-model.md) - Entities, state machines, data flows
- ✅ [contracts/pr-preview-workflow.md](./contracts/pr-preview-workflow.md) - PR preview workflow specification
- ✅ [contracts/main-deployment-modifications.md](./contracts/main-deployment-modifications.md) - Main workflow modifications
- ✅ [quickstart.md](./quickstart.md) - Developer and reviewer usage guide

**Key Outputs**:
- Deployment artifact structure defined
- Workflow job dependencies mapped
- Error handling strategies specified
- Validation rules documented
- Integration points identified

**Duration**: Complete (part of specification phase)

---

### Phase 2: Implementation → Use `/speckit.tasks`

**Objective**: Create workflow files and deploy to production

**Command**: Run `/speckit.tasks` to generate detailed implementation tasks

**Estimated Tasks**:
1. Create `.github/workflows/deploy-pr-preview.yml`
2. Modify `.github/workflows/deploy-main.yml`
3. Update `.github/copilot-instructions.md`
4. Update `README.md` deployment documentation
5. Test workflows on feature branch
6. Merge and validate in production

**Success Criteria**:
- SC-001: PR preview accessible within 5 minutes ✓
- SC-002: 100% official GitHub Actions usage ✓
- SC-003: Zero preview folders in main deployments ✓
- SC-004: Preview URL at predictable `/preview/` location ✓
- SC-005: Functional game content with working assets ✓
- SC-006: No performance regression on main deployment ✓
- SC-007: No manual intervention required ✓
- SC-008: Reviewers access preview in <1 minute ✓

**Estimated Duration**: 2-3 hours implementation + 1 hour testing

---

## Constitution Re-Check (Post-Design)

*Required after Phase 1 design completion*

### Core Principle Compliance

**I. Scene-Based Architecture** ✅ N/A - No game architecture changes

**II. Bilingual Implementation** ✅ COMPLIANT
- Workflow YAML in English (standard)
- Shell scripts in English (standard)
- No user-facing text in workflows
- Documentation in English (technical docs)

**III. Test-Driven Development** ✅ COMPLIANT
- Existing Playwright tests validate preview deployments
- No new game features = no new tests required
- Workflow success/failure verifiable via GitHub UI

**IV. CI/CD Pipeline** ✅ **ENHANCED**
- Implements missing PR preview system from constitution
- Fulfills documented Section IV requirements
- Adds automatic deployment for PR testing
- Maintains test-before-deploy workflow

**V. Type Safety & Build Optimization** ✅ COMPLIANT
- No changes to TypeScript configuration
- No changes to Vite build process
- Preserves code splitting and optimization
- Uses existing `npm run build-nolog` command

### Quality Gates

**Pre-Merge Requirements**: ✅ All existing gates maintained
- Playwright tests pass ✓
- Build succeeds (dev + prod) ✓
- No TypeScript errors ✓
- Bilingual compliance ✓

**Deployment Gates**: ✅ Enhanced with workflow validation
- Test suite passes before deployment ✓
- Artifact structure validated ✓
- Size limits enforced ✓

**Review Process**: ✅ Improved by preview deployments
- PRs have functional preview for manual QA ✓
- Reviewers can test without local setup ✓
- Faster feedback loop ✓

### Technology Stack

✅ All existing technologies preserved:
- TypeScript 5.7+ ✓
- Phaser 3.90+ ✓
- Vite 6+ ✓
- Playwright 1.56+ ✓
- GitHub Actions + Pages ✓

✅ Additions aligned with stack:
- Official GitHub Actions only ✓
- Shell scripting (standard for CI/CD) ✓
- YAML workflow definitions (standard) ✓

### Final Verdict

**Status**: ✅ **CONSTITUTION COMPLIANT**

No violations introduced. Design implements documented CI/CD principles and enhances existing pipeline with preview functionality. All quality gates maintained or improved.

---

## Next Steps

1. ✅ Phase 0 complete - Research documented
2. ✅ Phase 1 complete - Design and contracts finalized
3. ✅ Constitution re-check passed
4. → **Ready for `/speckit.tasks`** - Generate implementation task list
5. → Implementation and testing
6. → Merge to main and validate production deployment

---

## Appendix: File Locations

**Created Documents**:
- `specs/003-pr-preview-deployment/plan.md` (this file)
- `specs/003-pr-preview-deployment/research.md`
- `specs/003-pr-preview-deployment/data-model.md`
- `specs/003-pr-preview-deployment/quickstart.md`
- `specs/003-pr-preview-deployment/contracts/pr-preview-workflow.md`
- `specs/003-pr-preview-deployment/contracts/main-deployment-modifications.md`
- `specs/003-pr-preview-deployment/checklists/requirements.md` (from specification phase)

**Files to Create (Phase 2)**:
- `.github/workflows/deploy-pr-preview.yml` (new)
- `.github/workflows/deploy-main.yml` (modify)
- `.github/copilot-instructions.md` (update)
- `README.md` (update deployment section)

**Files Unchanged**:
- All game source code in `src/`
- All tests in `tests/`
- Build configuration in `vite/`
- Game assets in `public/assets/`
- TypeScript configuration `tsconfig.json`
