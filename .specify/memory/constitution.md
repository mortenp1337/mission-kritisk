<!--
SYNC IMPACT REPORT

Version: 0.0.0 → 1.0.0 (Initial Constitution)
Change Type: MAJOR - Initial ratification establishing project governance framework

Constitution Sections Created:
- Core Principles: I. Scene-Based Architecture, II. Bilingual Implementation, III. Test-Driven Development, IV. CI/CD Pipeline, V. Type Safety & Build Optimization
- Technology Stack (defines mandatory tech choices)
- Quality Gates (defines automated quality enforcement)

Template Consistency Status:
- ✅ plan-template.md: Compatible - constitution check gates align with testing requirements
- ✅ spec-template.md: Compatible - user story format supports scene-based development
- ✅ tasks-template.md: Compatible - phase structure supports TDD and CI/CD workflow
- ✅ copilot-instructions.md: Aligned - references same bilingual policy and architecture patterns

Follow-up TODOs: None - all core principles defined

Deployment Note: First constitution ratification for Mission Kritisk game project
-->

# Mission Kritisk Constitution

## Core Principles

### I. Scene-Based Architecture

**Description**: All game states MUST be implemented as independent Phaser 3 scene classes following the standard lifecycle pattern.

**Rules**:
- Each scene (Boot, Preloader, MainMenu, Game, GameOver) is a self-contained class
- Scene transitions MUST use `this.scene.start('SceneName')` exclusively
- Scenes MUST implement appropriate lifecycle methods: `constructor()`, `preload()` (for Boot/Preloader), `create()`
- Asset loading strategy: Boot loads essential assets, Preloader handles bulk loading with progress feedback
- Scene flow follows defined progression: Boot → Preloader → MainMenu → Game → GameOver

**Rationale**: Scene-based architecture ensures clear separation of concerns, predictable state transitions, and maintainable game flow. This pattern is fundamental to Phaser 3 and enables independent testing of each game state.

### II. Bilingual Implementation (NON-NEGOTIABLE)

**Description**: Code MUST be written in English while all user-facing content MUST be in Danish.

**Rules**:
- Code elements in English: variable names, function names, class names, comments, technical documentation
- User-facing content in Danish: in-game text, UI labels, menu items, button text, game narrative
- Property declarations MUST use English names with explicit types (e.g., `gameover_text: GameObjects.Text`)
- Display text values MUST be Danish strings (e.g., `'Spillet Slut'`, `'Mission Kritisk'`)
- README.md and user documentation MUST be in Danish
- Technical implementation files (TypeScript/config) remain in English

**Rationale**: This bilingual approach maintains international code readability and collaboration standards while delivering an authentic Danish gaming experience to end users. It follows industry best practices for internationalized software development.

### III. Test-Driven Development (NON-NEGOTIABLE)

**Description**: All features MUST have comprehensive end-to-end tests written and validated before implementation.

**Rules**:
- Playwright tests MUST cover: game initialization, scene transitions, asset loading, responsive behavior
- Tests MUST run across multiple browsers (Chrome, Firefox, Safari)
- Tests MUST pass on both development and production builds
- Test commands: `npm run test` (dev), `npm run test:headed` (visible), `npm run test:ui` (interactive), `npm run test:prod` (production)
- New features CANNOT be merged without passing test coverage
- Test files organized in `tests/` directory with descriptive naming (e.g., `game.spec.ts`, `build.spec.ts`)

**Current Implementation Status**:
- ✅ Playwright infrastructure installed and configured
- ✅ Test commands available and functional
- ✅ Test files organized in `tests/` directory
- ⚠️ CI integration: Tests currently manual; planned for automated pre-merge gate
- ⚠️ Browser matrix: Currently manual testing; planned for CI matrix execution

**Rationale**: Automated testing ensures game stability, prevents regressions, and validates functionality across different environments and browsers. This is critical for a web-based game deployed to multiple platforms.

**CI Integration Roadmap**:
1. Add Playwright test execution to CI workflow
2. Configure browser matrix (Chromium, Firefox, WebKit)
3. Generate test reports and artifacts for failed tests
4. Block merge on test failures

### IV. CI/CD Pipeline

**Description**: All code changes MUST pass through automated CI/CD workflows before deployment.

