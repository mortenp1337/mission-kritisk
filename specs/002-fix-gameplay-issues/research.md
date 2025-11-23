# Research: Gameplay Bug Fixes Implementation

**Feature**: 002-fix-gameplay-issues  
**Date**: November 23, 2025  
**Purpose**: Research technical approaches for tower placement interaction, coin economy fixes, and centralized speed configuration

---

## 1. Phaser Input System for Grid Interaction

### Current Implementation Analysis

From `src/game/scenes/TowerPlacement.ts` (lines 50-100):
- Grid already created with visual cells via `Grid.createVisuals()`
- Existing placement logic uses direct button click → immediate spawn
- Grid coordinate utilities exist in `levelLayout.ts`: `screenToGrid()`, `gridToScreen()`

### Phaser 3 Input Best Practices

**Pointer Event Pattern**:
```typescript
// Add interactive zone over grid area
const gridZone = this.add.zone(gridX, gridY, gridWidth, gridHeight);
gridZone.setInteractive();

gridZone.on('pointermove', (pointer) => {
    const gridPos = screenToGrid(pointer.x, pointer.y);
    if (gridPos && placementMode) {
        this.highlightCell(gridPos);
    }
});

gridZone.on('pointerdown', (pointer) => {
    const gridPos = screenToGrid(pointer.x, pointer.y);
    if (gridPos && placementMode) {
        this.attemptPlacement(gridPos);
    }
});
```

**Decision**: Use Phaser's interactive zones over the entire grid area rather than making each cell individually interactive. This reduces event listener overhead (1 zone vs. 150 cells).

**Hover Effect Implementation**:
- Create single `highlightGraphic: Phaser.GameObjects.Rectangle` reused for hover feedback
- Update position via `setPosition()` on pointer move
- Color coding: green tint for valid cells, red tint for invalid
- Existing grid already has `GridCell` entity with `isOccupied` and `isOnPath` validation

---

## 2. Placement State Machine Pattern

### State Design

**States**:
- `IDLE`: Normal game state, buy button shows cost, grid not interactive
- `PLACEMENT_ACTIVE`: Player selecting tower location, grid interactive, highlight visible
- `PLACEMENT_CANCELLED`: Transition state when ESC pressed or cancel button clicked

**State Transitions**:
```
IDLE --[click "Køb Tårn" with sufficient coins]--> PLACEMENT_ACTIVE
PLACEMENT_ACTIVE --[click valid cell]--> IDLE (tower placed, coins deducted)
PLACEMENT_ACTIVE --[click invalid cell]--> PLACEMENT_ACTIVE (feedback shown, stay in mode)
PLACEMENT_ACTIVE --[ESC key or cancel button]--> IDLE (no coins deducted)
PLACEMENT_ACTIVE --[wave starts]--> IDLE (auto-cancel, safety measure)
```

**Implementation Approach**:
```typescript
private placementState: 'idle' | 'active' | 'cancelled' = 'idle';

enterPlacementMode(towerType: TowerType): void {
    const cost = getTowerCost(towerType);
    if (this.session.coins < cost) {
        this.showFeedback(DanishText.insufficientFunds);
        return;
    }
    
    this.placementState = 'active';
    this.selectedTowerType = towerType;
    this.enableGridInteraction();
    this.showFeedback(DanishText.selectPlacement);
}

exitPlacementMode(cancelled: boolean): void {
    this.placementState = 'idle';
    this.selectedTowerType = null;
    this.disableGridInteraction();
    this.clearHighlight();
    if (!cancelled) {
        this.updateUI(); // Refresh coin display
    }
}
```

**Decision**: Use simple string literal union type for state management (sufficient for 3 states). More complex state machines would benefit from a library, but this adds unnecessary dependencies for our use case.

---

## 3. Centralized Configuration Architecture

### Current Configuration Structure

