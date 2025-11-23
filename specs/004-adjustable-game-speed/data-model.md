# Data Model: Adjustable Game Speed Controls

**Feature**: 004-adjustable-game-speed  
**Date**: 2025-11-23

## Entity Definitions

### SpeedControl (UI Component)

**Purpose**: Manages the speed adjustment buttons and visual display of current game speed

**Properties**:
- `currentSpeed: number` - Current speed multiplier (0.5 to 2.0)
- `minSpeed: number = 0.5` - Minimum allowed speed
- `maxSpeed: number = 2.0` - Maximum allowed speed
- `speedStep: number = 0.5` - Increment/decrement step size
- `lastClickTime: number = 0` - Timestamp of last button press (for debouncing)
- `debounceDelay: number = 100` - Minimum milliseconds between clicks

**Methods**:
- `constructor(scene: Phaser.Scene)` - Initialize buttons and display in UI
- `increaseSpeed(): void` - Increment speed by speedStep, enforcing maxSpeed boundary
- `decreaseSpeed(): void` - Decrement speed by speedStep, enforcing minSpeed boundary
- `setSpeed(multiplier: number): void` - Set speed to specific value with boundary enforcement
- `updateDisplay(speed: number): void` - Update text display showing current speed
- `canClick(): boolean` - Check debounce to prevent rapid clicks
- `destroy(): void` - Clean up UI elements

**State Transitions**:
```
Initial: 1.0x
  ↓
Player clicks (+) → 1.5x → 2.0x (max, button disabled)
Player clicks (-) → 0.5x (min, button disabled) → 1.5x → 1.0x
Wave ends → Reset to 1.0x
```

---

### GameSession Speed State

**Purpose**: Centralized speed management synchronized with UI

**Properties** (added to GameSession):
- `gameSpeed: number = 1.0` - Current game speed multiplier

**Methods** (added to GameSession):
- `setGameSpeed(multiplier: number): void`
  - Enforces 0.5 ≤ multiplier ≤ 2.0
  - Updates scene's `time.timeScale` if available
  - Emits speed change event
  - Returns early if multiplier equals current speed
  
- `getGameSpeed(): number`
  - Returns current speed multiplier
  
- `resetGameSpeed(): void`
  - Sets speed back to 1.0
  - Updates scene's timeScale

**Triggers**:
- Speed change from SpeedControl button press
- Wave completion (automatic reset)
- Scene transition (automatic reset)

---

## Data Flow

```
User clicks + button
    ↓
SpeedControl.increaseSpeed()
    ↓
Debounce check passes?
    ├─ No: Ignore
    └─ Yes: Calculate new speed
    ↓
GameSession.setGameSpeed(newSpeed)
    ↓
Enforce boundaries (0.5 ≤ x ≤ 2.0)
    ↓
Update scene.time.timeScale = newSpeed
    ↓
SpeedControl.updateDisplay(newSpeed)
    ↓
All game objects affected via timeScale
```

---

## Related Entities

### DefenseWave Scene
- **Modified Behavior**: Apply speed changes to `time.timeScale`
- **Integration Point**: SpeedControl initialization in `create()`
- **State Management**: Reset speed on wave completion/game over

### WaveManager
- **Current Behavior**: Uses Phaser timers (automatically scaled by timeScale)
- **No Changes Required**: Inherits speed automatically

### BasicTower, Zombie
- **Current Behavior**: Physics bodies automatically scaled by timeScale
- **No Changes Required**: Inherits speed automatically

### Phaser TimeScale
- **Mechanism**: `scene.time.timeScale` affects all timers, tweens, and physics
- **Applied Automatically**: All Phaser entities respect timeScale without modification
- **Range**: 0 to any positive number (we limit to 0.5-2.0 for gameplay)

---

## Type Definitions (TypeScript)

```typescript
// In src/game/types/GameTypes.ts

interface SpeedControlConfig {
  minSpeed: number;      // 0.5
  maxSpeed: number;      // 2.0
  speedStep: number;     // 0.5
  debounceDelay: number; // 100 (ms)
  buttonRadius: number;  // 40 (px, for hit area)
}

// Add to GameSession interface
interface GameSessionState {
  gameSpeed: number; // Current speed multiplier
}
```

---

## State Validation Rules

1. **Speed Boundaries**: Always 0.5 ≤ gameSpeed ≤ 2.0
2. **Step Increments**: Speed changes only via ±0.5 increments
3. **Debouncing**: Minimum 100ms between button presses
4. **Reset Timing**: Speed reset at wave end, NOT mid-wave
5. **TimeScale Sync**: GameSession.gameSpeed always matches scene.time.timeScale

---

## Edge Cases

| Case | Behavior | Validation |
|------|----------|-----------|
| Rapid button mashing | Debounce ignores rapid presses | Only one press per 100ms processed |
| Speed at boundary (2.0x) | + button ignored | currentSpeed remains 2.0x |
| Speed at boundary (0.5x) | - button ignored | currentSpeed remains 0.5x |
| Wave completes at 1.5x | Speed resets to 1.0x | onWaveComplete() calls resetGameSpeed() |
| Scene transitions | Speed resets to 1.0x | cleanup/shutdown resets speed |
| Enemy spawning at 0.5x | Spawn timing scaled down | WaveManager uses timers (already scaled) |
| Tower firing at 2.0x | Projectiles move faster | Physics bodies inherit timeScale |

---

## Persistence

**Speed is NOT persisted** between sessions:
- Speed resets to 1.0x when:
  - Wave completes
  - Wave fails (game over)
  - Scene changes
  - Player returns to menu

This is intentional to ensure consistent starting state for each wave.
