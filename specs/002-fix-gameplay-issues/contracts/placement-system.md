# Contract: Tower Placement System

**Feature**: 002-fix-gameplay-issues  
**Component**: TowerPlacement Scene  
**Purpose**: Define the API for interactive tower placement mode

---

## Overview

The Tower Placement System provides an interactive mode where players select grid cells to place towers rather than having towers spawn immediately under UI buttons.

---

## API: TowerPlacement Scene

### Method: `enterPlacementMode(towerType: TowerType): void`

**Purpose**: Initiate tower placement mode, allowing player to select grid location

**Parameters**:
- `towerType: TowerType` - Type of tower to place (e.g., 'basic')

**Preconditions**:
- `session.coins >= getTowerCost(towerType)` - Player must have sufficient coins
- `placementState.isActive === false` - Not already in placement mode

**Behavior**:
1. Validate player has sufficient coins
2. If insufficient: Show feedback "Ikke nok mønter", return early
3. Set `placementState.isActive = true`
4. Set `placementState.selectedTowerType = towerType`
5. Enable grid pointer events (pointermove, pointerdown)
6. Show feedback "Vælg placering for tårn"
7. Update buy button visual state (dimmed/disabled during placement)

**Postconditions**:
- `placementState.isActive === true`
- Grid is interactive with hover feedback enabled
- Buy button is disabled until placement completes

**Error Handling**:
- Insufficient coins: Display Danish error message, do not enter placement mode
- Invalid tower type: Throw error (development-time catch)

---

### Method: `exitPlacementMode(cancelled: boolean): void`

**Purpose**: Exit placement mode and return to normal state

**Parameters**:
- `cancelled: boolean` - Whether placement was cancelled (true) or completed (false)

**Behavior**:
1. Set `placementState.isActive = false`
2. Set `placementState.selectedTowerType = null`
3. Clear `placementState.highlightedCell`
4. Disable grid pointer events
5. Clear any highlight graphics from grid
6. Re-enable buy button
7. If `!cancelled`: Update coin display to reflect tower purchase

**Postconditions**:
- `placementState.isActive === false`
- Grid no longer interactive
- Buy button is re-enabled
- Highlight visuals removed

**Called By**:
- `attemptPlacement()` on successful tower placement (`cancelled = false`)
- ESC key handler (`cancelled = true`)
- Cancel button click handler (`cancelled = true`)
- Wave start event (`cancelled = true`, safety measure)

---

### Method: `highlightCell(gridPos: GridPosition): void`

**Purpose**: Provide visual feedback for cell under cursor during placement mode

**Parameters**:
- `gridPos: GridPosition` - Grid coordinates of cell to highlight

**Preconditions**:
- `placementState.isActive === true` - Must be in placement mode

**Behavior**:
1. Validate `gridPos` is within grid bounds
2. Get cell from grid: `cell = grid.getCell(gridPos)`
3. Determine cell validity:
   - Invalid if: `cell.isOccupied === true`
   - Invalid if: `isOnPath(gridPos) === true`
   - Valid otherwise
4. Update `placementState.highlightedCell = gridPos`
5. Move highlight rectangle to cell screen position
6. Set highlight color:
   - Green tint (0x00ff00, alpha 0.3) if valid
   - Red tint (0xff0000, alpha 0.3) if invalid

**Postconditions**:
- Highlight rectangle visible at grid cell position
- Color indicates placement validity

**Performance Note**:
- Called on every `pointermove` event (~60 times per second)
- Keep logic lightweight to maintain 60fps

---

### Method: `attemptPlacement(gridPos: GridPosition): boolean`

**Purpose**: Attempt to place tower at selected grid cell

**Parameters**:
- `gridPos: GridPosition` - Grid coordinates where tower should be placed

**Returns**:
- `boolean` - `true` if placement succeeded, `false` if rejected

**Preconditions**:
- `placementState.isActive === true` - Must be in placement mode
- `placementState.selectedTowerType !== null` - Tower type must be selected

**Behavior**:
1. Validate cell is placeable:
   - Check: `!grid.getCell(gridPos).isOccupied`
   - Check: `!isOnPath(gridPos)`
   - Check: Within grid bounds
2. If invalid:
   - Show feedback based on reason:
     - "Celle optaget" (Cell occupied)
     - "Kan ikke placere på stien" (Cannot place on path)
   - Return `false`
3. If valid:
   - Create tower: `new BasicTower(gridPos, selectedTowerType, this)`
   - Deduct coins: `session.removeCoins(getTowerCost(selectedTowerType))`
   - Update grid: `grid.getCell(gridPos).isOccupied = true`
   - Store in session: `session.addTowerPosition(gridPos, selectedTowerType)`
   - Add tower to scene's tower array
   - Show feedback: "Tårn placeret!" (Tower placed!)
   - Call `exitPlacementMode(false)`
   - Return `true`

