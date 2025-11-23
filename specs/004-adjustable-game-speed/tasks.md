# Implementation Tasks: Adjustable Game Speed Controls

**Feature**: Adjustable Game Speed Controls (Speed Up/Down +/- buttons)  
**Branch**: `004-adjustable-game-speed`  
**Specification**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

---

## Overview

This document breaks down the adjustable game speed feature into **34 implementation tasks** organized across **6 phases**:

1. **Phase 1 (Setup)** - 3 tasks: Project initialization
2. **Phase 2 (Foundational)** - 6 tasks: Core systems (GameSession, types)
3. **Phase 3 (User Story 1: Speed Up)** - 8 tasks: Speed increase functionality
4. **Phase 4 (User Story 2: Slow Down)** - 7 tasks: Speed decrease functionality
5. **Phase 5 (User Story 3 & 4: UI & State)** - 7 tasks: Visual feedback & positioning
6. **Phase 6 (Testing & Polish)** - 6 tasks: E2E validation

---

## Phase 1: Setup

- [X] T001 Create feature branch `004-adjustable-game-speed` from `main`
- [X] T002 Verify TypeScript compilation and build passes with no errors
- [X] T003 Confirm Phaser 3.90.0 available and `time.timeScale` API accessible in `src/game/scenes/DefenseWave.ts`

---

## Phase 2: Foundational - Core Speed Management System

- [X] T004 [P] Extend `src/game/systems/GameSession.ts`: Add property `currentSpeed: number = 1.0`
- [X] T005 [P] Extend `src/game/systems/GameSession.ts`: Add method `setGameSpeed(multiplier: number): void` with boundary enforcement (0.5x–2.0x clamp)
- [X] T006 [P] Extend `src/game/systems/GameSession.ts`: Add method `resetGameSpeed(): void` to reset to 1.0x
- [X] T007 [P] Add type `SpeedControlConfig` to `src/game/types/GameTypes.ts` with properties: `minSpeed, maxSpeed, speedStep, debounceDelay`
- [X] T008 [P] Create `src/game/entities/SpeedControl.ts` skeleton class with constructor and placeholder methods
- [X] T009 Verify `GameSession` changes compile without TypeScript errors

---

## Phase 3: User Story 1 - Speed Up Gameplay (Priority P1)

**Goal**: Players can increase game speed from 1.0x to 2.0x in two button presses  
**Independent Test**: Launch wave → press + twice → verify speed = 2.0x, verify enemies move faster  
**Acceptance Criteria**: Speed increases by 0.5x per press, max 2.0x, visual feedback updates

- [X] T010 [P] [US1] Implement `SpeedControl.increaseSpeed()` method in `src/game/entities/SpeedControl.ts`: Add 0.5x to current speed
- [X] T011 [P] [US1] Implement `SpeedControl.setSpeed(multiplier)` method: Clamp to [0.5, 2.0], update `currentSpeed` property
- [X] T012 [P] [US1] Implement increase button creation in `SpeedControl.createButtons()`: Text element "+" at position (x=990, y=50)
- [X] T013 [P] [US1] Add click handler for increase button: Call `increaseSpeed()` on pointerdown, enforce 100ms debounce
- [X] T014 [US1] Integrate `SpeedControl` into `src/game/scenes/DefenseWave.ts`: Create instance in `create()` method
- [X] T015 [US1] Connect speed callback: When `SpeedControl.onSpeedChange` fires, call `this.time.timeScale = speed`
- [X] T016 [US1] Verify speed increases work: Run dev server, launch wave, press + button, log `this.time.timeScale`
- [X] T017 [US1] Manual test: Enemies move visibly faster when speed increases (observe Zombie movement)

---

## Phase 4: User Story 2 - Slow Down Gameplay (Priority P1)

**Goal**: Players can decrease game speed from 1.0x to 0.5x in two button presses  
**Independent Test**: Launch wave → press - twice → verify speed = 0.5x, verify enemies move slower  
**Acceptance Criteria**: Speed decreases by 0.5x per press, min 0.5x, visual feedback updates

- [X] T018 [P] [US2] Implement `SpeedControl.decreaseSpeed()` method: Subtract 0.5x from current speed
- [X] T019 [P] [US2] Implement decrease button creation in `SpeedControl.createButtons()`: Text element "−" at position (x=860, y=50)
- [X] T020 [P] [US2] Add click handler for decrease button: Call `decreaseSpeed()` on pointerdown, enforce 100ms debounce
- [X] T021 [US2] Wire decrease button to scene's speed callback (same path as T015)
- [X] T022 [US2] Verify speed decreases work: Run dev server, launch wave, press - button, log `this.time.timeScale`
- [X] T023 [US2] Manual test: Enemies move visibly slower when speed decreases (observe Zombie movement)
- [X] T024 [US2] Edge case test: Verify buttons stop responding at boundaries (+ disabled at 2.0x, - disabled at 0.5x)