Existing configs:
- `src/game/data/towerConfig.ts`: Tower stats (damage, range, fire rate)
- `src/game/data/waveConfig.ts`: Wave progression (zombie count, health, speed)
- `src/game/data/levelLayout.ts`: Grid constants (GRID_ROWS, CELL_SIZE, PATH)

### Proposed `gameplayConfig.ts`

**Design**:
```typescript
// src/game/data/gameplayConfig.ts

export interface GameplayConfig {
    speedMultiplier: number;
    zombieSpeedMultiplier: number;
    towerFireRateMultiplier: number;
}

export const GAMEPLAY_CONFIG: GameplayConfig = {
    // Master speed control (1.0 = normal, 1.5 = 50% faster)
    speedMultiplier: 1.5,
    
    // Individual multipliers (can differ if needed in future)
    zombieSpeedMultiplier: 1.5,
    towerFireRateMultiplier: 1.5,
};

// Helper functions for consistent application
export function getAdjustedSpeed(baseSpeed: number): number {
    return baseSpeed * GAMEPLAY_CONFIG.zombieSpeedMultiplier;
}

export function getAdjustedFireRate(baseFireRate: number): number {
    return baseFireRate * GAMEPLAY_CONFIG.towerFireRateMultiplier;
}
```

**Usage in Zombie.ts**:
```typescript
import { getAdjustedSpeed } from '../data/gameplayConfig';

// In update() method:
const adjustedSpeed = getAdjustedSpeed(this.speed);
this.position.x += deltaX * adjustedSpeed * deltaTime;
```

**Usage in Tower.ts**:
```typescript
import { getAdjustedFireRate } from '../data/gameplayConfig';

// In constructor or fire logic:
this.fireRate = getAdjustedFireRate(baseFireRate);
this.fireTimer = this.scene.time.addEvent({
    delay: 1000 / this.fireRate,
    callback: () => this.fire(),
    loop: true
});
```

**Decision**: Create new `gameplayConfig.ts` following existing config file patterns. Separate multipliers for different game elements provides future flexibility (e.g., slow zombies but fast towers). Helper functions ensure consistent application.

---

## 4. Coin Economy Flow Analysis

### Current Implementation

**Coin Award Points** (traced through codebase):

1. **MathChallenge scene** (lines 180-200):
   ```typescript
   private checkAnswer(selectedAnswer: number): void {
       if (this.currentProblem?.checkAnswer(selectedAnswer)) {
           const reward = this.currentProblem.coinReward;
           this.session.addCoins(reward); // ✅ KEEP THIS
           this.showFeedback(`Korrekt! +${reward} mønter`, true);
       } else {
           this.showFeedback('Forkert svar, prøv igen', false);
       }
   }
   ```

2. **DefenseWave scene** (suspected, needs verification):
   - Check for wave completion coin awards → REMOVE IF EXISTS

3. **GameSession.addCoins()** (system-level):
   - Central coin management via singleton
   - Persists to localStorage
   - Triggers UI updates

### Changes Required

**Remove**: Any coin awards in DefenseWave scene on wave completion
**Keep**: Coin awards in MathChallenge for correct answers only
**Verify**: No other coin award locations exist (search for `addCoins()` calls)

**Search Results**:
```bash
# Find all coin award locations
grep -r "addCoins" src/game/scenes/
# Expected: MathChallenge.ts (correct answer) ✅
# Check: DefenseWave.ts (wave completion) ❌ REMOVE IF FOUND
```

**Decision**: Perform comprehensive search for all `addCoins()` calls. Remove any not tied to correct math answers. Update DefenseWave transition to MathChallenge without coin awards for wave completion.

---

## 5. Game Speed Implementation Strategy

### Frame-Independent Timing Analysis

**Current Zombie Movement** (from Zombie.ts):
```typescript
update(deltaTime: number): void {
    // deltaTime in seconds (e.g., 0.016 for 60fps)
    const pixelsToMove = this.speed * deltaTime;
    // Move along path...
}
```