**Rules**:
- **CI Workflow** (`.github/workflows/ci.yml`): Runs on all pushes/PRs to main and develop branches, validates build integrity with Node.js 18
- **Main Deployment** (`.github/workflows/deploy-main.yml`): Automatic deployment to GitHub Pages root on `main` branch push; validates production build doesn't contain preview artifacts
- **PR Previews** (`.github/workflows/deploy-pr-preview.yml`): Builds both main branch and PR branch; deploys to `/preview/` subdirectory for PR validation; concurrent previews disabled (only latest active)
- No manual deployments allowed—all deployments MUST go through GitHub Actions
- GitHub Actions permissions: `contents: read`, `pages: write`, `id-token: write` (required for GitHub Pages deployment)
- Build validation MUST verify: `dist/index.html` exists, `dist/style.css` exists, `dist/assets` directory exists

**Current Implementation Status**:
- ✅ CI workflow validates builds with Node.js 18
- ✅ Main branch deploys to root with production-only validation
- ✅ PR previews deploy to `/preview/` with automatic overwrite (only one preview at a time)
- ⚠️ Matrix testing on multiple Node versions: Planned (currently Node.js 18 only)
- ⚠️ Playwright test enforcement: Planned (currently build-only validation)
- ⚠️ Preview cleanup on PR close: Planned (currently requires manual cleanup)

**Rationale**: Automated pipelines ensure code quality, enable safe parallel development through PR previews, and maintain deployment consistency. Preview environments enable stakeholder review before merging.

**Future Enhancements** (post-MVP):
1. Add Node.js 20 to CI matrix for broader compatibility testing
2. Integrate Playwright E2E tests into CI workflow pre-merge gate
3. Implement automatic preview cleanup on PR closure using workflow_dispatch or scheduled cleanup job
4. Add test result reporting and coverage tracking to CI workflow

### V. Type Safety & Build Optimization

**Description**: TypeScript strict mode with Phaser-compatible configurations and optimized production builds are mandatory.

**Rules**:
- TypeScript strict mode enabled with `strictPropertyInitialization: false` for Phaser compatibility
- ES2020 target with DOM libraries and bundler mode resolution
- Development builds use `vite/config.dev.mjs` with hot-reloading
- Production builds use `vite/config.prod.mjs` with Terser minification and custom Phaser plugin
- Code splitting: Phaser MUST be extracted to separate chunk for caching optimization
- Build commands: `npm run dev` / `npm run build` (with logging), `npm run dev-nolog` / `npm run build-nolog` (without analytics)
- All Phaser game objects MUST have explicit type declarations

**Rationale**: Type safety prevents runtime errors in game logic. Optimized builds ensure fast loading times critical for web games. Code splitting improves caching and reduces initial load time by separating framework from game code.

## Technology Stack

**Language**: TypeScript 5.7+  
**Framework**: Phaser 3.90+  
**Build Tool**: Vite 6+  
**Testing**: Playwright 1.56+ (E2E), matrix testing on Node.js 18 & 20  
**Deployment**: GitHub Actions + GitHub Pages  
**Target**: Web browsers (Chrome, Firefox, Safari) with WebGL/Canvas fallback  
**Resolution**: 1024x768 (fixed game resolution)  
**Asset Management**: Static assets in `public/assets/`, loaded via Phaser LoaderPlugin

**Constraints**:
- Game MUST maintain 1024x768 resolution
- Renderer MUST use AUTO mode (WebGL with Canvas fallback)
- Asset paths MUST use `this.load.setPath('assets')` convention followed by relative paths
- Background asset MUST be shared across scenes using same key

## Quality Gates

**Pre-Merge Requirements** (Current):
1. ✅ Build succeeds for both development and production configurations
2. ✅ No TypeScript compilation errors
3. ✅ Code follows bilingual implementation rules (English code, Danish UI text)
4. ✅ Scene architecture patterns followed correctly
5. ⚠️ All Playwright tests pass on PR preview build (manual validation required)

**Pre-Merge Requirements** (Planned):
1. 🔜 Automated Playwright test execution blocks merge on failure
2. 🔜 Multiple Node.js versions tested (18, 20)
3. 🔜 Browser matrix validation (Chromium, Firefox, WebKit)

