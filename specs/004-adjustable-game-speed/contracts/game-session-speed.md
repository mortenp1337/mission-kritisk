# Implementation Contract: GameSession Speed Management

**Feature**: 004-adjustable-game-speed  
**Component**: GameSession Speed State System  
**Date**: 2025-11-23

## Component Overview

GameSession is the centralized game state manager. This contract extends it with speed management capabilities, allowing DefenseWave and SpeedControl to coordinate speed changes and maintain consistent state.

## Interface Contract

### New Property: gameSpeed

```typescript
gameSpeed: number = 1.0
```

**Type**: `number`  
**Initial Value**: `1.0`  
**Valid Range**: `0.5` to `2.0`  
**Scope**: Instance property (singleton GameSession)  
**Persistence**: Not persisted between scenes/waves (reset on transition)

---

## New Methods

### setGameSpeed(multiplier: number): void

**Purpose**: Update the global game speed with boundary enforcement

**Signature**:
```typescript
setGameSpeed(multiplier: number): void
```

**Parameters**:
- `multiplier: number` - Desired speed multiplier (will be clamped to 0.5-2.0)

**Implementation Requirements**:

1. **Validation**:
   - If multiplier is NaN or undefined, log error and return
   - Clamp multiplier: `multiplier = Math.max(0.5, Math.min(2.0, multiplier))`

2. **No-Op Check**:
   - If `multiplier === this.gameSpeed`, return (avoid redundant updates)

3. **Update State**:
   - `this.gameSpeed = multiplier`

4. **Notify Active Scene** (if running):
   - Get active scene: `scene = this.scene?.isActive() ? this.scene : null`
   - If scene exists: `scene.time.timeScale = multiplier`
   - This ensures immediate visual effect

5. **Logging** (development):
   - Log: `Speed changed: ${this.gameSpeed}x`

**Side Effects**:
- Updates `this.gameSpeed` property
- Updates active scene's `time.timeScale` (if scene is running)
- All Phaser entities in that scene now move/animate at new speed

**Example Usage**:
```typescript
GameSession.getInstance().setGameSpeed(1.5); // Speed up to 1.5x
```

---

### getGameSpeed(): number

**Purpose**: Retrieve current game speed without modification

**Signature**:
```typescript
getGameSpeed(): number
```

**Returns**: Current `gameSpeed` multiplier (0.5-2.0)

**Implementation**: 
```typescript
return this.gameSpeed;
```

**Side Effects**: None

---

### resetGameSpeed(): void

**Purpose**: Reset game speed to normal (1.0x) state

**Signature**:
```typescript
resetGameSpeed(): void
```

**Implementation Requirements**:

1. Call `setGameSpeed(1.0)` to handle all state updates centrally
2. Ensure scene timeScale is set to 1.0
3. Log: "Game speed reset to 1.0x"

**Usage**: Called when:
- Wave completes
- Player loses (game over)
- Scene transitions
- Menu returns

**Example**:
```typescript
// In DefenseWave.onWaveComplete():
GameSession.getInstance().resetGameSpeed();
```

---

## Integration Points

### DefenseWave Scene

**In `create()` method**:
```typescript
// After initializing SpeedControl:
const speedControl = new SpeedControl(this, (speed: number) => {
  GameSession.getInstance().setGameSpeed(speed);
});
```

**In `onWaveComplete()` method**:
```typescript
// Before scene transition:
GameSession.getInstance().resetGameSpeed();
this.scene.start('TowerPlacement'); // or next scene
```

**In `onGameOver()` method**:
```typescript
// Before scene transition:
GameSession.getInstance().resetGameSpeed();
this.scene.start('GameOver', { victory: false });
```

**In scene `shutdown` event** (safety measure):
```typescript
// Ensure cleanup even if methods not called explicitly:
this.events.on('shutdown', () => {
  GameSession.getInstance().resetGameSpeed();
});
```

---

### WaveManager

**No changes required**. WaveManager uses Phaser timers which automatically respect `scene.time.timeScale`.

- Wave spawn timers automatically scale
- Enemy movement updates automatically scale
- No modifications needed

---

### BasicTower, Zombie

**No changes required**. Physics bodies automatically respect `scene.time.timeScale`.

- Tower targeting automatically scales
- Projectile movement automatically scales
- No modifications needed

---

## State Diagram

```
START (GameSession created)
  ↓
gameSpeed = 1.0 (initial)
  ↓
DefenseWave scene starts
  ↓
SpeedControl UI initialized
  ↓
Player clicks + button
  ↓
SpeedControl.increaseSpeed() → GameSession.setGameSpeed(1.5)
  ↓
gameSpeed = 1.5, scene.time.timeScale = 1.5
  ↓ (all entities move at 1.5x)
Wave continues at increased speed
  ↓
Player clicks + button again
  ↓
SpeedControl.increaseSpeed() → GameSession.setGameSpeed(2.0)
  ↓
gameSpeed = 2.0, scene.time.timeScale = 2.0
  ↓ (max reached)
Wave continues at maximum speed
  ↓
Wave completes
  ↓
DefenseWave.onWaveComplete() → GameSession.resetGameSpeed()
  ↓
gameSpeed = 1.0, scene.time.timeScale = 1.0
  ↓
Next wave starts at normal speed
```

---

## Data Consistency Rules

1. **gameSpeed ∈ [0.5, 2.0]**: Always enforce boundaries on write
2. **Sync with timeScale**: `setGameSpeed()` always updates active scene's `time.timeScale`
3. **Reset on Transitions**: Any scene change calls `resetGameSpeed()`
4. **No Persistence**: Speed not saved to session/storage between waves
5. **Single Source of Truth**: Only GameSession.setGameSpeed() modifies gameSpeed

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| `setGameSpeed(undefined)` | Log error, no update |
| `setGameSpeed(NaN)` | Log error, no update |
| `setGameSpeed(-1)` | Clamp to 0.5 |
| `setGameSpeed(5)` | Clamp to 2.0 |
| `setGameSpeed(1.0)` when already 1.0 | Return early (no-op) |
| Active scene destroyed mid-wave | `scene.time.timeScale` setter fails silently; next scene resets speed |

---

## Testing Requirements

- [ ] Initial gameSpeed is 1.0
- [ ] setGameSpeed(1.5) updates gameSpeed and scene.timeScale
- [ ] setGameSpeed(2.5) clamps to 2.0
- [ ] setGameSpeed(-0.5) clamps to 0.5
- [ ] setGameSpeed(1.0) when already 1.0 is no-op
- [ ] getGameSpeed() returns current value
- [ ] resetGameSpeed() sets to 1.0
- [ ] Multiple calls to setGameSpeed() accumulate correctly
- [ ] Speed persists during DefenseWave (not auto-reset mid-wave)
- [ ] Speed resets on wave completion
- [ ] Speed resets on game over

---

## Performance Considerations

- setGameSpeed() is O(1) - simple property update
- No collection iteration required
- No object allocations
- Safe to call frequently (debounced at UI layer anyway)

---

## Future Extensions

Potential enhancements (not in scope for v1):
- Pause capability (speed = 0)
- Custom speed presets (remember user preferences)
- Network multiplayer sync (broadcast speed changes)
- Replay recording (capture speed timeline)
