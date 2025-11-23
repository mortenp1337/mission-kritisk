# Research: Adjustable Game Speed Implementation

**Feature**: 004-adjustable-game-speed  
**Date**: 2025-11-23

## Phaser 3 TimeScale Mechanism

### Overview

Phaser 3 provides a built-in `time.timeScale` property that globally affects all physics, animations, tweens, and timers within a scene. This is the ideal mechanism for implementing game speed adjustment.

**Key Property**: `scene.time.timeScale`
- **Range**: 0 to any positive number
- **Default**: 1.0 (normal speed)
- **Effect**: Multiplies delta time by timeScale for all time-dependent calculations

### How It Works

Every Phaser scene has a `time` object with a `timeScale` property:

```typescript
// Speed up game to 2x
this.time.timeScale = 2.0;

// Slow down to 0.5x
this.time.timeScale = 0.5;

// Return to normal
this.time.timeScale = 1.0;
```

### What Gets Scaled Automatically

✅ **Automatically scaled**:
- Physics bodies (Arcade physics velocity, acceleration)
- Tweens
- Timers (delayedCall, wait, repeat)
- Animations
- Delta time in update() method
- Enemy movement
- Tower projectiles
- Particle effects

✅ **NOT scaled**:
- UI text updates (not time-dependent)
- User input handling
- Scene lifecycle events
- Camera movement (not time-dependent)

### Implementation for This Feature

```typescript
// In DefenseWave scene:
this.time.timeScale = gameSpeed; // e.g., 1.5

// All entities automatically respect this:
// - Zombies move 1.5x faster
// - Wave spawn timers trigger 1.5x faster
// - Tower projectiles travel 1.5x faster
// - Animations play 1.5x faster
```

**Benefit**: No modifications needed to existing entity code (Zombie, BasicTower, WaveManager).

---

## Current Game Architecture Analysis

### DefenseWave Scene

**File**: `src/game/scenes/DefenseWave.ts`

Current structure:
- `create()`: Initializes grid, base, towers, waveManager, UI
- `update()`: Calls waveManager.update(), tower.update(), handles base damage
- `onWaveComplete()`: Checks victory/defeat conditions
- UI elements: waveText, coinText, baseHealthText

**Integration Point**: Add SpeedControl initialization in `create()`

### GameSession Singleton

**File**: `src/game/systems/GameSession.ts`

Current state management:
- `currentWave: number`
- `baseHealth: number`
- `coins: number`
- `placedTowers: TowerData[]`

**Enhancement**: Add `gameSpeed: number` property

### WaveManager

**File**: `src/game/systems/WaveManager.ts`

Current implementation:
- Uses Phaser timers for enemy spawning
- Manages active zombies
- Handles wave progression

**Key**: Already uses `scene.time` methods, so inherits timeScale automatically

### Entities (Zombie, BasicTower)

**Files**: 
- `src/game/entities/enemies/Zombie.ts`
- `src/game/entities/towers/BasicTower.ts`

Current implementation:
- Use Phaser physics bodies
- Update methods receive time/delta parameters
- No explicit time calculations

**Key**: Already use Phaser physics, so inherit timeScale automatically

---

## UI Layout Analysis

### Current UI Elements (DefenseWave)

Screen Resolution: 1024 × 768

**Top UI**:
- Coins display: x=50, y=30 (left)
- Wave counter: x=512, y=30 (center)
- Base health: x=950, y=30 (right)
- Font: Arial Black, 24px, yellow with black stroke

**Game Grid**:
- 8 columns × 5 rows
- Cell size: 87.5 × 107 pixels (estimated)
- Grid position: Centered, occupies approximately:
  - x: 150-850 (700px wide)
  - y: 100-650 (550px tall)

**Available Space for Speed Controls**:

1. **Bottom-right corner** (RECOMMENDED):
   - x: 850-1024 (174px available)
   - y: 650-768 (118px available)
   - Space for 3 small buttons + text
   - Does NOT overlap grid or existing UI

2. Bottom-left corner:
   - Would overlap coins display area
   - NOT recommended

3. Top-right corner:
   - Only 24px available (height of wave counter)
   - NOT enough for buttons
   - NOT recommended

### Proposed SpeedControl Position

**Buttons Layout**:
```
x positions: 880 (−), 950 (display), 1020 (+)
y position: 700

Button size: 40 × 40 pixels
Font: Arial Black, 24px
Color: Yellow (#FFFF00)
Stroke: Black, 2px
```

**Validation**:
- Leftmost button: x=880 - 20 = 860 (>850 ✓ safe margin)
- Rightmost button: x=1020 + 20 = 1040 (but clamped to 1024 boundary)
- Top: y=700 - 20 = 680 (>650 ✓ below grid)
- Bottom: y=700 + 20 = 720 (fits comfortably)

**Adjustment**: x positions adjusted to fit within 1024px width:
- Decrease: x=860
- Display: x=925
- Increase: x=990

---

## Performance Considerations

### TimeScale Impact