**Postconditions** (if successful):
- Tower entity created at grid position
- Coins deducted from player balance
- Grid cell marked as occupied
- Placement mode exited
- Tower array updated for wave defense

**Postconditions** (if failed):
- Feedback shown to player
- Placement mode remains active
- No changes to coins or grid

**Error Handling**:
- Invalid grid position: Show feedback, return false
- Occupied cell: Show feedback, return false
- Path cell: Show feedback, return false

---

## Events

### Input Events Handled

**Keyboard Events**:
```typescript
this.input.keyboard.on('keydown-ESC', () => {
    if (placementState.isActive) {
        exitPlacementMode(true); // Cancel placement
    }
});
```

**Pointer Events**:
```typescript
gridZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
    if (placementState.isActive) {
        const gridPos = screenToGrid(pointer.x, pointer.y);
        if (gridPos) highlightCell(gridPos);
    }
});

gridZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (placementState.isActive) {
        const gridPos = screenToGrid(pointer.x, pointer.y);
        if (gridPos) attemptPlacement(gridPos);
    }
});
```

**Button Events**:
```typescript
buyTowerButton.on('pointerdown', () => {
    enterPlacementMode('basic'); // 'basic' is current default tower type
});

// Future: Add cancel button
cancelButton.on('pointerdown', () => {
    if (placementState.isActive) {
        exitPlacementMode(true);
    }
});
```

---

## State Invariants

**During IDLE state**:
- `placementState.isActive === false`
- `placementState.selectedTowerType === null`
- `placementState.highlightedCell === null`
- Grid pointer events disabled
- Buy button enabled

**During ACTIVE state**:
- `placementState.isActive === true`
- `placementState.selectedTowerType !== null`
- `placementState.highlightedCell` updated on pointer move
- Grid pointer events enabled
- Buy button disabled
- Highlight rectangle visible

---

## Integration Points

**Dependencies**:
- `Grid` entity - provides cell validation and position data
- `GameSession` singleton - coin balance and tower position persistence
- `getTowerCost()` from towerConfig.ts - tower pricing
- `screenToGrid()` from levelLayout.ts - coordinate conversion
- `isOnPath()` from levelLayout.ts - path validation
- `DanishText` - localized feedback messages

**Consumers**:
- UI buy button - triggers `enterPlacementMode()`
- ESC key handler - triggers `exitPlacementMode(true)`
- Wave start event - triggers `exitPlacementMode(true)` as safety

**Side Effects**:
- Modifies `GameSession.coins` on successful placement
- Modifies `Grid.cells[].isOccupied` on successful placement
- Adds entry to `GameSession.towerPositions` array

---

## Example Usage

```typescript
// In TowerPlacement.create()
this.buyTowerButton.on('pointerdown', () => {
    this.enterPlacementMode('basic');
});

// Grid interaction setup
const gridZone = this.add.zone(gridX, gridY, gridWidth, gridHeight);
gridZone.setInteractive();

gridZone.on('pointermove', (pointer) => {
    if (this.placementState.isActive) {
        const gridPos = screenToGrid(pointer.x, pointer.y);
        if (gridPos) this.highlightCell(gridPos);
    }
});

gridZone.on('pointerdown', (pointer) => {
    if (this.placementState.isActive) {
        const gridPos = screenToGrid(pointer.x, pointer.y);
        if (gridPos) this.attemptPlacement(gridPos);
    }
});

// ESC key cancellation
this.input.keyboard.on('keydown-ESC', () => {
    if (this.placementState.isActive) {
        this.exitPlacementMode(true);
    }
});
```

---

## Testing Contract

**Test Scenarios**:
1. Enter placement mode with sufficient coins → mode activates
2. Enter placement mode with insufficient coins → error shown, mode not activated
3. Hover over valid cell → green highlight appears
4. Hover over occupied cell → red highlight appears
5. Hover over path cell → red highlight appears
6. Click valid cell → tower placed, coins deducted, mode exits
7. Click invalid cell → error shown, mode stays active, coins unchanged
8. Press ESC during placement → mode exits, coins unchanged
9. Start wave during placement → mode auto-exits, coins unchanged

**Acceptance Criteria**:
- All player interactions result in appropriate visual feedback within 100ms
- No accidental placements (requires explicit valid cell click)
- Coins only deducted on successful placement
- Grid state only modified on successful placement
- ESC key always cancels placement without penalty
