# Feature Specification: Gameplay Bug Fixes - Tower Placement, Economy, and Speed

**Feature Branch**: `002-fix-gameplay-issues`  
**Created**: November 23, 2025  
**Status**: Draft  
**Input**: User description: "Fix tower placement UI, coin economy, and game speed - The UI is a bit strange when buying towers, when you click on the button 'Køb tårn' then it places the tower underneath the button, and in fact does not let the player set the tower at a preferred location. The second problem is that you earn too many coins when getting through a wave, you should only earn coins for solving math problems in between waves. Lastly, I think we can speed up the waves by 50% ie, zombie movement and shots, perhaps this should be adjustable centrally in a config"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tower Placement Control (Priority: P1)

Players need to strategically place towers on the grid at locations of their choice to defend against zombie waves. Currently, clicking the "Køb Tårn" button immediately places the tower under the button rather than allowing the player to select a grid cell, removing strategic choice and causing frustration.

**Why this priority**: This is the core gameplay mechanic for tower defense games. Without proper placement control, the game is unplayable and lacks strategic depth. This is a critical bug that breaks fundamental gameplay.

**Independent Test**: Can be fully tested by clicking "Køb Tårn" and verifying that the player can select any valid grid cell before the tower is placed. Delivers immediate strategic gameplay value.

**Acceptance Scenarios**:

1. **Given** player has enough coins and clicks "Køb Tårn", **When** player hovers over grid cells, **Then** valid placement locations are visually indicated
2. **Given** player has initiated tower purchase, **When** player clicks on a valid grid cell, **Then** tower is placed at that cell and coins are deducted
3. **Given** player has initiated tower purchase, **When** player clicks on an invalid location (occupied or out of bounds), **Then** placement is rejected with visual feedback
4. **Given** player has initiated tower purchase, **When** player clicks cancel or presses escape, **Then** purchase is cancelled and coins are not deducted

---

### User Story 2 - Coin Economy Balance (Priority: P2)

Players should earn coins only by correctly solving math problems between waves, not by simply completing waves. This creates proper incentive for learning and ties progression directly to educational achievement.

**Why this priority**: While important for game balance and educational value, the game is still playable with the current economy. Players can still progress, but the learning incentive is diminished. This should be fixed after the critical placement bug.

**Independent Test**: Can be tested by completing a wave without solving problems and verifying no coins are awarded, then solving a math problem and verifying coins are awarded. Delivers educational alignment and balanced progression.

**Acceptance Scenarios**:

1. **Given** player completes a wave, **When** wave ends, **Then** no coins are automatically awarded for wave completion
2. **Given** player is in math challenge phase, **When** player correctly solves a problem, **Then** coins are awarded based on problem difficulty
3. **Given** player is in math challenge phase, **When** player incorrectly solves a problem, **Then** no coins are awarded
4. **Given** player completes multiple math problems, **When** each problem is solved correctly, **Then** coins accumulate in player's total

---

### User Story 3 - Game Speed Adjustment (Priority: P3)

Gameplay pacing should be faster with zombie movement and tower shots occurring at 1.5x current speed (50% faster). Game speed parameters should be centrally configurable for easy tuning.

**Why this priority**: This is a polish/tuning issue that improves gameplay feel but doesn't fix a broken mechanic. The game is fully functional at current speed. This can be adjusted after core bugs are fixed.

**Independent Test**: Can be tested by observing zombie movement and tower firing rates before and after the change, timing the duration of a wave, and verifying it completes in roughly 2/3 the original time. Delivers improved pacing and engagement.

**Acceptance Scenarios**:

1. **Given** game starts a wave, **When** zombies move across the grid, **Then** movement speed is 1.5x faster than previous version
2. **Given** tower is attacking a zombie, **When** tower fires projectiles, **Then** firing rate is 1.5x faster than previous version
3. **Given** developer needs to adjust game speed, **When** changing a central config value, **Then** all speed-related parameters update accordingly
4. **Given** player plays through a complete wave, **When** comparing to original timing, **Then** wave completes in approximately 2/3 the time

---

### Edge Cases

- What happens when player clicks "Køb Tårn" but doesn't have enough coins? System should show insufficient funds message and not enter placement mode
- What happens when player tries to place tower outside grid bounds? System should reject placement and keep player in placement mode
- What happens when player tries to place tower on already occupied cell? System should reject placement with visual feedback
- What happens when speed multiplier is set to extreme values (e.g., 10x)? System should clamp values to reasonable gameplay range (0.5x to 3x)
- What happens if player starts tower placement but game state changes (e.g., wave starts)? System should cancel placement and refund intent

## Requirements *(mandatory)*

### Functional Requirements

#### Tower Placement System (P1)

- **FR-001**: System MUST enter "placement mode" when player clicks "Køb Tårn" button without immediately placing the tower
- **FR-002**: System MUST provide visual feedback during placement mode showing valid and invalid grid cells
- **FR-003**: System MUST allow player to select any valid grid cell to place the tower
- **FR-004**: System MUST validate placement location (not occupied, within grid bounds, on placeable terrain)
- **FR-005**: System MUST provide visual feedback when player hovers over grid cells during placement
- **FR-006**: System MUST deduct tower cost only after successful placement confirmation
- **FR-007**: System MUST allow player to cancel placement mode without penalty
- **FR-008**: System MUST prevent accidental placement by requiring deliberate cell selection

#### Coin Economy System (P2)

- **FR-009**: System MUST NOT award coins for completing waves
- **FR-010**: System MUST award coins only for correctly solved math problems
- **FR-011**: System MUST calculate coin rewards based on problem difficulty level
- **FR-012**: System MUST update player's coin balance immediately upon correct answer
- **FR-013**: System MUST NOT award coins for incorrect answers
- **FR-014**: System MUST persist coin balance across waves and game sessions

#### Game Speed Configuration (P3)

- **FR-015**: System MUST centralize all speed-related parameters in a single configuration location
- **FR-016**: System MUST apply a 1.5x speed multiplier to zombie movement
- **FR-017**: System MUST apply a 1.5x speed multiplier to tower firing rates
- **FR-018**: System MUST apply speed multiplier consistently across all game timing elements
- **FR-019**: System MUST allow speed multiplier to be easily adjusted without code changes in multiple files
- **FR-020**: System SHOULD support different speed multipliers for different game elements if needed in future

### Key Entities

- **Tower Placement State**: Represents the intermediate state when player has initiated tower purchase but not yet confirmed placement. Includes: selected tower type, player coin balance, available grid cells, placement validity status
- **Coin Transaction**: Represents the awarding of coins tied to specific events. Includes: amount, source (math problem difficulty), timestamp, player balance before/after
- **Game Speed Config**: Centralized configuration for all timing parameters. Includes: zombie movement speed multiplier, tower fire rate multiplier, wave duration scaling, animation speed scaling

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can place towers at chosen grid locations 100% of the time without accidental placements
- **SC-002**: Players receive coins only from math problems, with zero coins awarded from wave completion
- **SC-003**: Wave completion time is reduced to 60-70% of original duration (reflecting 1.5x speed)
- **SC-004**: Players successfully cancel tower placement when needed without losing coins
- **SC-005**: All speed parameters can be modified through a single configuration change
- **SC-006**: Game balance testing shows appropriate difficulty with new speed settings
- **SC-007**: Players report improved strategic control over tower placement (qualitative feedback)
- **SC-008**: Players understand coin earning mechanism tied to math performance (reduced confusion)
