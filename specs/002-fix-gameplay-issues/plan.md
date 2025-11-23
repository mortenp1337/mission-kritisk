# Implementation Plan: Gameplay Bug Fixes - Tower Placement, Economy, and Speed

**Branch**: `002-fix-gameplay-issues` | **Date**: November 23, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-fix-gameplay-issues/spec.md`

## Summary

Fix three critical gameplay issues to improve player experience and game balance:

1. **Tower Placement Control (P1)**: Replace immediate tower placement under "Køb Tårn" button with interactive grid-based placement mode, allowing players to strategically select tower locations
2. **Coin Economy Balance (P2)**: Remove coin rewards from wave completion, ensuring coins are only awarded for correctly solving math problems to reinforce educational objectives
3. **Game Speed Adjustment (P3)**: Increase game pacing by 50% (1.5x speed multiplier) for zombie movement and tower firing, with centralized configuration for easy tuning

**Technical Approach**: Modify existing TowerPlacement scene to add placement state machine, update MathChallenge scene coin reward logic, and create centralized game speed configuration applied to Zombie and Tower entities.

## Technical Context

**Language/Version**: TypeScript 5.7+ with ES2020 target  
**Primary Dependencies**: Phaser 3.90+ (game framework), Vite 6+ (build tool)  
**Storage**: Browser localStorage via GameSession singleton for persistent game state  
**Testing**: Playwright 1.56+ for E2E tests across Chrome, Firefox, Safari  
**Target Platform**: Web browsers with 1024x768 fixed resolution, WebGL/Canvas fallback  
**Project Type**: Single-page web game application  
**Performance Goals**: 60 fps gameplay, smooth scene transitions, <100ms input response  
**Constraints**: 1024x768 resolution (non-negotiable), bilingual code/UI (English code, Danish text)  
**Scale/Scope**: ~10 scenes, 15-cell by 10-row grid, 5-wave progression per grade level

**Key Technical Details**:
- **Scene Architecture**: Phaser 3 scene lifecycle (Boot → Preloader → MainMenu → GradeSelection → TowerPlacement ↔ MathChallenge ↔ DefenseWave → GameOver)
- **State Management**: GameSession singleton persists coins, wave number, tower positions, grade selection
- **Grid System**: 15×10 grid with 64px cells, defined path for zombie movement, validated placement zones
- **Entity System**: Tower entities (BasicTower extends abstract Tower), Zombie entities follow predefined path
- **Current Implementation**: TowerPlacement scene has buy button that immediately spawns towers, MathChallenge awards coins per correct answer, no centralized speed config

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Implementation Validation

**✅ I. Scene-Based Architecture**
- Changes contained within existing TowerPlacement scene (placement mode logic)
- No new scenes required, follows established scene lifecycle patterns
- Scene transitions remain unchanged (TowerPlacement → DefenseWave → MathChallenge cycle)

**✅ II. Bilingual Implementation**
- All new code elements in English: `placementMode`, `highlightedCell`, `speedMultiplier`
- All UI feedback text in Danish: "Vælg placering" (Select placement), "Ikke nok mønter" (Not enough coins)
- No changes to existing bilingual compliance

**✅ III. Test-Driven Development**
- Playwright tests required for tower placement flow before implementation
- Test scenarios: purchase initiation, cell selection, placement validation, cancellation
- Test coverage for coin economy: verify no coins on wave completion, coins on correct answers only
- Speed verification tests: measure wave duration before/after speed changes

**✅ IV. CI/CD Pipeline**
- All changes go through standard PR workflow with preview deployment
- No modifications to CI/CD configuration needed
- Full test suite must pass before merge

**✅ V. Type Safety & Build Optimization**
- All new properties have explicit TypeScript types
- No changes to build configuration required
- Existing Phaser type declarations sufficient for new functionality

### Compliance Status: **PASSED** ✓

No constitution violations. All changes align with established patterns. Proceeding to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-gameplay-issues/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - Phaser input patterns, state machines, speed config
├── data-model.md        # Phase 1 output - PlacementState, SpeedConfig entities
├── quickstart.md        # Phase 1 output - Testing guide for bug fixes
├── contracts/           # Phase 1 output - APIs for placement and speed systems
└── checklists/
    └── requirements.md  # Spec validation checklist
```

### Source Code (repository root)

```text
src/game/
├── data/
│   ├── gameplayConfig.ts       # NEW: Centralized speed configuration
│   ├── towerConfig.ts          # Existing: Tower stats (unchanged)
│   └── waveConfig.ts           # Existing: Wave configs (unchanged)
├── entities/
│   ├── enemies/
│   │   └── Zombie.ts           # MODIFY: Apply speed multiplier to movement
│   └── towers/
│       ├── Tower.ts            # MODIFY: Apply speed multiplier to firing rate
│       └── BasicTower.ts       # MODIFY: Use speed-adjusted fire rate
├── scenes/
│   ├── TowerPlacement.ts       # MODIFY: Add placement state machine
│   ├── MathChallenge.ts        # MODIFY: Remove wave completion coin rewards
│   └── DefenseWave.ts          # MODIFY: Remove coin awards, apply speed config
└── systems/
    └── GameSession.ts          # Existing: State management (minimal changes)

tests/
├── placement.spec.ts           # NEW: Tower placement interaction tests
├── economy.spec.ts             # NEW: Coin earning verification tests
└── speed.spec.ts               # NEW: Game speed validation tests
```

