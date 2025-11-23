# Feature Specification: Adjustable Game Speed Controls

**Feature Branch**: `004-adjustable-game-speed`  
**Created**: 2025-11-23  
**Status**: Draft  
**Input**: User description: "Add adjustable game speed controls (+/-) during waves, positioned to avoid overlap with grid and UI"

## User Scenarios & Testing

### User Story 1 - Speed Up Gameplay (Priority: P1)

Players want to accelerate the wave progression when they're comfortable with the current situation or want to test their strategy faster. This is the most critical capability as it directly enables the core use case - player-controlled time manipulation.

**Why this priority**: P1 - This is the primary use case for game speed adjustment. Players need immediate control to speed up when they're winning or testing strategies.

**Independent Test**: Can be fully tested by launching a wave, pressing the speed increase button, and verifying that game objects (enemies, towers, projectiles) move faster. Delivers immediate gameplay value.

**Acceptance Scenarios**:

1. **Given** a wave is in progress, **When** player presses the speed increase button (+), **Then** game speed increases to 1.5x and visual feedback shows the new speed level
2. **Given** game speed is at 1.5x, **When** player presses speed increase again, **Then** game speed increases to 2x and continues increasing with each press up to maximum 5x
3. **Given** a higher game speed is active, **When** wave completes or ends, **Then** game speed resets to 1x for the next wave/menu state

---

### User Story 2 - Slow Down Gameplay (Priority: P1)

Players need to slow down the game to better observe enemy behavior, plan tower placements, or handle challenging situations. This is equally critical as the speed-up feature for balanced gameplay control.

**Why this priority**: P1 - Essential for tactical gameplay. Players struggling with a wave need to slow down to think and plan their strategy.

**Independent Test**: Can be fully tested by launching a wave, pressing the speed decrease button (-), and verifying that game objects move slower. Delivers tactical gameplay value.

**Acceptance Scenarios**:

1. **Given** a wave is in progress, **When** player presses the speed decrease button (-), **Then** game speed decreases to 0.75x and visual feedback shows the new speed level
2. **Given** game speed is at 0.75x, **When** player presses speed decrease again, **Then** game speed decreases to 0.5x (or appropriate minimum speed)
3. **Given** a reduced game speed is active, **When** wave completes or ends, **Then** game speed resets to 1x

---

### User Story 3 - Visual Indication of Current Speed (Priority: P1)

Players must always know what the current game speed is to make informed decisions about whether to adjust it. Without this feedback, players won't know if their speed control is working.

**Why this priority**: P1 - Critical feedback mechanism. Players can't interact effectively with speed controls without knowing the current state.

**Independent Test**: Can be fully tested by changing speed and verifying the visual indicator updates accordingly. Delivers essential feedback.

**Acceptance Scenarios**:

1. **Given** game is running at 1x speed, **When** I look at the UI, **Then** I see an indicator showing "1x" or equivalent
2. **Given** I increase speed to 1.5x, **When** the indicator updates, **Then** it displays the new speed multiplier
3. **Given** game speed changes, **When** the change occurs, **Then** the visual feedback is immediate and clear

---

### User Story 4 - No UI Overlap with Game Grid (Priority: P1)

The speed control buttons must not obscure the tower placement grid or other critical UI elements, maintaining full visibility of the game board.

**Why this priority**: P1 - Core UX requirement. Overlapping UI elements prevent players from seeing the game state or placing towers accurately.

**Independent Test**: Can be fully tested by launching a wave and verifying that speed controls are visible and do not overlap with: the 8x5 grid, score/health display, wave counter, or any other UI elements.

**Acceptance Scenarios**:

1. **Given** a wave is in progress with UI visible, **When** I look at the speed controls, **Then** they are positioned in the bottom-right corner (x: 860–990, y: 720) without overlapping the grid or other UI
2. **Given** the speed control buttons are displayed, **When** I perform any tower placement, **Then** the controls do not interfere with grid click detection
3. **Given** the game is running, **When** I resize or view the game on the design resolution (1024x768), **Then** the controls remain visible and non-overlapping

---

### Edge Cases

