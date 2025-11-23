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
2. **Given** game speed is at 1.5x, **When** player presses speed increase again, **Then** game speed increases to 2x (or appropriate max speed)
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

1. **Given** a wave is in progress with UI visible, **When** I look at the speed controls, **Then** they are positioned in a clear area (e.g., top-right or bottom-right corner not occupied by other elements)
2. **Given** the speed control buttons are displayed, **When** I perform any tower placement, **Then** the controls do not interfere with grid click detection
3. **Given** the game is running, **When** I resize or view the game on the design resolution (1024x768), **Then** the controls remain visible and non-overlapping

---

### Edge Cases

- What happens if player mashes the speed buttons repeatedly? (Controls should debounce or limit max iterations)
- How does the game handle speed changes mid-calculation? (Physics and animations must update smoothly without glitches)
- What is the minimum and maximum speed range? (Should have reasonable limits - e.g., 0.5x to 2.0x)
- What happens to tower shooting/targeting when speed changes? (Should maintain accuracy and behavior scaling)
- Does wave timing adjust with speed? (Wave duration should scale, spawn rates should maintain proportional difficulty)

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a "speed increase" button that multiplies game speed by a constant factor (e.g., +0.5x per press)
- **FR-002**: System MUST provide a "speed decrease" button that divides game speed by a constant factor (e.g., -0.5x per press)
- **FR-003**: System MUST enforce minimum speed boundary (e.g., 0.5x - no slower)
- **FR-004**: System MUST enforce maximum speed boundary (e.g., 2.0x - no faster)
- **FR-005**: System MUST display current game speed multiplier to the player in real-time
- **FR-006**: System MUST update all game physics and animations when speed changes (enemies, towers, projectiles, timers)
- **FR-007**: System MUST reset game speed to 1.0x when a wave ends or game state transitions
- **FR-008**: System MUST position speed controls in the UI without overlapping the 8x5 tower placement grid
- **FR-009**: System MUST position speed controls without overlapping existing UI elements (score, health, wave counter, buttons)
- **FR-010**: System MUST ensure speed controls remain visible and accessible at the design resolution (1024x768)
- **FR-011**: System MUST apply speed multiplier to Phaser's time scale (`this.time.timeScale`)
- **FR-012**: System MUST provide visual or audio feedback when speed changes (e.g., UI state update, sound effect)

### Key Entities

- **SpeedControl**: UI component managing the +/- buttons and speed display. Properties: currentSpeed (number), minSpeed (0.5), maxSpeed (2.0), speedStep (0.5)
- **GameSpeed State**: Current game speed multiplier persisted in GameSession or scene. Updated when buttons are pressed, reset on scene transitions.
- **TimeScale**: Phaser's built-in time scale property that affects all physics, tweens, and animations in the scene.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Players can increase game speed from 1x to 2x within 2 button presses
- **SC-002**: Players can decrease game speed from 1x to 0.5x within 2 button presses
- **SC-003**: Game speed indicator updates within 100ms of button press
- **SC-004**: All moving game objects (enemies, projectiles, animations) respond to speed changes within 1 frame
- **SC-005**: Speed controls occupy no more than 5% of the 1024x768 screen and do not overlap any grid cell or existing UI element
- **SC-006**: Wave duration scales proportionally with speed (e.g., at 2x speed, wave completes in half the time)
- **SC-007**: Player task completion (placing towers, defeating waves) is at least 20% faster when using 2x speed vs. 1x speed
- **SC-008**: 95% of players successfully locate and use speed controls on first wave encounter

## Assumptions

- Game speed adjustments only apply during active waves (DefenseWave scene)
- Speed is reset between waves and on scene transitions for consistency
- The speed step increment is 0.5x (e.g., 1.0x → 1.5x → 2.0x and 1.0x → 0.5x)
- Phaser's `time.timeScale` is the primary mechanism for global speed adjustment
- UI layout has available space in corners (top-right or bottom-right) without existing critical elements
- Touch/click events for buttons should work the same as mouse clicks
