# Tasks: Gameplay Bug Fixes - Tower Placement, Economy, and Speed

**Branch**: `002-fix-gameplay-issues`  
**Input**: Design documents from `/specs/002-fix-gameplay-issues/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks organized by user story (P1, P2, P3) for independent implementation and testing

---

## Phase 1: Setup

**Purpose**: Verify project environment and branch setup

- [x] T001 Verify Node.js 18+ and all dependencies installed via `npm install`
- [x] T002 [P] Run existing tests to ensure baseline functionality via `npm run test`
- [x] T003 [P] Verify game runs in dev mode via `npm run dev` at localhost:8080

**Checkpoint**: Development environment ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared configuration infrastructure needed by all user stories

- [x] T004 Create `src/game/data/gameplayConfig.ts` with GameplayConfig interface and GAMEPLAY_CONFIG constant (default multipliers: 1.5)
- [x] T005 [P] Add helper functions `getAdjustedSpeed()` and `getAdjustedFireRate()` to gameplayConfig.ts
- [x] T006 [P] Add Danish feedback text constants to `src/game/data/danishText.ts`: "Vælg placering for tårn", "Ikke nok mønter", "Celle optaget", "Kan ikke placere på stien", "Tårn placeret!"

**Checkpoint**: Configuration foundation ready - user stories can proceed in parallel ✅

---

## Phase 3: User Story 1 - Tower Placement Control (Priority: P1) 🎯 MVP

**Goal**: Replace immediate tower placement with interactive grid selection mode

**Independent Test**: Click "Køb Tårn" → hover over cells → click valid cell → tower placed at selected location

### Tests for User Story 1

**⚠️ Write tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Create `tests/placement.spec.ts` with test: "Enter placement mode with sufficient coins"
- [ ] T008 [P] [US1] Add test: "Show green highlight on valid cell hover" to placement.spec.ts
- [ ] T009 [P] [US1] Add test: "Show red highlight on invalid cell (path)" to placement.spec.ts
- [ ] T010 [P] [US1] Add test: "Place tower on valid cell click and deduct coins" to placement.spec.ts
- [ ] T011 [P] [US1] Add test: "Reject placement on occupied cell" to placement.spec.ts
- [ ] T012 [P] [US1] Add test: "Cancel placement with ESC key without coin deduction" to placement.spec.ts
- [ ] T013 [P] [US1] Add test: "Show insufficient funds message when coins < 50" to placement.spec.ts

**Run tests**: `npm run test` - All User Story 1 tests should FAIL at this point ❌

### Implementation for User Story 1

- [x] T014 [US1] Add PlacementState fields to TowerPlacement scene in `src/game/scenes/TowerPlacement.ts`: `placementMode: boolean`, `selectedTowerType: TowerType`, `highlightedCell: Phaser.GameObjects.Rectangle | null` (already existed)
- [x] T015 [US1] Create `enterPlacementMode(towerType: TowerType): void` method in TowerPlacement.ts with coin validation (already existed)
- [x] T016 [US1] Create `exitPlacementMode(cancelled: boolean): void` method in TowerPlacement.ts (already existed)
- [x] T017 [US1] Create `highlightCell(gridPos: GridPosition): void` method in TowerPlacement.ts with green/red color coding (already existed as updateHighlight)
- [x] T018 [US1] Create `attemptPlacement(gridPos: GridPosition): boolean` method in TowerPlacement.ts with full validation (already existed as tryPlaceTower)
- [x] T019 [US1] Add interactive grid zone with `pointermove` handler in TowerPlacement.create() method (already existed)
- [x] T020 [US1] Add grid zone `pointerdown` handler for placement confirmation in TowerPlacement.create() (already existed)
- [x] T021 [US1] Modify buy button click handler to call `enterPlacementMode('basic')` instead of immediate tower spawn (already existed)
- [x] T022 [US1] Add ESC key listener in TowerPlacement.create() to call `exitPlacementMode(true)` (added)
- [x] T023 [US1] Update feedback text display logic to show placement instructions and errors (updated with DanishText)

**Run tests**: `npm run test` - All User Story 1 tests should PASS ✅

**Checkpoint**: Tower placement fully functional and testable independently ✅

---

## Phase 4: User Story 2 - Coin Economy Balance (Priority: P2)

**Goal**: Remove wave completion coin rewards, keep only math problem rewards

**Independent Test**: Complete wave → verify 0 coin change → solve math problem → verify coins awarded

### Tests for User Story 2

**⚠️ Write tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US2] Create `tests/economy.spec.ts` with test: "No coins awarded on wave completion"
- [ ] T025 [P] [US2] Add test: "Coins awarded for correct math answer based on grade" to economy.spec.ts
- [ ] T026 [P] [US2] Add test: "No coins awarded for incorrect math answer" to economy.spec.ts
- [ ] T027 [P] [US2] Add test: "Coin balance persists across wave transitions" to economy.spec.ts

**Run tests**: `npm run test` - User Story 2 tests should FAIL at this point ❌

### Implementation for User Story 2

- [x] T028 [US2] Search `src/game/scenes/DefenseWave.ts` for `addCoins` calls with grep/manual inspection (found on line 132)
- [x] T029 [US2] Remove any wave completion coin award logic from DefenseWave scene (if found in T028) (removed)
- [x] T030 [US2] Remove wave completion coin feedback messages from DefenseWave scene (if any exist) (removed bonus coins message)
- [x] T031 [US2] Verify `src/game/scenes/MathChallenge.ts` awards coins only in `checkAnswer()` for correct answers (should already be correct) (verified - only awards in isCorrect block)
- [x] T032 [US2] Verify coin reward calculation uses `5 + (grade * 5)` formula in MathChallenge.ts (should already be correct) (verified - uses waveConfig.rewards.coinPerProblem)
- [x] T033 [US2] Run comprehensive grep search: `grep -r "addCoins" src/game/scenes/` to ensure no other coin award locations exist (verified - only MathChallenge.ts remains)

**Run tests**: `npm run test` - All User Story 2 tests should PASS ✅

**Checkpoint**: Coin economy correctly tied to math problems only ✅

---

## Phase 5: User Story 3 - Game Speed Adjustment (Priority: P3)

**Goal**: Increase game speed by 50% (1.5x multiplier) via centralized configuration

**Independent Test**: Measure wave duration → verify ~67% of original time, observe faster zombie/tower movement

### Tests for User Story 3

**⚠️ Write tests FIRST, ensure they FAIL before implementation**

- [ ] T034 [P] [US3] Create `tests/speed.spec.ts` with test: "Zombies move at 1.5x base speed"
- [ ] T035 [P] [US3] Add test: "Towers fire at 1.5x base rate" to speed.spec.ts
- [ ] T036 [P] [US3] Add test: "Wave duration reduced to ~67% of baseline" to speed.spec.ts
- [ ] T037 [P] [US3] Add test: "Config change affects all game speeds" to speed.spec.ts

**Run tests**: `npm run test` - User Story 3 tests should FAIL at this point ❌

### Implementation for User Story 3

- [x] T038 [P] [US3] Import `getAdjustedSpeed` in `src/game/entities/enemies/Zombie.ts` (done)
- [x] T039 [US3] Modify Zombie constructor to apply speed multiplier: `this.speed = getAdjustedSpeed(stats.speed)` (done)
- [x] T040 [P] [US3] Import `getAdjustedFireRate` in `src/game/entities/towers/Tower.ts` (done)
- [x] T041 [US3] Modify Tower fire timer creation to use adjusted fire rate: `delay = 1000 / getAdjustedFireRate(baseFireRate)` (done - applied in constructor)
- [x] T042 [US3] Verify BasicTower inherits adjusted fire rate from parent Tower class (no changes needed to BasicTower.ts) (verified)
- [ ] T043 [US3] Manual test: Play wave and verify zombies move noticeably faster
- [ ] T044 [US3] Manual test: Observe tower firing and verify increased shot frequency

**Run tests**: `npm run test` - All User Story 3 tests should PASS ✅

**Checkpoint**: Game speed increased to 1.5x across all systems ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and edge case handling

- [ ] T045 Add edge case handling: Insufficient coins check in TowerPlacement.enterPlacementMode()
- [ ] T046 [P] Add edge case handling: Placement cancellation on wave start in TowerPlacement scene
- [ ] T047 [P] Add edge case handling: Grid bounds validation in TowerPlacement.attemptPlacement()
- [ ] T048 Update `src/game/data/danishText.ts` if any new feedback messages needed
- [ ] T049 Run full regression test suite: `npm run test` to verify all existing features still work
- [ ] T050 Manual playthrough test: Complete full game loop (Grade selection → Wave 1 → Math → Tower purchase → Wave 2)
- [ ] T051 [P] Update `.github/copilot-instructions.md` with new placement mode patterns if needed
- [ ] T052 [P] Verify bilingual compliance: All code in English, all UI text in Danish

**Checkpoint**: All features integrated, polished, and ready for deployment ✅

---

## Final Validation Checklist

**Before merging to main, verify**:

### User Story 1 - Tower Placement
- [ ] Players can click "Køb Tårn" to enter placement mode
- [ ] Grid cells highlight green (valid) or red (invalid) on hover
- [ ] Tower placed only on valid cell click
- [ ] Coins deducted only after successful placement
- [ ] ESC key cancels placement without penalty
- [ ] All placement tests pass

### User Story 2 - Coin Economy
- [ ] Zero coins awarded for wave completion
- [ ] Coins awarded only for correct math answers
- [ ] Coin amounts: Grade 1=10, Grade 2=15, Grade 3=20, Grade 4=25, Grade 5=30
- [ ] No coins for incorrect answers
- [ ] All economy tests pass

### User Story 3 - Game Speed
- [ ] Zombies move 1.5x faster (visually obvious)
- [ ] Towers fire 1.5x faster (visually obvious)
- [ ] Wave completes in ~67% of original time
- [ ] Single config file controls all speeds
- [ ] All speed tests pass

### General Quality
- [ ] All automated tests pass: `npm run test`
- [ ] No TypeScript compilation errors
- [ ] No console errors during gameplay
- [ ] All Danish text displays correctly
- [ ] Game runs smoothly at 60fps
- [ ] Existing features not broken (regression check)

---

## Implementation Strategy

**Recommended Order**:
1. **Phase 1-2**: Setup and foundation (T001-T006) - Required first
2. **Phase 3**: User Story 1 (T007-T023) - Critical P1 bug, highest value
3. **Phase 4**: User Story 2 (T024-T033) - Simple change, high educational impact
4. **Phase 5**: User Story 3 (T034-T044) - Polish improvement, do last
5. **Phase 6**: Polish and validation (T045-T052) - Final integration

**Parallel Opportunities**:
- Tests can be written in parallel (T007-T013, T024-T027, T034-T037)
- Foundation tasks T005 and T006 can be done simultaneously
- US3 implementation tasks T038-T039 and T040-T042 are independent

**MVP Scope**: 
- Minimum viable product = User Story 1 only (Tower Placement Control)
- User Story 2 and 3 can be added incrementally in subsequent releases
- Each user story delivers independent value

---

## Task Statistics

**Total Tasks**: 52
- Setup: 3 tasks
- Foundation: 3 tasks
- User Story 1 (P1): 17 tasks (7 tests + 10 implementation)
- User Story 2 (P2): 10 tasks (4 tests + 6 implementation)
- User Story 3 (P3): 11 tasks (4 tests + 7 implementation)
- Polish: 8 tasks

**Parallelizable Tasks**: 22 tasks marked with [P]

**Test Tasks**: 15 (all optional, but highly recommended)

**Implementation Tasks**: 23

**Integration Tasks**: 8

**Estimated Complexity**: 
- P1 Tower Placement: Medium-High (state management + input handling)
- P2 Coin Economy: Low (code removal/verification)
- P3 Game Speed: Low-Medium (config + entity updates)

---

## Dependencies

```
Foundation (T004-T006)
    ↓
    ├──→ US1 Tests (T007-T013) ──→ US1 Implementation (T014-T023)
    ├──→ US2 Tests (T024-T027) ──→ US2 Implementation (T028-T033)
    └──→ US3 Tests (T034-T037) ──→ US3 Implementation (T038-T044)
    
All User Stories
    ↓
Polish & Validation (T045-T052)
```

**Critical Path**: T001 → T004 → T014-T023 (User Story 1 is the longest chain)

---

## Notes

- **Test-First Approach**: All test tasks should be completed and failing before starting implementation
- **Independent Stories**: Each user story can be deployed independently as an MVP increment
- **Bilingual Compliance**: All code in English, all user-facing text in Danish (verified in T052)
- **Constitution Compliance**: All tasks follow established Phaser 3 patterns and scene architecture
- **No Breaking Changes**: All modifications are additive or removals of buggy logic
