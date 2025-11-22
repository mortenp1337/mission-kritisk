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

**Rationale**: Automated testing ensures game stability, prevents regressions, and validates functionality across different environments and browsers. This is critical for a web-based game deployed to multiple platforms.

### IV. CI/CD Pipeline

**Description**: All code changes MUST pass through automated CI/CD workflows before deployment.

**Rules**:
- **CI Workflow**: Runs on all pushes/PRs, tests on Node.js 18 & 20, validates build integrity
- **Main Deployment**: Automatic deployment to GitHub Pages root on `main` branch push after full test suite passes
- **PR Previews**: Isolated preview environments at `/preview/pr-{number}/` for all PRs with automatic updates
- **Preview Cleanup**: Automatic removal of preview directories on PR closure
- No manual deployments allowed—all deployments MUST go through GitHub Actions
- All workflows MUST pass full Playwright test suite before deployment
- GitHub Pages MUST be configured with `gh-pages` branch and root folder

**Rationale**: Automated pipelines ensure code quality, enable safe parallel development through PR previews, and maintain deployment consistency. Preview environments enable stakeholder review before merging.

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

**Pre-Merge Requirements**:
1. All Playwright tests pass on PR preview build
2. Build succeeds for both development and production configurations
3. No TypeScript compilation errors
4. Code follows bilingual implementation rules (English code, Danish UI text)
5. Scene architecture patterns followed correctly

**Deployment Gates**:
1. Full test suite passes on target environment (main or preview)
2. Build artifacts generated successfully
3. GitHub Actions workflow completes without errors

**Review Process**:
- PRs MUST have passing CI checks before review
- Preview deployment MUST be functional for manual QA
- Bilingual compliance MUST be verified (English code, Danish user text)
- Scene lifecycle patterns MUST be verified for new scenes

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

**Version**: 1.0.0 | **Ratified**: 2025-11-22 | **Last Amended**: 2025-11-22