---

## Phase 5: User Story 3 & 4 - Visual Feedback & UI Positioning

**Goal**: Players see real-time speed indicator (1.0x, 1.5x, 2.0x format); controls positioned bottom-right without grid overlap  
**Independent Test**: Increase speed → verify display shows "1.5x"; verify no overlap with grid cells or existing UI  
**Acceptance Criteria**: Text updates within 100ms, positioned at bottom-right (x: 860–1020, y: 720), no pointer event interference

- [X] T025 [P] [US3] Implement speed display text in `SpeedControl.createButtons()`: Text element at position (x=925, y=50)
- [X] T026 [P] [US3] Implement `SpeedControl.formatSpeed(speed: number): string` method: Return format "1.0x", "1.5x", etc.
- [X] T027 [US3] Implement `SpeedControl.updateDisplay(speed)` method: Update display text and button opacity based on boundaries
- [X] T028 [US3] Wire display updates: Call `updateDisplay()` from `setSpeed()` callback
- [X] T029 [P] [US4] Position buttons in top-right: Verify coordinates (−) x=860, (display) x=925, (+) x=990, all y=50
- [X] T030 [US4] Verify non-overlap with existing UI: Coin display (50,30), Wave counter (512,30), Health (950,30) don't conflict with controls
- [X] T031 [US4] Test pointer events: Place towers while speed buttons visible; verify grid clicks not intercepted by buttons

---

## Phase 6: Testing & Polish - State Reset & Validation

**Goal**: Speed resets to 1.0x between waves; all components work together; no regressions  
**Independent Test**: Adjust speed during wave → complete wave → start new wave → verify speed = 1.0x  
**Acceptance Criteria**: Proper state cleanup, physics smooth during transitions, all 4 user stories pass acceptance scenarios

- [X] T032 [P] Add reset logic to `src/game/scenes/DefenseWave.ts`: Call `GameSession.resetGameSpeed()` on wave complete
- [X] T033 [P] Add reset logic to `src/game/scenes/DefenseWave.ts`: Call `GameSession.resetGameSpeed()` on game over
- [X] T034 [US1,US2,US3,US4] End-to-end Playwright test: Launch game → select grade → start wave → press +, - buttons → verify speed display updates → verify enemies respond → complete wave → verify reset to 1.0x

---

## Summary of Changes Made

### Issue Fixes
1. **Zombie speed not affected by timeScale** (T016-T017):
   - Modified `src/game/entities/enemies/Zombie.ts` to apply `scene.time.timeScale` to movement calculation
   - Now zombie speed dynamically responds to speed control buttons

2. **UI positioning overlap** (T030-T031):
   - Moved speed controls from top-right (y=50) to bottom-right (y=720)
   - Avoids collision with existing UI elements (coins, wave counter, health display)
   - Positioned clear of grid interaction area (150-850 x-range, 100-650 y-range)

3. **Zombie spacing increases at higher game speeds** (Post-implementation fix):
   - Root cause: Spawn interval not scaled by timeScale, causing zombies to spawn at same frequency while moving faster
   - Fix: Modified `src/game/systems/WaveManager.ts` to scale spawn timer by `scene.time.timeScale`
   - Result: Zombie spacing now remains consistent regardless of game speed

4. **Max speed limited to 2.0x** (Post-implementation fix):
   - Updated max speed constant from 2.0 to 5.0 in `src/game/entities/SpeedControl.ts`
   - Updated max speed boundary from 2.0 to 5.0 in `src/game/systems/GameSession.ts`
   - Result: Speed now increments up to 5x (10 button presses from 1x)

---

## Dependency Graph

```
T001 (Branch)
  ↓
T002 (Build check)
  ↓
T003 (API verification)
  ├─→ T004,T005,T006 [Phase 2 - Parallel]
  ├─→ T007,T008 [Phase 2 - Parallel]
  ├─→ T009 (Compile check after T008)
  │
  ├─→ T010,T011,T012,T013 [Phase 3 US1 - Parallel]
  ├─→ T018,T019,T020 [Phase 4 US2 - Parallel]
  ├─→ T025,T026,T027 [Phase 5 US3 - Parallel]
  ├─→ T029,T030 [Phase 5 US4 - Parallel]
  │
  └─→ T014,T015 (Integration, after US1 setup)
      └─→ T016,T017 (US1 verification)
      └─→ T021,T022,T023,T024 (US2 verification)
      └─→ T028,T031 (US3/US4 verification)
      └─→ T032,T033 (Reset logic)
      └─→ T034 (E2E Playwright test)
```

