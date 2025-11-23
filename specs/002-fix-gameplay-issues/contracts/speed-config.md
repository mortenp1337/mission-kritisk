# Contract: Game Speed Configuration

**Feature**: 002-fix-gameplay-issues  
**Component**: gameplayConfig.ts + Zombie + Tower entities  
**Purpose**: Define centralized speed multiplier system for consistent game pacing

---

## Overview

The Game Speed Configuration provides a single source of truth for timing parameters affecting zombie movement and tower firing rates. All speed-related gameplay elements reference this configuration to ensure consistent pacing adjustments.

---

## API: gameplayConfig.ts

### Configuration Object: `GAMEPLAY_CONFIG`

**Type**: `GameplayConfig`

**Structure**:
```typescript
export interface GameplayConfig {
    speedMultiplier: number;
    zombieSpeedMultiplier: number;
    towerFireRateMultiplier: number;
}
```

**Default Values**:
```typescript
export const GAMEPLAY_CONFIG: GameplayConfig = {
    speedMultiplier: 1.5,           // Master multiplier (50% faster)
    zombieSpeedMultiplier: 1.5,     // Zombie-specific multiplier
    towerFireRateMultiplier: 1.5,   // Tower-specific multiplier
};
```

**Constraints**:
- All multipliers must be > 0
- Recommended range: 0.5 (half speed) to 3.0 (triple speed)
- Values outside [0.5, 3.0] may cause gameplay issues (not enforced, dev responsibility)

**Purpose**:
- `speedMultiplier`: Master control for overall game pace (currently unused, reserved for future)
- `zombieSpeedMultiplier`: Applied to all zombie movement speeds
- `towerFireRateMultiplier`: Applied to all tower firing rates

---

### Function: `getAdjustedSpeed(baseSpeed: number): number`

**Purpose**: Calculate zombie movement speed with multiplier applied

**Parameters**:
- `baseSpeed: number` - Base speed from wave configuration (pixels per second)

**Returns**:
- `number` - Adjusted speed = `baseSpeed * GAMEPLAY_CONFIG.zombieSpeedMultiplier`

**Example**:
```typescript
// Base zombie speed: 50 pixels/sec
// Multiplier: 1.5
const adjustedSpeed = getAdjustedSpeed(50); // Returns 75 pixels/sec
```

**Usage**:
```typescript
// In Zombie constructor
import { getAdjustedSpeed } from '../data/gameplayConfig';

this.speed = getAdjustedSpeed(stats.speed);

// In Zombie.update()
const pixelsToMove = this.speed * deltaTime;
this.position.x += pixelsToMove * direction.x;
```

---

### Function: `getAdjustedFireRate(baseFireRate: number): number`

**Purpose**: Calculate tower firing rate with multiplier applied

**Parameters**:
- `baseFireRate: number` - Base fire rate from tower configuration (shots per second)

**Returns**:
- `number` - Adjusted fire rate = `baseFireRate * GAMEPLAY_CONFIG.towerFireRateMultiplier`

**Example**:
```typescript
// Base tower fire rate: 1 shot/sec
// Multiplier: 1.5
const adjustedFireRate = getAdjustedFireRate(1.0); // Returns 1.5 shots/sec
```

**Usage**:
```typescript
// In Tower constructor
import { getAdjustedFireRate } from '../data/gameplayConfig';

const adjustedFireRate = getAdjustedFireRate(towerStats.fireRate);
const fireDelay = 1000 / adjustedFireRate; // Convert to milliseconds

this.fireTimer = scene.time.addEvent({
    delay: fireDelay,
    callback: () => this.fire(),
    loop: true
});
```

---

## Integration: Zombie Entity

### Modified: `Zombie.constructor()`

**Before**:
```typescript
constructor(stats: ZombieStats, path: GridPosition[], spawnPos: ScreenPosition, scene: Phaser.Scene) {
    this.speed = stats.speed; // Direct assignment
    // ...
}
```

**After**:
```typescript
import { getAdjustedSpeed } from '../data/gameplayConfig';

constructor(stats: ZombieStats, path: GridPosition[], spawnPos: ScreenPosition, scene: Phaser.Scene) {
    this.speed = getAdjustedSpeed(stats.speed); // Apply multiplier
    // ...
}
```