**Structure Decision**: Using existing Phaser 3 single-project structure. Bug fixes are modifications to existing scenes and entities. New `gameplayConfig.ts` centralizes timing parameters. Tests added to validate each bug fix independently.

## Phase 0: Research & Analysis

### Objectives
- Understand Phaser 3 input event patterns for interactive grid selection
- Research state machine patterns for placement mode
- Investigate best practices for centralized game configuration
- Analyze existing coin reward logic across scenes
- Determine optimal approach for speed multipliers in game loop

### Research Tasks

1. **Phaser Input System for Grid Interaction**
   - How to capture pointer events on grid cells
   - Best practices for hover effects and visual feedback
   - Event handling for cell selection vs. cancellation
   - Coordinate transformation from screen to grid space (existing: `screenToGrid` in levelLayout.ts)

2. **Placement State Machine Pattern**
   - State: IDLE (normal play) vs. PLACEMENT (selecting tower location)
   - Transitions: buy button click → PLACEMENT, cell selection/cancel → IDLE
   - Visual feedback during state transitions
   - Preventing unintended placements

3. **Centralized Configuration Architecture**
   - Single source of truth for timing parameters
   - Export structure for speed multipliers
   - Usage pattern in entities (Zombie, Tower classes)
   - Hot-reload considerations for development

4. **Coin Economy Flow Analysis**
   - Current coin award points: MathChallenge (correct answer), DefenseWave (wave completion)
   - Session state management for coin persistence
   - UI update triggers for coin display

5. **Game Speed Implementation Strategy**
   - Speed affects: Zombie.update() movement delta, Tower fire rate timing
   - Multiplier application: multiply base values or divide time intervals
   - Testing approach: measure frame-independent timing

### Expected Artifacts
- `research.md` with findings and recommendations for each task
- Code examples from existing codebase showing current patterns
- Decision rationale for implementation approach

## Phase 1: Design & Contracts

### Objectives
- Define PlacementState entity and state transitions
- Design GameplayConfig interface for centralized speed parameters
- Specify APIs for placement mode activation/deactivation
- Document coin transaction events and removal of wave rewards
- Create integration contracts between scenes and entities

### Design Deliverables

1. **`data-model.md`**
   - **PlacementState Entity**: 
     - Fields: `isActive: boolean`, `selectedTowerType: TowerType`, `availableCells: GridPosition[]`, `highlightedCell: GridPosition | null`
     - State transitions: IDLE ↔ PLACEMENT
     - Validation rules: sufficient coins, valid grid cell, not occupied
   
   - **GameplayConfig Entity**:
     - Fields: `speedMultiplier: number`, `zombieSpeedBase: number`, `towerFireRateBase: number`
     - Default values: `speedMultiplier: 1.5`, bases from existing configs
     - Usage: applied in Zombie.update() and Tower.updateFiring()
   
   - **CoinTransaction Entity** (existing, modified):
     - Remove wave completion source
     - Retain math problem source with difficulty-based amounts

2. **`contracts/` Directory**
   
   **placement-system.md**:
   ```typescript
   // TowerPlacement scene APIs
   enterPlacementMode(towerType: TowerType): void
   exitPlacementMode(cancelled: boolean): void
   highlightCell(gridPos: GridPosition): void
   attemptPlacement(gridPos: GridPosition): boolean
   ```
   
   **speed-config.md**:
   ```typescript
   // gameplayConfig.ts exports
   export const GAMEPLAY_CONFIG: {
     speedMultiplier: number;
     getZombieSpeed(baseSpeed: number): number;
     getTowerFireRate(baseRate: number): number;
   }
   ```
   
   **coin-economy.md**:
   ```typescript
   // MathChallenge scene - coin award on correct answer
   awardCoins(problemDifficulty: number): void
   
   // DefenseWave scene - NO coin awards
   // (remove existing wave completion coin logic)
   ```

3. **`quickstart.md`**
   - Setup instructions for testing bug fixes locally
   - Manual test scenarios for each priority (P1, P2, P3)
   - Expected behavior descriptions with screenshots/recordings
   - Regression test checklist (existing features still work)

### Post-Design Constitution Re-Check

After completing Phase 1 design, re-validate against constitution:
- ✅ Scene architecture preserved
- ✅ Bilingual compliance in all new text
- ✅ Type safety maintained
- ✅ No build config changes

## Phase 2: Implementation Planning (NOT in this command)

Phase 2 is executed by `/speckit.tasks` command, which generates `tasks.md` with:
- Task breakdown for each priority level
- Acceptance criteria per task
- Test requirements per task
- Sequencing and dependencies

**Stop here**: `/speckit.plan` command ends after Phase 1 completion.

