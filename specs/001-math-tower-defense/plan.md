# Implementation Plan: Math Tower Defense Game

**Branch**: `001-math-tower-defense` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-math-tower-defense/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Build an educational math game for children in grades 0-3 that combines learning with tower defense gameplay. Children solve grade-appropriate math problems to earn coins, then use those coins to purchase and place towers on a 2D grid to defend against zombie waves. The game alternates between math challenge phases (5 problems) and defense waves, with difficulty and rewards scaling across 5 waves. Technical approach uses Phaser 3's scene-based architecture with clean class-based code for extensibility (towers, enemies, levels), TypeScript for type safety, and 2D grid system for tower placement and pathfinding.

## Technical Context

**Language/Version**: TypeScript 5.7+  
**Primary Dependencies**: Phaser 3.90+ (game framework), Vite 6+ (build tool)  
**Storage**: N/A (no persistence - stateless sessions per spec assumptions)  
**Testing**: Playwright 1.56+ (E2E testing across Chrome, Firefox, Safari)  
**Target Platform**: Web browsers with 1024x768 resolution, WebGL/Canvas rendering  
**Project Type**: Single project (game application)  
**Performance Goals**: 60 FPS consistent frame rate, <2 second scene transitions, responsive grid interactions  
**Constraints**: 1024x768 fixed resolution, browser-based deployment, Danish UI text requirements, no audio/persistence in MVP  
**Scale/Scope**: 5 new scenes, ~15-20 game entity classes, 4 grade levels × 5 waves × ~10 problems = ~200 total math problems, single-player only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Evaluation

**I. Scene-Based Architecture** ✅ PASS
- Spec FR-020 explicitly requires 5 new scenes: GradeSelection, MathChallenge, TowerPlacement, DefenseWave, GameOver (extends existing)
- Scene transitions follow Phaser 3 patterns using `this.scene.start()`
- Each scene is self-contained with clear responsibilities

**II. Bilingual Implementation** ✅ PASS
- Spec FR-019 mandates Danish for all user-facing text
- Multiple Danish UI examples documented: "Klasse 0-3", "Løs opgaven:", "Rigtigt!", "Mønter:", etc.
- Code elements (classes, variables, functions) will be in English per constitution

**III. Test-Driven Development** ✅ PASS
- Spec includes 29 acceptance scenarios providing test foundation
- Playwright tests will cover scene transitions, math problem generation, tower placement, combat mechanics
- Success criteria SC-001 through SC-010 provide measurable test targets

**IV. CI/CD Pipeline** ✅ PASS
- Existing GitHub Actions workflows will test and deploy
- PR previews enable stakeholder review of educational content
- Matrix testing on Node.js 18 & 20 already configured

**V. Type Safety & Build Optimization** ✅ PASS
- TypeScript strict mode with Phaser-compatible config
- All game entities will have explicit type declarations
- Vite build optimization with code splitting for Phaser framework

**Overall Status**: ✅ **ALL GATES PASSED** - No constitution violations detected

## Project Structure

### Documentation (this feature)

## Project Structure

### Documentation (this feature)

```text
specs/001-math-tower-defense/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Phaser 3 tower defense patterns, grid systems, math generation
├── data-model.md        # Phase 1: Game entities and state management
├── quickstart.md        # Phase 1: How to run, test, and extend the game
├── contracts/           # Phase 1: Game system interfaces
│   ├── tower-system.ts  # Tower creation, placement, combat contracts
│   ├── math-system.ts   # Problem generation and validation contracts
│   └── wave-system.ts   # Enemy spawning and progression contracts
└── checklists/
    └── requirements.md  # Specification validation (already complete)
```

### Source Code (repository root)

