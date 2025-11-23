# Quickstart Guide: Adjustable Game Speed Implementation

**Feature**: 004-adjustable-game-speed  
**Date**: 2025-11-23

## Quick Overview

This guide gets you up to speed on implementing the adjustable game speed feature. It covers what needs to be built, where files go, and the general implementation flow.

## What We're Building

Players need to adjust game speed during waves using +/- buttons positioned in the bottom-right corner, displaying the current speed multiplier, and respecting boundaries (0.5x to 2.0x).

## Key Components

### 1. SpeedControl.ts (NEW)
**Location**: `src/game/entities/SpeedControl.ts`

A UI component that:
- Renders +/- buttons at bottom-right corner
- Displays current speed (e.g., "1.5x")
- Handles button clicks with debouncing
- Invokes callback when speed changes

```typescript
// Rough structure:
class SpeedControl {
  currentSpeed: number = 1.0;
  decreaseButton: GameObjects.Text;
  displayText: GameObjects.Text;
  increaseButton: GameObjects.Text;
  
  increaseSpeed(): void { /* +0.5, max 2.0 */ }
  decreaseSpeed(): void { /* -0.5, min 0.5 */ }
  updateDisplay(speed: number): void { /* show speed */ }
}
```

**Key Methods**:
- `increaseSpeed()` - Add 0.5x, cap at 2.0x
- `decreaseSpeed()` - Subtract 0.5x, floor at 0.5x
- `updateDisplay(speed)` - Update button labels and speed text
- `destroy()` - Clean up

### 2. Modify GameSession.ts (EXISTING)
**Location**: `src/game/systems/GameSession.ts`

Add speed management:
```typescript
// Add property:
gameSpeed: number = 1.0;

// Add methods:
setGameSpeed(multiplier: number): void
getGameSpeed(): number
resetGameSpeed(): void
```

### 3. Modify DefenseWave.ts (EXISTING)
**Location**: `src/game/scenes/DefenseWave.ts`

Initialize speed control and integrate:
```typescript
// In create():
const speedControl = new SpeedControl(this, (speed) => {
  GameSession.getInstance().setGameSpeed(speed);
});

// In onWaveComplete():
GameSession.getInstance().resetGameSpeed();

// In onGameOver():
GameSession.getInstance().resetGameSpeed();
```

### 4. Update GameTypes.ts (EXISTING)
**Location**: `src/game/types/GameTypes.ts`

Add type:
```typescript
interface SpeedControlConfig {
  minSpeed: number;
  maxSpeed: number;
  speedStep: number;
  debounceDelay: number;
}
```

## Implementation Flow

### Step 1: Create SpeedControl Component
1. Create `src/game/entities/SpeedControl.ts`
2. Implement button rendering at x=880, 950, 1020; y=700
3. Add click handlers with debouncing
4. Export the class

**What it should do**:
- Initialize +/- buttons and speed display
- Handle clicks (with 100ms debounce)
- Validate and enforce 0.5x-2.0x bounds
- Update display when speed changes
- Invoke callback with new speed

### Step 2: Extend GameSession
1. Open `src/game/systems/GameSession.ts`
2. Add `gameSpeed: number = 1.0` property
3. Implement `setGameSpeed(multiplier)` to:
   - Clamp to [0.5, 2.0]
   - Update `this.gameSpeed`
   - Set `scene.time.timeScale = multiplier` if scene active
4. Implement `resetGameSpeed()` to call `setGameSpeed(1.0)`

### Step 3: Integrate into DefenseWave
1. Open `src/game/scenes/DefenseWave.ts`
2. In `create()`:
   - Initialize SpeedControl with callback
   - Pass scene reference
3. In callback function:
   - Call `GameSession.getInstance().setGameSpeed(speed)`
4. In `onWaveComplete()`:
   - Call `GameSession.getInstance().resetGameSpeed()`
5. In `onGameOver()`:
   - Call `GameSession.getInstance().resetGameSpeed()`

### Step 4: Test
1. Run `npm run dev`
2. Launch a wave
3. Test +/- buttons (speed should increase/decrease)
4. Verify display updates
5. Complete wave (speed should reset to 1.0x)

## Common Pitfalls to Avoid

| Issue | Solution |
|-------|----------|
| Speed doesn't apply to enemies | Forgot to set `scene.time.timeScale` |
| Buttons overlap grid | Wrong positioning (use x=880, 950, 1020) |
| Rapid clicks cause issues | Add debounce (100ms minimum) |
| Speed persists after wave | Forgot `resetGameSpeed()` call |
| UI appears behind grid | Set z-index/depth appropriately |
| Speed resets immediately | Make sure `resetGameSpeed()` called at wave END, not start |

## File Dependencies

```
SpeedControl.ts (NEW)
  ├─ requires: Phaser.Scene, GameObjects
  └─ used by: DefenseWave.ts

GameSession.ts (MODIFIED)
  ├─ requires: Scene context for timeScale
  └─ used by: DefenseWave.ts, SpeedControl callback

DefenseWave.ts (MODIFIED)
  ├─ requires: GameSession, SpeedControl
  └─ uses: time.timeScale, resetGameSpeed()

GameTypes.ts (MODIFIED)
  ├─ adds: SpeedControlConfig interface
  └─ used by: SpeedControl.ts (optional, for type safety)
```

## Quick Checklist

- [ ] SpeedControl.ts created with buttons at correct position
- [ ] GameSession has `gameSpeed`, `setGameSpeed()`, `resetGameSpeed()`
- [ ] DefenseWave initializes SpeedControl in create()
- [ ] DefenseWave calls `setGameSpeed()` when buttons clicked
- [ ] DefenseWave resets speed on wave complete
- [ ] Speed display shows current multiplier
- [ ] Buttons disabled at boundaries (0.5x, 2.0x)
- [ ] Debounce prevents rapid clicks
- [ ] Enemies move faster at higher speeds
- [ ] Speed resets to 1.0x for next wave

## Testing with Dev Server

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch tests (optional)
npm run test:ui

# Browser: Navigate to http://localhost:8080
# - Select a grade
# - Launch a wave
# - Click speed buttons
# - Verify behavior
```

## Debugging Tips

1. **Speed not applying**: Check `console.log(scene.time.timeScale)` in DefenseWave.update()
2. **Buttons not clickable**: Verify input event listeners attached in SpeedControl
3. **Speed not resetting**: Add console.log in onWaveComplete before resetGameSpeed()
4. **Overlap issues**: Measure exact grid boundaries and position buttons outside
5. **Debounce not working**: Check `lastClickTime` tracking in SpeedControl

## Next Steps After Implementation

1. Write Playwright tests to verify speed control functionality
2. Test edge cases (rapid clicks, mid-wave transitions, etc.)
3. Verify no performance regression at 60 FPS
4. Confirm successful merge to main branch

See `/specs/004-adjustable-game-speed/contracts/` for detailed implementation specifications.
