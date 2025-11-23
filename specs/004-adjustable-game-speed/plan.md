# Implementation Plan: Adjustable Game Speed Controls

**Branch**: `004-adjustable-game-speed` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-adjustable-game-speed/spec.md`

## Summary

Add player-controlled game speed adjustment during waves with +/- buttons. The system will use Phaser's `time.timeScale` to globally scale all physics, animations, and timers. Speed will range from 0.5x to 2.0x with 0.5x increments, reset to 1.0x between waves, and positioned in the UI without overlapping the 8x5 tower grid or existing UI elements.

## Technical Context

**Language/Version**: TypeScript 5.7.2, Phaser 3.90.0
**Primary Dependencies**: Phaser 3, Vite 6.3.1
**Storage**: N/A (game state managed in GameSession)
**Testing**: Playwright
**Target Platform**: Web browser (1024x768 resolution)
**Project Type**: Single web application (Phaser game)
**Performance Goals**: 60 FPS maintained during speed adjustments
**Constraints**: No overlap with grid or UI elements; speed changes must apply smoothly across all game objects
**Scale/Scope**: Single feature for DefenseWave scene; affects enemy movement, tower targeting, timers, and animations

## Constitution Check

**GATE PASS**: ✅ All prerequisites met
- TypeScript project with existing scene structure
- Phaser 3 provides time.timeScale mechanism
- Game state management in GameSession
- UI layout has available space in corners

## Project Structure

### Documentation (this feature)

```text
specs/004-adjustable-game-speed/
├── plan.md                          # This file
├── research.md                      # Technical research outputs
├── data-model.md                    # Data model and entities
├── quickstart.md                    # Getting started guide
├── spec.md                          # Feature specification
├── checklists/
│   └── requirements.md              # Quality validation
└── contracts/
    ├── speed-control-ui.md          # UI component contract
    └── game-session-speed.md        # GameSession speed management contract
```

### Source Code Structure

```text
src/game/
├── scenes/
│   └── DefenseWave.ts               # Modified: Add speed control UI updates
├── entities/
│   └── SpeedControl.ts              # NEW: Speed control UI component
├── systems/
│   ├── GameSession.ts               # Modified: Track current game speed
│   └── WaveManager.ts               # Modified: Speed-aware updates
└── types/
    └── GameTypes.ts                 # Modified: Add SpeedControlConfig type