**CPU Impact**: Minimal
- TimeScale is a simple multiplication factor
- Phaser handles optimization internally
- No additional processing required

**Memory Impact**: None
- No new allocations
- Reuses existing time.timeScale property

**Frame Rate**: Should remain 60 FPS
- Physics calculations still O(n) for entities
- Just faster time progression
- No additional entities created

### Testing Performance

```typescript
// Monitor FPS during speed adjustment
console.log(`FPS: ${game.loop.actualFps}`);

// At 0.5x speed: Should still be 60 FPS (half-speed animation)
// At 1.0x speed: Should be 60 FPS (normal)
// At 2.0x speed: Should be 60 FPS (double-speed animation)
```

---

## Boundary Enforcement Strategy

### Why 0.5x to 2.0x?

**Minimum (0.5x)**:
- Slower than 0.5x becomes unplayable (too much waiting)
- At 0.5x, players can observe and plan strategy

**Maximum (2.0x)**:
- Faster than 2.0x risks player missing visual feedback
- At 2.0x, difficulty increases as reaction time decreases
- Balanced against player skill levels

### Implementation

```typescript
// In SpeedControl and GameSession:
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;
const SPEED_STEP = 0.5; // 1.0 → 1.5 → 2.0 or 1.0 → 0.5

// Clamp:
speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
```

---

## Debouncing Strategy

### Problem
Rapid button clicks could cause:
- Multiple speed updates per frame
- Confusing UI state
- Unintended speed changes

### Solution: Time-Based Debounce

```typescript
lastClickTime: number = 0;
DEBOUNCE_DELAY: number = 100; // milliseconds

canClick(): boolean {
  const now = Date.now();
  return (now - this.lastClickTime) >= this.DEBOUNCE_DELAY;
}

onButtonClick() {
  if (!this.canClick()) return;
  this.lastClickTime = Date.now();
  this.increaseSpeed();
}
```

**Effect**: Maximum 10 speed changes per second (1000ms / 100ms)

---

## Wave Timing at Different Speeds

### Current Wave Structure

**Example**: Spawn 10 zombies over 5 seconds at 1x speed

```typescript
// In WaveManager:
const spawnInterval = 500; // ms between spawns
const totalWaveTime = 5000; // ms total

// With timeScale = 0.5:
// Spawn interval becomes 1000ms (half speed)
// Total wave time becomes 10000ms (double duration)

// With timeScale = 2.0:
// Spawn interval becomes 250ms (double speed)
// Total wave time becomes 2500ms (half duration)
```

### Behavior Validation

**Expected**: Wave duration scales proportionally
- At 0.5x: Wave takes 2x longer
- At 1.0x: Wave takes normal time
- At 2.0x: Wave takes half as long

**Verified**: WaveManager uses Phaser timers → automatically scaled

---

## Type Safety

### TypeScript Interfaces

**GameTypes.ts additions**:

```typescript
interface SpeedControlConfig {
  minSpeed: number;      // 0.5
  maxSpeed: number;      // 2.0
  speedStep: number;     // 0.5
  debounceDelay: number; // 100
  buttonRadius: number;  // 40
}

interface GameSpeed {
  current: number;       // 0.5-2.0
  min: number;           // 0.5
  max: number;           // 2.0
}
```

---

## Testing Strategy

### Unit Tests (GameSession)

```typescript
// Test speed boundaries
expect(GameSession.setGameSpeed(0.3)).toBe(0.5); // Clamped
expect(GameSession.setGameSpeed(2.5)).toBe(2.0); // Clamped
expect(GameSession.getGameSpeed()).toBe(2.0);
```

### Integration Tests (DefenseWave)

```typescript
// Test speed control in scene
expect(speedControl.currentSpeed).toBe(1.0); // Initial
speedControl.increaseSpeed();
expect(speedControl.currentSpeed).toBe(1.5);
```

### End-to-End Tests (Playwright)

```typescript
// Test visual behavior
await page.click('[data-testid="speed-increase"]');
const speed = await page.textContent('[data-testid="speed-display"]');
expect(speed).toContain('1.5');
```

---

## Edge Cases & Mitigation

| Edge Case | Mitigation |
|-----------|-----------|
| Speed change during enemy spawn | Phaser handles automatically; spawn timing scales |
| Speed at boundary (repeated clicks) | Button disabled or ignored via debounce |
| Scene transition at non-1x speed | Explicit reset in onWaveComplete() / shutdown |
| Rapid speed changes | Debounce at 100ms prevents UI jitter |
| Physics clipping at high speed | Test thoroughly; use small spawn rates if needed |

---

## References

- [Phaser 3 Documentation - Time Scale](https://newdocs.phaser.io/docs/3.90.0/Phaser.Time.Clock#timeScale)
- [Phaser 3 Physics - Velocity scaling](https://newdocs.phaser.io/docs/3.90.0/Phaser.Physics.Arcade)
- Current codebase: `src/game/scenes/DefenseWave.ts`, `src/game/systems/GameSession.ts`