```text
src/
├── main.ts                          # Existing: DOM bootstrap
├── vite-env.d.ts                    # Existing: Vite types
└── game/
    ├── main.ts                      # Existing: Phaser config, scene registration
    ├── scenes/                      # Phaser 3 scene classes
    │   ├── Boot.ts                  # Existing: Initial asset loading
    │   ├── Preloader.ts             # Existing: Bulk asset loading
    │   ├── MainMenu.ts              # Existing: Entry point (will add "Start Spil" button)
    │   ├── Game.ts                  # Existing: Original game (will be replaced/refactored)
    │   ├── GameOver.ts              # Existing: End state (will extend with math game stats)
    │   ├── GradeSelection.ts        # NEW: Select grade level (Klasse 0-3)
    │   ├── MathChallenge.ts         # NEW: Present math problems, award coins
    │   ├── TowerPlacement.ts        # NEW: Tower shop and grid placement
    │   └── DefenseWave.ts           # NEW: Tower defense combat phase
    ├── entities/                    # NEW: Game object classes
    │   ├── towers/
    │   │   ├── Tower.ts             # Base tower class
    │   │   ├── BasicTower.ts        # 50 coins, 2 damage, 1s fire rate
    │   │   ├── RapidTower.ts        # 100 coins, 1 damage, 0.5s fire rate
    │   │   └── AreaTower.ts         # 150 coins, 3 damage, area effect
    │   ├── enemies/
    │   │   └── Zombie.ts            # Enemy with health, speed, path following
    │   ├── projectiles/
    │   │   ├── Projectile.ts        # Base projectile class
    │   │   └── AreaProjectile.ts    # Explosive projectile for area tower
    │   └── Grid.ts                  # 2D grid system for tower placement
    ├── systems/                     # NEW: Game logic systems
    │   ├── MathProblemGenerator.ts  # Generate grade-appropriate problems
    │   ├── WaveManager.ts           # Control zombie spawning and difficulty
    │   ├── CombatSystem.ts          # Handle tower targeting and damage
    │   └── PathFollowing.ts         # Zombie movement along predefined path
    ├── data/                        # NEW: Game configuration and content
    │   ├── mathProblems.ts          # Problem pools for each grade (0-3)
    │   ├── towerConfig.ts           # Tower types, stats, costs
    │   ├── waveConfig.ts            # Wave definitions and scaling rules
    │   └── levelLayout.ts           # Grid dimensions, paths, spawn/base positions
    └── types/                       # NEW: TypeScript interfaces
        ├── GameTypes.ts             # Grade, GameSession, CoinBalance types
        ├── TowerTypes.ts            # Tower, TowerType, TowerStats interfaces
        ├── EnemyTypes.ts            # Zombie, ZombieStats, WaveConfig interfaces
        └── GridTypes.ts             # GridCell, CellType, GridPosition interfaces

tests/
├── game.spec.ts                     # Existing: Basic game tests
├── build.spec.ts                    # Existing: Build verification
├── math-tower-defense/              # NEW: Feature-specific tests
│   ├── grade-selection.spec.ts      # Test grade selection scene
│   ├── math-challenge.spec.ts       # Test problem generation and answering
│   ├── tower-placement.spec.ts      # Test tower shop and grid placement
│   ├── defense-wave.spec.ts         # Test combat mechanics and waves
│   └── full-game-flow.spec.ts       # Test complete gameplay cycle

public/
└── assets/                          # Game assets
    ├── bg.png                       # Existing: Background
    └── math-tower-defense/          # NEW: Feature assets
        ├── towers/                  # Tower sprites (basic, rapid, area)
        ├── enemies/                 # Zombie sprites
        ├── projectiles/             # Projectile sprites
        ├── ui/                      # Buttons, panels, icons
        └── grid/                    # Grid tiles, highlights
```

**Structure Decision**: Single project structure selected. This is a game application with all code in `src/game/` following existing Phaser 3 patterns. New feature adds 5 scenes, ~15 entity classes organized by type (towers, enemies, projectiles), 4 game systems, data configuration files, and TypeScript type definitions. Tests organized under `tests/math-tower-defense/` to separate from existing tests. Assets organized under `public/assets/math-tower-defense/` to keep feature assets isolated.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitution violations detected. All requirements align with established patterns.

