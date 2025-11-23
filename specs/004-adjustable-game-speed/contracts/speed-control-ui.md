# Implementation Contract: SpeedControl UI Component

**Feature**: 004-adjustable-game-speed  
**Component**: Speed Control UI System  
**Date**: 2025-11-23

## Component Overview

The SpeedControl component is a UI system that provides player-facing speed adjustment controls during the DefenseWave scene. It manages two interactive buttons (+/-) and displays the current game speed multiplier.

## Interface Contract

### Constructor
```typescript
constructor(scene: Phaser.Scene, onSpeedChange: (speed: number) => void)
```

**Parameters**:
- `scene`: The Phaser scene (DefenseWave) that owns this control
- `onSpeedChange`: Callback function invoked when speed changes (receives new speed multiplier)

**Behavior**:
- Create and position button graphics at x=880 (–), x=950 (display), x=1020 (+); y=700
- Initialize current speed to 1.0x
- Set up input listeners for button clicks
- Initialize debounce state (lastClickTime = 0)

---

## Public Methods

### increaseSpeed(): void

**Purpose**: Increase game speed by speedStep, with boundary enforcement

**Implementation Requirements**:
- Check debounce: if `now - lastClickTime < 100ms`, return early
- Calculate `newSpeed = currentSpeed + 0.5`
- Enforce max boundary: if `newSpeed > 2.0`, set to 2.0
- Update `lastClickTime = now`
- Call `setSpeed(newSpeed)`

**Side Effects**:
- Updates speed display
- Invokes `onSpeedChange` callback
- Updates button enabled states

---

### decreaseSpeed(): void

**Purpose**: Decrease game speed by speedStep, with boundary enforcement

**Implementation Requirements**:
- Check debounce: if `now - lastClickTime < 100ms`, return early
- Calculate `newSpeed = currentSpeed - 0.5`
- Enforce min boundary: if `newSpeed < 0.5`, set to 0.5
- Update `lastClickTime = now`
- Call `setSpeed(newSpeed)`

**Side Effects**:
- Updates speed display
- Invokes `onSpeedChange` callback
- Updates button enabled states

---

### setSpeed(multiplier: number): void

**Purpose**: Set speed to specific value with validation

**Implementation Requirements**:
- Validate: `0.5 ≤ multiplier ≤ 2.0`
- If invalid, clamp to boundary
- Check if multiplier equals currentSpeed (return if no change)
- Update `currentSpeed = multiplier`
- Call `updateDisplay(multiplier)`
- Invoke `onSpeedChange(multiplier)`
- Update button visual states (enable/disable)

---

### updateDisplay(speed: number): void

**Purpose**: Update visual representation of current speed

**Implementation Requirements**:
- Update speed text: format as `${(speed * 100).toFixed(0)}%` or `${speed.toFixed(1)}x`
- Change button tint or opacity based on boundaries:
  - If speed >= 2.0: disable (+) button (alpha = 0.5, disabled input)
  - If speed <= 0.5: disable (–) button (alpha = 0.5, disabled input)
  - Otherwise: enable both (alpha = 1.0, active input)

---

### destroy(): void

**Purpose**: Clean up UI elements and event listeners

**Implementation Requirements**:
- Remove click event listeners from buttons
- Destroy all GameObjects: buttons, text display
- Clear internal state

---

## Visual Design

### Button Layout
```
Bottom-right corner of DefenseWave scene:

x=880        x=950        x=1020
  [−]    [1.0x]    [+]
  
y=700 (all aligned vertically)

Button size: 40px × 40px
Font: Arial Black, 24px, color #FFFF00, stroke #000000 thickness 2
Text display: Arial Black, 20px, color #00FF00, stroke #000000 thickness 2
Margin from edge: 30px (950 pixels from left edge; 68px from right edge at 1024px width)
```

### Button States

**Normal State** (within bounds):
- Background: #333333 (dark gray)
- Text: #FFFF00 (yellow)
- Border: #FFFFFF (white), 2px
- Alpha: 1.0
- Pointer: pointer (cursor changes on hover)

**Disabled State** (at boundary):
- Background: #333333 (dark gray)
- Text: #666666 (gray)
- Border: #666666 (gray), 2px
- Alpha: 0.5
- Pointer: not-allowed

**Hover State** (enabled buttons):
- Background: #555555 (lighter gray)
- Border: #FFFF00 (yellow), 2px

**Click State**:
- Brief flash animation (scale 0.95 for 50ms)
- Immediate speed update

---

## Input Handling

### Click Events

**Decrease Button (–)**:
- Left-click → call `decreaseSpeed()`
- Hit area: 40px radius from center (x=880, y=700)
- Pointer event: pointerdown or pointerup (choose one, consistent)

**Increase Button (+)**:
- Left-click → call `increaseSpeed()`
- Hit area: 40px radius from center (x=1020, y=700)
- Pointer event: pointerdown or pointerup (choose one, consistent)

### Debouncing

- Prevent more than one button press per 100ms
- Check: `timestamp - lastClickTime >= 100`
- Update `lastClickTime = timestamp` on each processed click

---

## Integration with GameSession

### Speed Change Callback Flow

```typescript
// In DefenseWave.create():
const speedControl = new SpeedControl(this, (newSpeed: number) => {
  GameSession.getInstance().setGameSpeed(newSpeed);
  this.time.timeScale = newSpeed;
  // Update any speed-dependent UI displays
});

// OR: DefenseWave calls speedControl methods directly:
speedControl.increaseSpeed(); // which internally triggers callback
```

---

## Configuration

**Constants** (hardcoded in SpeedControl):
```typescript
const MIN_SPEED = 0.5;
const MAX_SPEED = 2.0;
const SPEED_STEP = 0.5;
const DEBOUNCE_DELAY_MS = 100;
const BUTTON_RADIUS = 40;
const BUTTON_X_DECREASE = 880;
const BUTTON_X_INCREASE = 1020;
const DISPLAY_X = 950;
const BUTTON_Y = 700;
```

---

## Error Handling

**Invalid Speed Values**:
- If `setSpeed(multiplier)` receives out-of-range value, clamp to boundary
- Log warning if multiplier is NaN or undefined

**Missing Callback**:
- If `onSpeedChange` is not provided, initialize to empty function `() => {}`

**Scene Context Loss**:
- If scene is destroyed while SpeedControl exists, call `destroy()` in scene shutdown

---

## Testing Requirements

- [ ] Buttons render at correct positions with no overlap
- [ ] Speed increases from 1.0 → 1.5 → 2.0 with button presses
- [ ] Speed decreases from 1.0 → 0.5 with button presses
- [ ] Speed clamped to 2.0 when attempting increase past max
- [ ] Speed clamped to 0.5 when attempting decrease past min
- [ ] Display text updates immediately on speed change
- [ ] Buttons disabled (visual feedback) at boundaries
- [ ] Debounce prevents rapid button mashing (<100ms ignored)
- [ ] Callback invoked on each speed change
- [ ] Destroy removes all GameObjects and listeners