**Current Tower Firing** (from Tower.ts):
```typescript
// Uses Phaser TimerEvent
this.fireTimer = scene.time.addEvent({
    delay: 1000, // milliseconds between shots
    callback: () => this.fire(),
    loop: true
});
```

### Speed Multiplier Application

**Approach 1: Multiply Speed Values** (✅ RECOMMENDED)
```typescript
// Zombie
const adjustedSpeed = this.speed * GAMEPLAY_CONFIG.speedMultiplier;
const pixelsToMove = adjustedSpeed * deltaTime;

// Tower
const adjustedDelay = 1000 / (this.fireRate * GAMEPLAY_CONFIG.speedMultiplier);
this.fireTimer = scene.time.addEvent({ delay: adjustedDelay, ... });
```

**Approach 2: Divide Time Intervals**
```typescript
// More complex, harder to reason about
const adjustedDeltaTime = deltaTime * GAMEPLAY_CONFIG.speedMultiplier;
```

**Decision**: Multiply speed values, not time intervals. This is more intuitive (1.5x speed = move 1.5x faster) and aligns with how the codebase already handles speed. For towers, convert fire rate to delay: `delay = 1000 / (fireRate * multiplier)`.

### Testing Strategy

**Timing Verification**:
1. Record wave duration before changes (manual stopwatch test)
2. Apply 1.5x multiplier
3. Verify wave completes in ~67% of original time (1/1.5 ≈ 0.67)
4. Automated Playwright test: inject timing probes, measure frame counts

**Visual Verification**:
- Zombies should visibly move faster across grid
- Tower projectiles should fire more frequently
- Game feel should be noticeably snappier

**Edge Case Testing**:
- Multiplier = 0.5 (half speed, slow motion)
- Multiplier = 3.0 (very fast, chaos mode)
- Verify no collision detection issues at high speeds

---

## Implementation Recommendations

### Priority Order (Aligns with Spec P1/P2/P3)

1. **P1: Tower Placement** (Most Complex)
   - Add placement state machine to TowerPlacement scene
   - Implement grid interaction with hover feedback
   - Add ESC key listener for cancellation
   - Update buy button to enter placement mode instead of immediate spawn

2. **P2: Coin Economy** (Simplest)
   - Search and remove wave completion coin awards
   - Verify only MathChallenge correct answers award coins
   - Update any UI text related to coin earning

3. **P3: Game Speed** (Medium Complexity)
   - Create `gameplayConfig.ts` with speed multipliers
   - Update Zombie.update() to use adjusted speed
   - Update Tower firing delays to use adjusted fire rate
   - Add config constants to import paths

### Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Grid interaction feels laggy | Use `pointermove` throttling (max 60fps update) |
| Accidental placements | Require explicit click confirmation, not just hover |
| Speed breaks collision detection | Test at multiple multipliers, add bounds checking |
| Coin awards missed during search | Comprehensive grep + manual code review |

### Alternative Approaches Considered

**Tower Placement Alternatives**:
- ❌ Make each grid cell a button: 150 buttons = performance overhead
- ❌ Drag-and-drop from button: More complex UX, harder to cancel
- ✅ Click button → click grid cell: Simple, familiar tower defense pattern

**Speed Config Alternatives**:
- ❌ Individual constants in each file: Hard to tune, scattered config
- ❌ Global game time scale: Affects animations/UI, too broad
- ✅ Centralized config with per-system multipliers: Flexible, maintainable

---

## Conclusion

All three bug fixes are technically feasible with existing Phaser 3 patterns:

- **Tower Placement**: Standard input event handling with state machine
- **Coin Economy**: Simple code removal, no architectural changes
- **Game Speed**: Centralized config following existing data file patterns

**No blockers identified**. Proceed to Phase 1 design with confidence.

**Estimated Complexity**: Low-Medium
- Placement: Medium (state management + input handling)
- Coin Economy: Low (find + remove)
- Speed: Low-Medium (config creation + entity updates)

**Test Coverage Required**: High priority for placement flow (most complex)