---

## Parallel Execution Opportunities

### Batch 1 (After Phase 2 compile check T009):
- **T010-T013** (US1 increase button logic) + **T018-T020** (US2 decrease button logic) + **T025-T027** (US3 display text) - all independent UI component methods
- **T029-T030** (US4 positioning) - layout verification
- **Result**: All button & display logic ready for integration simultaneously

### Batch 2 (Integration phase):
- **T014-T015** (US1 integration) → **T016-T017** (US1 test)
- **T021-T024** (US2 integration & tests) - can start once T014-T015 complete
- **T028,T031** (US3/US4 display wiring & overlap testing) - can run in parallel with US2
- **Result**: E2E ready after all story integration

---

## Independent Story Testing

| Story | MVP Scope | Can Test Independently? |
|-------|-----------|------------------------|
| US1: Speed Up | T010-T017 (increase button logic + integration) | ✅ Yes - launch wave, press +, verify 2.0x speed |
| US2: Slow Down | T018-T024 (decrease button logic + integration) | ✅ Yes - launch wave, press -, verify 0.5x speed |
| US3: Visual Feedback | T025-T028 (display text + updates) | ✅ Yes - change speed, verify text shows "1.0x/1.5x/2.0x" |
| US4: No UI Overlap | T029-T031 (positioning + overlap verification) | ✅ Yes - launch wave, place tower, verify no interference |

**MVP Scope**: Implement US1 (speed up) only - delivers immediate gameplay value with 7-8 tasks

---

## Success Metrics

| Metric | Target | Task(s) |
|--------|--------|---------|
| **SC-001**: 1x → 2x in 2 presses | < 2 seconds | T010, T013, T017 |
| **SC-002**: 1x → 0.5x in 2 presses | < 2 seconds | T018, T020, T023 |
| **SC-003**: Display updates | < 100ms | T025, T028 |
| **SC-004**: Enemies respond | < 1 frame | T015, T017, T022 |
| **SC-005**: Controls < 5% screen | No overlap | T029, T030, T031 |
| **SC-006**: Wave duration scales | 2x speed → 50% time | T017, T023 (manual observation) |
| **SC-007**: Task completion 20% faster at 2x | Baseline test | T034 (Playwright) |
| **SC-008**: 95% player discovery | UI obviously visible | T031 (placement test) |

---

## Notes & Constraints

- **Debounce Strategy**: 100ms enforced per button (T013, T020) - prevents rapid mashing while remaining responsive
- **Position Confirmation**: Top-right corner (x: 860–1020, y: 30–60) finalizes grid overlap concerns raised in user request
- **Additive Stepping**: Explicit in T010, T018 - each press ±0.5x, no multiplicative scaling
- **State Management**: GameSession holds speed (T004-T006); SpeedControl is UI-only (created/destroyed per wave)
- **Reset Behavior**: Explicit calls in T032-T033 ensure clean state between waves
- **E2E Coverage**: T034 Playwright test validates all 4 user stories in single flow

---

## Task Checklist Format Validation

✅ All tasks follow strict format:
- Checkbox: `- [ ]`
- Task ID: `TXXX` (sequential T001–T034)
- Parallelizable marker: `[P]` where applicable
- Story label: `[USXX]` for story phases only (omitted for setup/foundational/polish)
- Description: Clear action with file path

Example valid tasks:
- `- [ ] T010 [P] [US1] Implement SpeedControl.increaseSpeed() method in src/game/entities/SpeedControl.ts`
- `- [ ] T034 [US1,US2,US3,US4] End-to-end Playwright test: Launch game → select grade → start wave → ...`
- `- [ ] T001 Create feature branch 004-adjustable-game-speed from main`

---

## Next Steps

1. **Verify** this task breakdown matches your vision (review Story breakdown, MVP scope)
2. **Execute** tasks sequentially, using parallelizable markers to accelerate execution
3. **Validate** each phase with acceptance criteria before proceeding to next
4. **Reference** [spec.md](./spec.md) for detailed requirements; [plan.md](./plan.md) for technical context