**Impact**:
- All zombies created with speed multiplier pre-applied
- `update()` method unchanged (uses `this.speed` directly)
- No per-frame multiplier calculations (performance-efficient)

---

### Unchanged: `Zombie.update(deltaTime: number)`

**Current Implementation** (no changes needed):
```typescript
update(deltaTime: number): void {
    // this.speed already has multiplier applied
    const pixelsToMove = this.speed * deltaTime;
    
    // Move along path using adjusted speed
    // ... path following logic ...
}
```

**Why No Changes**: Speed multiplier applied once in constructor, not in update loop. This is more efficient and maintains frame-independence.

---

## Integration: Tower Entity

### Modified: Tower Constructor / Initialization

**Before**:
```typescript
protected createFireTimer(fireRate: number): void {
    this.fireTimer = this.scene.time.addEvent({
        delay: 1000 / fireRate, // Direct conversion
        callback: () => this.fire(),
        loop: true
    });
}
```

**After**:
```typescript
import { getAdjustedFireRate } from '../data/gameplayConfig';

protected createFireTimer(baseFireRate: number): void {
    const adjustedFireRate = getAdjustedFireRate(baseFireRate);
    this.fireTimer = this.scene.time.addEvent({
        delay: 1000 / adjustedFireRate, // Adjusted conversion
        callback: () => this.fire(),
        loop: true
    });
}
```

**Impact**:
- Fire rate calculated once per tower with multiplier
- Phaser TimerEvent manages timing automatically
- No per-frame calculations needed

---

### Modified: BasicTower (Extends Tower)

**Before**:
```typescript
constructor(gridPos: GridPosition, scene: Phaser.Scene) {
    super(gridPos, scene);
    const stats = getTowerStats('basic');
    this.createFireTimer(stats.fireRate);
}
```

**After**:
```typescript
constructor(gridPos: GridPosition, scene: Phaser.Scene) {
    super(gridPos, scene);
    const stats = getTowerStats('basic');
    this.createFireTimer(stats.fireRate); // Multiplier applied in parent method
}
```

**Impact**: No changes to BasicTower, multiplier applied transparently by parent Tower class

---

## Timing Calculations

### Zombie Movement

**Formula**:
```
Adjusted Speed (pixels/sec) = Base Speed × zombieSpeedMultiplier
Distance Per Frame = Adjusted Speed × deltaTime
```

**Example** (Base Speed: 50 px/sec, Multiplier: 1.5, Frame: 60fps):
```
Adjusted Speed = 50 × 1.5 = 75 px/sec
Distance = 75 × 0.0167 = 1.25 pixels per frame
```

**Result**: Zombie moves 50% faster (1.25px vs 0.83px per frame at 60fps)

---

### Tower Firing

**Formula**:
```
Adjusted Fire Rate (shots/sec) = Base Fire Rate × towerFireRateMultiplier
Fire Delay (ms) = 1000 / Adjusted Fire Rate
```

**Example** (Base Rate: 1 shot/sec, Multiplier: 1.5):
```
Adjusted Fire Rate = 1 × 1.5 = 1.5 shots/sec
Fire Delay = 1000 / 1.5 = 667ms between shots
```

**Result**: Tower fires every 667ms instead of 1000ms (50% faster)

---

## Configuration Tuning Guide

### Adjusting Overall Game Speed

**To increase all speeds by X%**:
```typescript
export const GAMEPLAY_CONFIG = {
    speedMultiplier: 1 + (X / 100),      // e.g., 50% faster = 1.5
    zombieSpeedMultiplier: 1 + (X / 100),
    towerFireRateMultiplier: 1 + (X / 100),
};
```

**Common Presets**:
```typescript
// Half speed (slow motion)
{ speedMultiplier: 0.5, zombieSpeedMultiplier: 0.5, towerFireRateMultiplier: 0.5 }

// Normal speed
{ speedMultiplier: 1.0, zombieSpeedMultiplier: 1.0, towerFireRateMultiplier: 1.0 }

// 50% faster (current default)
{ speedMultiplier: 1.5, zombieSpeedMultiplier: 1.5, towerFireRateMultiplier: 1.5 }

// Double speed
{ speedMultiplier: 2.0, zombieSpeedMultiplier: 2.0, towerFireRateMultiplier: 2.0 }
```

