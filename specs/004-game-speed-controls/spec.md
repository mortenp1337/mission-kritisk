# Feature Specification: Game Speed Controls

**Feature Branch**: `004-game-speed-controls`  
**Created**: 2025-11-23  
**Status**: Draft  
**Input**: User description: "Adjust game speed during waves with + - controls, ensure no overlap with grid or UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Speed Up Game During Wave (Priority: P1)

Players want to speed up the game during defense waves when they are confident in their tower placement and want to progress faster through waves they find easy or when waiting for enemies to reach their towers.

**Why this priority**: Core functionality that directly addresses the user's main request. Provides immediate value by allowing players to control their gameplay pace and reduce waiting time during waves.

**Independent Test**: Can be fully tested by starting a defense wave, clicking the speed increase button, and observing that enemies move faster. Delivers value by making the game more responsive to player preferences.

**Acceptance Scenarios**:

1. **Given** a defense wave is active with enemies on screen, **When** the player clicks the speed increase button, **Then** the game speed increases and all game elements (enemy movement, tower firing, animations) speed up proportionally
2. **Given** the game is at normal speed, **When** the player clicks the speed increase button multiple times, **Then** the game speed increases incrementally up to the maximum allowed speed
3. **Given** the game is at maximum speed, **When** the player clicks the speed increase button, **Then** the game remains at maximum speed and provides visual feedback that the limit is reached

---

### User Story 2 - Slow Down Game During Wave (Priority: P1)

Players want to slow down the game during defense waves when the action becomes too fast, they need more time to strategize, or they accidentally increased the speed too much.

**Why this priority**: Essential counterpart to speeding up. Players need control in both directions to find their optimal pace. Without this, players who increase speed too much would be stuck.

**Independent Test**: Can be fully tested by starting a defense wave, setting game to fast speed, clicking the speed decrease button, and observing that gameplay slows down. Delivers value by giving players full control over game pace.

**Acceptance Scenarios**:

1. **Given** the game is running at increased speed, **When** the player clicks the speed decrease button, **Then** the game speed decreases and all game elements slow down proportionally
2. **Given** the game is at fast speed, **When** the player clicks the speed decrease button multiple times, **Then** the game speed decreases incrementally down to the minimum allowed speed
3. **Given** the game is at normal (minimum) speed, **When** the player clicks the speed decrease button, **Then** the game remains at normal speed and provides visual feedback that the limit is reached

---

### User Story 3 - Visual Speed Indicator (Priority: P2)

Players want to see the current game speed at a glance so they know how fast the game is running without having to test it or count button presses.

**Why this priority**: Enhances usability but the feature works without it. Players can function by trial and error with just the buttons, but an indicator improves the experience.

**Independent Test**: Can be fully tested by adjusting game speed and observing the speed indicator update. Delivers value by providing clear feedback about current game state.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** the player looks at the speed controls, **Then** they can see a clear indication of the current speed (e.g., "1x", "1.5x", "2x")
2. **Given** the player changes the game speed, **When** the speed changes, **Then** the speed indicator updates immediately to reflect the new speed
3. **Given** the game is at maximum or minimum speed, **When** the speed limit is reached, **Then** the indicator shows this clearly (e.g., grayed out buttons or max/min labels)

---

### Edge Cases

- What happens when the player rapidly clicks the speed buttons multiple times in quick succession?
- How does the system handle speed changes when no enemies are currently spawned but the wave is still active?
- What happens to speed settings when transitioning between different scenes (e.g., from DefenseWave to MathChallenge and back)?
- How does the system ensure speed controls don't interfere with other clickable UI elements or the grid?
- What happens if the player changes speed during tower firing animations or enemy death animations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a speed increase control that is clearly visible and accessible during defense waves
- **FR-002**: System MUST provide a speed decrease control that is clearly visible and accessible during defense waves
- **FR-003**: Speed controls MUST be positioned to avoid overlapping with the game grid, existing UI elements (wave counter, coin display, base health), or gameplay area
- **FR-004**: System MUST support multiple speed levels with a minimum speed of 1x (normal) and support for increased speeds (e.g., 1.5x, 2x, 3x)
- **FR-005**: Game speed changes MUST apply uniformly to all time-dependent game elements including enemy movement, tower attack rates, spawn timing, and animations
- **FR-006**: System MUST prevent speed from going below normal (1x) speed
- **FR-007**: System MUST provide clear visual feedback when speed limits (minimum or maximum) are reached
- **FR-008**: Speed controls MUST display the current game speed multiplier to the player
- **FR-009**: System MUST use Danish text labels for the speed controls, consistent with the game's language (e.g., "Hastighed:", showing "1x", "2x", etc.)
- **FR-010**: Speed controls MUST remain accessible and functional throughout the entire duration of a defense wave
- **FR-011**: System MUST handle rapid successive clicks on speed controls without breaking or causing unexpected behavior
- **FR-012**: Speed setting MUST reset to normal (1x) when starting a new wave or transitioning between game scenes

### Key Entities

- **Game Speed State**: Represents the current speed multiplier applied to the game (e.g., 1.0 for normal, 2.0 for double speed). Affects all time-based game calculations and animations.
- **Speed Control UI**: Visual interface elements that allow players to adjust game speed, including increase button, decrease button, and current speed display. Positioned in a non-intrusive location away from gameplay area and existing UI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can adjust game speed from normal (1x) to at least double speed (2x) within 1 second of clicking the control
- **SC-002**: Game speed changes apply immediately to all game elements with no visible delay or desynchronization between different elements
- **SC-003**: Speed controls are positioned such that they do not obscure any part of the game grid or overlap with existing UI elements (measured by no pixel overlap in the UI layout)
- **SC-004**: 95% of players can identify and successfully use the speed controls within their first attempt without instruction (based on intuitive placement and clear visual design)
- **SC-005**: Game remains stable and responsive when speed is changed rapidly (e.g., clicking speed buttons 10 times in 2 seconds causes no crashes, freezes, or visual glitches)
- **SC-006**: Players can accurately determine the current game speed at any time by looking at the speed indicator (100% accuracy in displaying current speed multiplier)
- **SC-007**: Speed controls remain accessible for the entire duration of defense waves (no scenarios where controls become hidden or non-functional during gameplay)