```

## Implementation Breakdown

### Phase 1: Core Speed Management System

#### 1.1 Extend GameSession to track speed state
- Add `gameSpeed: number = 1.0` property to GameSession
- Add `setGameSpeed(multiplier: number): void` method with boundary enforcement
- Add `resetGameSpeed(): void` method for wave/scene transitions
- Ensure thread-safe access to speed property

#### 1.2 Create SpeedControl UI component
- Implement as a new entity class `SpeedControl`
- Render +/- buttons positioned in UI corner (top-right: x=950, y=650)
- Display current speed as text (e.g., "1.0x")
- Handle button click events with debouncing (min 100ms between presses)
- Update visual state to show disabled buttons at speed boundaries

#### 1.3 Add speed adjustment logic to DefenseWave scene
- Initialize SpeedControl in `create()` method
- Pass SpeedControl click callbacks that update GameSession speed
- Pass current speed value to SpeedControl for display update
- Call `this.time.timeScale = session.gameSpeed` when speed changes

### Phase 2: Physics and Animation Synchronization

#### 2.1 Update WaveManager for speed-aware operations
- Modify `update()` to use scene's current timeScale (already inherited from Phaser)
- Verify enemy spawn timing scales with speed (WaveManager uses timers)
- Confirm Phaser handles timeScale for all built-in timers automatically

#### 2.2 Verify tower targeting and projectiles respect speed
- BasicTower physics bodies inherit timeScale automatically
- Projectile velocity calculations should work with timeScale
- Test that tower-to-enemy distance calculations remain accurate

#### 2.3 Update UI refresh logic
- Ensure text updates (wave counter, coin display, health) don't depend on delta time
- Use frame-based updates for display text, not time-based calculations

### Phase 3: UI Positioning and Layout

#### 3.1 Analyze current UI layout
- Grid occupies: x = 150-850, y = 100-650 (8x5 cells, 87.5px per cell)
- Coin display: top-left (50, 30)
- Wave counter: top-center (512, 30)
- Base health: top-right (950, 30)
- Identify safe positioning area: bottom-right corner (x=850-1000, y=670-750)

#### 3.2 Position SpeedControl buttons
- Place decreasing button (-) at x=880, y=700
- Place speed display at x=950, y=700
- Place increasing button (+) at x=1020, y=700
- Verify buttons don't overlap with grid cells or wave UI
- Use font size 24 for buttons, 20 for speed display

#### 3.3 Ensure input hit detection
- Configure button hit areas with 40px radius per button
- Verify input events don't interfere with grid click detection
- Test that tower placement works independently of speed button area

### Phase 4: State Reset and Transitions

#### 4.1 Reset speed on wave completion
- In DefenseWave's `onWaveComplete()`: call `GameSession.resetGameSpeed()`
- In DefenseWave's `onGameOver()`: call `GameSession.resetGameSpeed()`
- Set `this.time.timeScale = 1.0` explicitly on scene exit

#### 4.2 Verify state transitions
- Test: Play wave at 2x speed → complete wave → next wave starts at 1x
- Test: Play wave at 0.5x speed → game over → return to menu at normal speed

### Phase 5: Testing and Validation

#### 5.1 Unit testing
- Test GameSession speed boundaries (0.5x, 1.0x, 2.0x)
- Test speed increment/decrement logic
- Test speed reset on wave transitions

#### 5.2 Integration testing
- Test speed control buttons in DefenseWave scene
- Verify all game objects respond to speed changes
- Test UI doesn't overlay grid or existing elements
- Test speed persists across multiple button presses

#### 5.3 End-to-end testing with Playwright
- Test player can increase speed from 1x to 2x
- Test player can decrease speed from 1x to 0.5x
- Test speed display updates in real-time
- Test enemy movement speed matches multiplier
- Test buttons remain accessible throughout wave

#### 5.4 Edge cases
- Rapid button mashing (debounce or state lock)
- Speed change mid-enemy-spawn (verify no physics glitches)
- Wave completion at non-1x speed (verify proper reset)
- Multiple consecutive speed increases/decreases

## Technical Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| timeScale affects UI update logic | High | Verify all text updates use frame-based timing, not delta |
| Speed changes cause physics clipping | Medium | Test tower-enemy interactions at all speed multipliers |
| Button overlap with grid clicks | High | Careful positioning analysis and pointer event debugging |
| Speed not resetting between waves | Medium | Explicit reset calls with verification in onWaveComplete |
| Performance impact of speed scaling | Low | Phaser handles this natively; monitor FPS during testing |

## Dependencies & Integration Points

- **GameSession**: Must support speed state management
- **DefenseWave scene**: Primary integration point for UI and speed application
- **WaveManager**: Inherits speed automatically via Phaser timeScale
- **BasicTower & Zombie**: Inherit speed automatically via Phaser physics
- **Playwright tests**: Must verify speed control functionality

## Success Metrics

- All 4 user stories implemented and passing acceptance criteria
- 8/8 success criteria measurable and met
- Speed controls visible, accessible, and non-overlapping
- Automated tests verify speed adjustment functionality
- No regression in existing wave/tower/enemy behavior

## Deliverables

1. **SpeedControl.ts** - New UI component for speed controls
2. **Modified GameSession.ts** - Speed state management
3. **Modified DefenseWave.ts** - Speed control integration
4. **Modified GameTypes.ts** - Type definitions
5. **Playwright tests** - Comprehensive speed control testing
6. **Implementation contracts** - Detailed implementation guides in `/contracts/`