---

## Phase 0: Research Complete ✅

**Output**: [research.md](./research.md)

**Key Decisions**:
- Phaser 3 tower defense patterns (object pooling, arcade physics, timer events)
- 2D grid system (15x10 grid, cell types, coordinate conversion)
- Math problem generation (template-based, programmatic distractor creation)
- Difficulty scaling (compound scaling: zombie count +20%, health +1, speed +10% from wave 4+)
- Tower targeting ("first in range" with distance prioritization, target locking)
- State management (hybrid: scene data + GameSession singleton)
- Danish text management (centralized DanishText constants)
- Asset organization (category-based under math-tower-defense/, bulk loading in Preloader)

**All NEEDS CLARIFICATION resolved**: No unknowns remain.

---

## Phase 1: Design Complete ✅

**Outputs**:
- [data-model.md](./data-model.md) - 11 entities defined with properties, relationships, state transitions
- [contracts/math-system.md](./contracts/math-system.md) - Math problem generation and validation interfaces
- [contracts/tower-system.md](./contracts/tower-system.md) - Tower creation, targeting, and combat interfaces
- [contracts/wave-system.md](./contracts/wave-system.md) - Enemy spawning and wave management interfaces
- [quickstart.md](./quickstart.md) - Development, testing, and deployment guide

**Entity Summary**:
- Core: GameSession, MathProblem, Tower (3 types), Zombie, Projectile (2 types), GridCell, Grid, WaveConfig, Base
- Relationships mapped across scenes and systems
- State transitions defined for each entity

**Agent Context Updated**: ✅ GitHub Copilot instructions updated with TypeScript 5.7+, Phaser 3.90+, Vite 6+

---

## Post-Phase 1 Constitution Check

*Re-evaluation after design decisions*

**I. Scene-Based Architecture** ✅ PASS
- Design confirms 5 new scenes with clear responsibilities
- data-model.md documents scene transitions and data flow
- quickstart.md provides scene lifecycle guidance

**II. Bilingual Implementation** ✅ PASS  
- research.md documents DanishText constants approach
- contracts use English for technical interfaces
- Danish UI text centralized and type-safe

**III. Test-Driven Development** ✅ PASS
- quickstart.md includes comprehensive testing guide
- Test files organized under tests/math-tower-defense/
- Examples provided for writing new tests

**IV. CI/CD Pipeline** ✅ PASS
- quickstart.md documents automated deployment workflows
- PR preview process documented
- Build verification steps included

**V. Type Safety & Build Optimization** ✅ PASS
- All entities have explicit TypeScript interfaces in contracts/
- data-model.md includes type definitions summary
- Performance considerations documented in contracts

**Overall Status**: ✅ **ALL GATES PASSED** - Design aligns with constitution requirements

---

## Ready for Phase 2: Task Breakdown

**Command**: Run `/speckit.tasks` to generate task list from this plan

**Next Steps**:
1. Execute `/speckit.tasks` to create tasks.md with actionable development tasks
2. Tasks will be organized by user story (P1-P4) for independent implementation
3. Each task will reference specific files from project structure above
4. TDD approach: Write tests first, ensure they fail, then implement

**Implementation Order**:
- Phase 2.1: Setup & Foundational (project structure, base classes, shared systems)
- Phase 2.2: User Story 1 (P1 - MVP): Grade selection and math challenges
- Phase 2.3: User Story 2 (P2): Tower placement and defense waves
- Phase 2.4: User Story 3 (P3): Multi-wave progression
- Phase 2.5: User Story 4 (P4): Multiple tower types and strategy

**Estimated Scope**:
- ~50-70 development tasks
- ~20-25 test tasks (if TDD enforced)
- ~15-20 entity classes
- ~5 game systems
- ~4 data configuration files
- ~5-7 Playwright test files

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