---

### Asymmetric Speed Adjustments

**Make zombies faster but towers slower** (increase difficulty):
```typescript
{
    speedMultiplier: 1.0,
    zombieSpeedMultiplier: 1.5,      // Zombies 50% faster
    towerFireRateMultiplier: 0.75,   // Towers 25% slower
}
```

**Make towers faster but zombies slower** (decrease difficulty):
```typescript
{
    speedMultiplier: 1.0,
    zombieSpeedMultiplier: 0.8,      // Zombies 20% slower
    towerFireRateMultiplier: 1.5,    // Towers 50% faster
}
```

---

## Testing Contract

### Speed Verification Tests

**Zombie Speed Test**:
```typescript
test('Zombies move at 1.5x speed', async () => {
    const baseSpeed = 50; // pixels/sec from waveConfig
    const expectedSpeed = 75; // 50 × 1.5
    
    const zombie = new Zombie(stats, path, spawnPos, scene);
    expect(zombie.speed).toBe(expectedSpeed);
    
    // Measure actual movement over 1 second
    const startPos = zombie.position.x;
    await waitFor(1000);
    const endPos = zombie.position.x;
    
    expect(endPos - startPos).toBeCloseTo(expectedSpeed, 5);
});
```

**Tower Fire Rate Test**:
```typescript
test('Towers fire at 1.5x rate', async () => {
    const baseRate = 1.0; // shots/sec from towerConfig
    const expectedDelay = 667; // 1000 / 1.5
    
    const tower = new BasicTower(gridPos, scene);
    expect(tower.fireTimer.delay).toBeCloseTo(expectedDelay, 0);
    
    // Count shots over 3 seconds
    let shotCount = 0;
    tower.on('fire', () => shotCount++);
    
    await waitFor(3000);
    expect(shotCount).toBeCloseTo(4.5, 0.5); // 1.5 shots/sec × 3 sec
});
```

**Wave Duration Test**:
```typescript
test('Wave completes in ~67% of original time', async () => {
    // Original wave time measured at 1.0x speed
    const originalDuration = 60000; // 60 seconds
    const expectedDuration = originalDuration / 1.5; // 40 seconds
    
    const startTime = Date.now();
    await playWaveToCompletion();
    const actualDuration = Date.now() - startTime;
    
    expect(actualDuration).toBeCloseTo(expectedDuration, 2000); // ±2 sec tolerance
});
```

---

## Error Handling

**Invalid Multiplier Values**:
```typescript
// gameplayConfig.ts (optional runtime validation)
export function setSpeedMultiplier(value: number): void {
    if (value <= 0) {
        console.error('Speed multiplier must be > 0, got:', value);
        return;
    }
    if (value < 0.5 || value > 3.0) {
        console.warn('Speed multiplier outside recommended range [0.5, 3.0]:', value);
    }
    GAMEPLAY_CONFIG.speedMultiplier = value;
    // Trigger entity updates if needed
}
```

**Note**: Runtime modification not in MVP scope, but structure supports it for future features (e.g., in-game speed control).

---

## Side Effects

**Gameplay Impact**:
- Wave duration reduced by ~33% (1/1.5 ≈ 0.67)
- Player reaction time requirements increased (less time per zombie)
- Tower placement decisions become more time-pressured
- Overall game pacing feels snappier and more engaging

**No Impact On**:
- Scene transitions
- UI animations (buttons, text)
- Math problem timer (separate system)
- Asset loading (separate system)
- Frame rate (speed independent of FPS)

---

## Future Extensions

**Possible Enhancements** (not in MVP):
- Runtime speed adjustment via settings menu
- Per-wave speed scaling (waves get progressively faster)
- Speed powerups (temporary slow-motion or fast-forward)
- Difficulty presets (easy = 0.8x, normal = 1.0x, hard = 1.5x)
- Animation speed scaling (currently only affects game logic)

**Implementation Ready**: Current design supports these extensions without refactoring core systems.