- What happens if player mashes the speed buttons repeatedly? (Controls use 100ms debounce per button to prevent overlapping presses)
- How does the game handle speed changes mid-calculation? (Physics and animations must update smoothly without glitches)
- What is the minimum and maximum speed range? (0.5x to 2.0x, enforced via additive stepping)
- What happens to tower shooting/targeting when speed changes? (Should maintain accuracy and behavior scaling)
- Does wave timing adjust with speed? (Wave duration scales proportionally with speed change)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a "speed increase" button that adds 0.5x to game speed per press (additive: 1.0x → 1.5x → 2.0x → 2.5x → 3.0x → 3.5x → 4.0x → 4.5x → 5.0x)
- **FR-002**: System MUST provide a "speed decrease" button that subtracts 0.5x from game speed per press (additive: 1.0x → 0.5x)
- **FR-003**: System MUST enforce minimum speed boundary (0.5x - no slower)
- **FR-004**: System MUST enforce maximum speed boundary (5.0x - no faster) with incremental stepping
- **FR-005**: System MUST display current game speed multiplier to the player in real-time
- **FR-006**: System MUST update all game physics and animations when speed changes (enemies, towers, projectiles, timers)
- **FR-007**: System MUST reset game speed to 1.0x when a wave ends or game state transitions
- **FR-008**: System MUST scale tower fire rate by timeScale so towers shoot faster at higher speeds and slower at lower speeds
- **FR-009**: System MUST position speed controls in the bottom-right corner (x: 860–990, y: 720) without overlapping the 8x5 tower placement grid
- **FR-010**: System MUST position speed controls without overlapping existing UI elements (score, health, wave counter, buttons)
- **FR-011**: System MUST ensure speed controls remain visible and accessible at the design resolution (1024x768) in the bottom-right corner
- **FR-012**: System MUST apply speed multiplier to Phaser's time scale (`this.time.timeScale`)
- **FR-013**: System MUST provide visual feedback when speed changes via real-time speed display text update

### Key Entities

- **SpeedControl**: UI component managing the +/- buttons and speed display. Properties: currentSpeed (number), minSpeed (0.5), maxSpeed (5.0), speedStep (0.5)
- **GameSpeed State**: Current game speed multiplier persisted in GameSession. Updated when buttons are pressed, reset on scene transitions.
- **TimeScale**: Phaser's built-in time scale property that affects all physics, tweens, and animations in the scene.
- **Wave Spawning**: Zombie spawn timing scaled by timeScale to maintain consistent relative spacing regardless of game speed

## Success Criteria

### Measurable Outcomes

- **SC-001**: Players can increase game speed from 1x to 5x within 8 button presses
- **SC-002**: Players can decrease game speed from 1x to 0.5x within 1 button press
- **SC-003**: Game speed indicator updates within 100ms of button press
- **SC-004**: All moving game objects (enemies, projectiles, animations) respond to speed changes within 1 frame
- **SC-004b**: Tower fire rate scales with game speed (towers at 2x speed fire twice as fast; at 0.5x speed fire half as fast)
- **SC-005**: Speed controls occupy no more than 5% of the 1024x768 screen and do not overlap any grid cell or existing UI element
- **SC-006**: Wave duration scales proportionally with speed (e.g., at 2x speed, wave completes in half the time; at 5x speed, completes in 1/5 the time)
- **SC-007**: Zombie spacing remains consistent at all speed levels (spawn timing scales with timeScale)
- **SC-008**: Player task completion scales with game speed (e.g., at 5x speed, wave completes 5x faster)
- **SC-009**: 95% of players successfully locate and use speed controls on first wave encounter

## Clarifications

### Session 2025-11-23

- Q: Speed increment strategy (additive vs. multiplicative) → A: Additive stepping (+0.5x per press, -0.5x per press, resulting in progression: 0.5x → 1.0x → 1.5x → 2.0x → 2.5x → 3.0x → 3.5x → 4.0x → 4.5x → 5.0x)
- Q: Debounce strategy for rapid button mashing → A: 100ms debounce per button (locked for 100ms after each press)
- Q: Speed control visibility in non-wave states → A: Hidden during non-DefenseWave states; created fresh each wave and destroyed on exit
- Q: Audio vs. visual feedback on speed change → A: Visual feedback only (speed display text updates); no audio effects
- Q: Button positioning (top-right vs. bottom-right) → A: Bottom-right corner (x: 860–990, y: 720) to avoid grid and UI overlap
- Q: Maximum speed boundary → A: 5.0x with additive 0.5x steps (supports 10 clicks: 1x → 1.5x → 2.0x → 2.5x → 3.0x → 3.5x → 4.0x → 4.5x → 5.0x)
- Q: Zombie spacing at different speeds → A: Spawn intervals scaled by timeScale to maintain consistent relative spacing

## Assumptions

- Game speed adjustments only apply during active waves (DefenseWave scene)
- Speed is reset between waves and on scene transitions for consistency
- The speed step increment is 0.5x (additive: 1.0x → 1.5x → 2.0x → 2.5x → 3.0x → 3.5x → 4.0x → 4.5x → 5.0x)
- Speed controls use additive stepping, not multiplicative scaling
- Debounce window is 100ms between consecutive button presses
- Speed controls are positioned in bottom-right corner (y: 720) and destroyed on scene exit
- Phaser's `time.timeScale` is the primary mechanism for global speed adjustment
- Zombie spawn timing is scaled by timeScale to maintain consistency across all speed levels
- Visual feedback via speed display text update is sufficient; no audio effects required
- UI layout has available space in top-right corner without overlapping existing elements
- Touch/click events for buttons should work the same as mouse clicks