**Deployment Gates** (Current):
1. ✅ Build artifacts generated successfully
2. ✅ GitHub Actions workflow completes without errors
3. ✅ Production build validated (no preview artifacts in main deployment)

**Deployment Gates** (Planned):
1. 🔜 Full test suite passes on target environment before deployment
2. 🔜 Automated preview cleanup on PR closure

**Review Process** (Current):
- ✅ PRs MUST have passing CI checks (build validation) before review
- ✅ Preview deployment MUST be functional for manual QA
- ✅ Bilingual compliance MUST be verified (English code, Danish user text)
- ✅ Scene lifecycle patterns MUST be verified for new scenes

**Review Process** (Planned):
- 🔜 Automated test reports attached to PR reviews
- 🔜 Test coverage metrics displayed in PR comments

## Implementation Status

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Scene-Based Architecture** | ✅ Implemented | All scenes follow lifecycle pattern; transitions use `scene.start()` |
| **II. Bilingual Implementation** | ✅ Implemented | English code, Danish user text enforced via code review |
| **III. Test-Driven Development** | 🟡 Partial | Playwright framework ready; CI integration planned |
| **IV. CI/CD Pipeline** | 🟡 Partial | Build validation active; test gates planned |
| **V. Type Safety & Build Optimization** | ✅ Implemented | TypeScript strict mode, Vite optimization active |

### Technology Stack Adoption

| Component | Requirement | Current | Status |
|-----------|-------------|---------|--------|
| TypeScript | 5.7+ | 5.7.2 | ✅ |
| Phaser | 3.90+ | 3.90.0 | ✅ |
| Vite | 6+ | 6.3.1 | ✅ |
| Playwright | 1.56+ | Latest | ✅ |
| Node.js CI | 18 & 20 | 18 only | 🟡 |
| Browser Matrix | Chrome, Firefox, Safari | Manual only | 🟡 |

### CI/CD Workflow Status

**Implemented** ✅:
- Build validation on all pushes and PRs
- Production deployment to GitHub Pages root (main branch)
- PR preview deployment to `/preview/` subdirectory
- Build output validation (index.html, style.css, assets/)
- Concurrent preview management (only one active)

**Planned** 🔜:
- Playwright test execution in CI pre-merge gate
- Node.js 20 matrix testing
- Browser matrix testing (Chromium, Firefox, WebKit)
- Automatic preview cleanup on PR closure
- Test result reporting and artifacts

## Governance

This constitution supersedes all other development practices and serves as the authoritative source for project standards.

**Amendment Process**:
1. Proposed changes MUST be documented in a PR with rationale
2. Version number MUST be incremented following semantic versioning:
   - **MAJOR**: Backward incompatible changes to core principles
   - **MINOR**: New principles or sections added
   - **PATCH**: Clarifications, wording fixes, non-semantic changes
3. Constitution amendments MUST include sync impact report listing affected templates
4. Templates (plan-template.md, spec-template.md, tasks-template.md, commands/*.md) MUST be updated to reflect changes

**Compliance Enforcement**:
- All PRs MUST verify compliance with core principles
- CI/CD pipeline enforces quality gates automatically
- Manual reviews verify architectural patterns and bilingual compliance
- Violations MUST be documented and justified or corrected before merge

**Runtime Guidance**:
- Developers MUST consult `.github/copilot-instructions.md` for detailed implementation patterns
- Copilot instructions provide concrete examples of scene structures, asset loading, and bilingual text formatting
- When in doubt about implementation details, reference copilot-instructions.md first, then this constitution for governance rules

**Version**: 1.1.0 | **Ratified**: 2025-11-22 | **Last Amended**: 2025-11-23

**Amendment 1.1.0** (2025-11-23):
- Corrected CI/CD Pipeline section: Updated preview path from `/preview/pr-{number}/` to actual `/preview/`
- Clarified test integration status: Marked as planned (not yet enforced in CI)
- Clarified matrix testing status: Currently Node.js 18 only (20 planned)
- Added Implementation Status section documenting current vs. planned features
- Added workflow file references (.github/workflows/*)
- Removed inaccurate references to preview cleanup automation
- Added CI/CD Workflow Status table for clarity
