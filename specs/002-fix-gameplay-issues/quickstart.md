# Quickstart: Testing Gameplay Bug Fixes

**Feature**: 002-fix-gameplay-issues  
**Date**: November 23, 2025  
**Purpose**: Guide for manually testing tower placement, coin economy, and game speed fixes

---

## Setup

### Prerequisites
- Node.js 18+ installed
- Repository cloned: `git clone https://github.com/mortenp1337/mission-kritisk.git`
- Dependencies installed: `npm install`
- Branch checked out: `git checkout 002-fix-gameplay-issues`

### Start Development Server
```bash
npm run dev
```

Game runs at `http://localhost:8080`

### Run Automated Tests
```bash
npm run test        # Headless Playwright tests
npm run test:headed # Watch tests run in browser
npm run test:ui     # Interactive test UI
```

---

## Manual Test Scenarios

### Priority 1: Tower Placement Control

#### Test 1.1: Enter Placement Mode

**Steps**:
1. Start game and select any grade level
2. Note starting coin balance (default: 0)
3. Complete a wave or use dev console: `GameSession.getInstance().coins = 50`
4. Click "Køb Tårn (50 mønter)" button

**Expected**:
- ✅ Button becomes disabled/dimmed
- ✅ Grid becomes interactive (cells highlight on hover)
- ✅ Feedback message appears: "Vælg placering for tårn"
- ✅ No tower appears immediately under button
- ✅ Coin balance unchanged (still 50)

**Failure Indicators**:
- ❌ Tower spawns immediately
- ❌ Button stays enabled
- ❌ Grid not interactive
- ❌ Coins deducted before placement

---

#### Test 1.2: Hover Feedback - Valid Cell

**Prerequisites**: Placement mode active (Test 1.1 completed)

**Steps**:
1. Move mouse over empty grid cell (not on path)
2. Observe highlight

**Expected**:
- ✅ Green translucent rectangle appears on cell
- ✅ Highlight follows mouse to different valid cells
- ✅ Highlight updates at smooth rate (~60fps feel)

**Visual Check**: Grid path runs horizontally at row 5. Hover cells at rows 0-4 and 6-9.

---

#### Test 1.3: Hover Feedback - Invalid Cell (Path)

**Prerequisites**: Placement mode active

**Steps**:
1. Move mouse over path cells (row 5, any column)
2. Observe highlight color

**Expected**:
- ✅ Red translucent rectangle appears on path cells
- ✅ Color clearly distinguishable from green (valid cells)

---

#### Test 1.4: Hover Feedback - Invalid Cell (Occupied)

**Prerequisites**: 
- At least one tower already placed
- Placement mode active

**Steps**:
1. Move mouse over cell where tower exists
2. Observe highlight

**Expected**:
- ✅ Red translucent rectangle appears
- ✅ Same red color as path cells

---

#### Test 1.5: Successful Placement

**Prerequisites**: 
- Placement mode active
- 50+ coins available

**Steps**:
1. Click on valid empty cell (green highlight)
2. Observe results

**Expected**:
- ✅ Tower sprite appears at clicked cell
- ✅ Coins deducted by 50 (balance shows 0 if started with 50)
- ✅ Placement mode exits (button re-enabled)
- ✅ Highlight disappears
- ✅ Feedback: "Tårn placeret!"
- ✅ Cell now shows red highlight if hovered again (occupied)

---

#### Test 1.6: Rejected Placement - Path Cell

**Prerequisites**: Placement mode active

**Steps**:
1. Click on path cell (row 5, red highlight)
2. Observe results

**Expected**:
- ✅ No tower placed
- ✅ Coins unchanged
- ✅ Placement mode stays active (still selecting)
- ✅ Feedback: "Kan ikke placere på stien"

---

#### Test 1.7: Rejected Placement - Occupied Cell

**Prerequisites**:
- One tower already placed
- Placement mode active

**Steps**:
1. Click on occupied cell (where tower exists)
2. Observe results

**Expected**:
- ✅ No new tower placed
- ✅ Coins unchanged
- ✅ Placement mode stays active
- ✅ Feedback: "Celle optaget"

---

#### Test 1.8: Cancel Placement (ESC Key)

**Prerequisites**: Placement mode active, 50 coins available

**Steps**:
1. Press ESC key
2. Observe results

**Expected**:
- ✅ Placement mode exits
- ✅ Highlight disappears
- ✅ Buy button re-enabled
- ✅ Coins unchanged (no deduction)
- ✅ Grid no longer interactive

---

#### Test 1.9: Insufficient Funds

**Prerequisites**: Coins < 50

**Steps**:
1. Click "Køb Tårn" button
2. Observe results

**Expected**:
- ✅ Placement mode does NOT activate
- ✅ Feedback: "Ikke nok mønter"
- ✅ Button stays enabled (can try again after earning coins)
- ✅ No grid interaction

---

#### Test 1.10: Placement During Wave Transition

**Prerequisites**: Placement mode active

**Steps**:
1. Click "Start Bølge" button while in placement mode
2. Observe results

**Expected**:
- ✅ Placement mode auto-exits
- ✅ Coins unchanged (no deduction if not placed)
- ✅ Wave starts normally
- ✅ No errors or broken state

---

### Priority 2: Coin Economy Balance

#### Test 2.1: No Coins from Wave Completion

**Steps**:
1. Start game with 0 coins (fresh session)
2. Play through entire wave without placing towers (let zombies through or use invincible base in dev)
3. Observe coin balance when wave completes

**Expected**:
- ✅ Coin balance remains 0
- ✅ Scene transitions to MathChallenge
- ✅ No "Bølge gennemført! +X mønter" message

**Failure Indicators**:
- ❌ Coins increase after wave
- ❌ Feedback message mentions coin reward for wave

---

#### Test 2.2: Coins from Correct Math Answer

**Prerequisites**: At MathChallenge scene (after wave)

**Steps**:
1. Note starting coin balance
2. View math problem and difficulty (grade level)
3. Select correct answer
4. Observe coin change

**Expected (Grade 3 example)**:
- ✅ Coins increase by 20 (5 + 3×5)
- ✅ Feedback: "Korrekt! +20 mønter"
- ✅ Coin display updates immediately
- ✅ Next problem appears

**Verification Table**:
| Grade | Expected Coins Per Correct Answer |
|-------|-----------------------------------|
| 1     | 10 coins                          |
| 2     | 15 coins                          |
| 3     | 20 coins                          |
| 4     | 25 coins                          |
| 5     | 30 coins                          |

---

#### Test 2.3: No Coins from Incorrect Answer

**Prerequisites**: At MathChallenge scene

**Steps**:
1. Note starting coin balance
2. Select wrong answer deliberately
3. Observe coin change

**Expected**:
- ✅ Coins unchanged
- ✅ Feedback: "Forkert svar, prøv igen"
- ✅ Same problem remains (retry opportunity)

---

#### Test 2.4: Full Game Loop Coin Flow

**Steps**:
1. Start with 0 coins
2. Complete Wave 1 → verify 0 coins
3. Solve 3 math problems correctly (Grade 2) → verify +45 coins (3 × 15)
4. Solve 1 problem incorrectly → verify no change (still 45)
5. Solve 2 more correctly → verify +30 coins (total 75)
6. Enter TowerPlacement scene → verify 75 coins shown
7. Buy tower → verify 25 coins remaining (75 - 50)
8. Complete Wave 2 → verify still 25 coins (no wave bonus)

**Expected**: Coins only increase during MathChallenge correct answers, never during waves.

---

### Priority 3: Game Speed Adjustment

#### Test 3.1: Zombie Movement Speed

**Setup**:
1. Record baseline: Play wave at normal speed (on main branch)
2. Checkout 002-fix-gameplay-issues branch
3. Play same wave with speed multiplier

**Steps**:
1. Start DefenseWave scene
2. Observe zombie movement across grid
3. Use stopwatch to time zombie crossing entire path
4. Compare to baseline timing

**Expected**:
- ✅ Zombies move noticeably faster (visually obvious)
- ✅ Path crossing time reduced to ~67% of baseline (e.g., 30s → 20s)
- ✅ Movement appears smooth, not janky

**Baseline Reference** (if original timings available):
```
Original speed: ~30 seconds to cross path
Expected new speed: ~20 seconds (30 / 1.5)
```

---

#### Test 3.2: Tower Firing Rate

**Setup**: Place at least one tower in path of zombies

**Steps**:
1. Observe tower firing projectiles
2. Count shots fired in 10 seconds
3. Compare to baseline (original branch)

**Expected**:
- ✅ Tower fires noticeably faster
- ✅ Shot count increased by ~50% (e.g., 10 shots → 15 shots in 10 sec)
- ✅ Projectiles animate smoothly

**Visual Check**: Tower should fire approximately every 0.67 seconds instead of every 1 second (if base fire rate is 1 shot/sec).

---

#### Test 3.3: Overall Wave Duration

**Steps**:
1. Start wave with several towers placed
2. Use stopwatch to measure total wave duration from start to completion
3. Compare to baseline timing

**Expected**:
- ✅ Wave completes in 60-70% of original time
- ✅ Faster pace makes game feel snappier
- ✅ No collision detection issues (zombies still hit by projectiles)
- ✅ No pathfinding issues (zombies follow path correctly)

**Example Timings**:
```
Original Wave 1: ~60 seconds
Expected Wave 1: ~40 seconds (60 / 1.5)

Original Wave 3: ~90 seconds
Expected Wave 3: ~60 seconds (90 / 1.5)
```

---

#### Test 3.4: Configuration Centralization

**Steps**:
1. Open `src/game/data/gameplayConfig.ts`
2. Change `speedMultiplier` from 1.5 to 2.0 (double speed)
3. Save file (hot reload should trigger)
4. Observe game with new speed

**Expected**:
- ✅ Both zombies and towers now at 2.0x speed
- ✅ Single config change affects entire game
- ✅ No need to modify multiple files

**Reset**: Change back to 1.5 after test

---

#### Test 3.5: Asymmetric Speed Adjustment

**Steps**:
1. Open `src/game/data/gameplayConfig.ts`
2. Set `zombieSpeedMultiplier: 2.0`, `towerFireRateMultiplier: 1.0`
3. Play wave

**Expected**:
- ✅ Zombies move at 2.0x speed (very fast)
- ✅ Towers fire at 1.0x speed (normal)
- ✅ Game becomes noticeably harder

**Reset**: Revert to 1.5 / 1.5 after test

---

## Dev Console Commands

**Useful for testing without playing through entire game**:

```javascript
// Grant coins for tower placement testing
GameSession.getInstance().coins = 500;

// Skip to specific scene
game.scene.start('TowerPlacement');
game.scene.start('MathChallenge');
game.scene.start('DefenseWave');

// Check current speed config
import('./src/game/data/gameplayConfig.js').then(m => console.log(m.GAMEPLAY_CONFIG));

// Force wave completion (if needed)
game.scene.getScene('DefenseWave').onWaveComplete();
```

---

## Regression Checklist

**Verify existing features still work**:

- [ ] Game boots and loads assets correctly
- [ ] MainMenu → GradeSelection → TowerPlacement flow intact
- [ ] Math problems generate correctly for all grades
- [ ] Wave progression follows difficulty curve
- [ ] Towers fire at targets correctly
- [ ] Zombies follow path and attack base
- [ ] Game over conditions trigger properly
- [ ] All Danish text displays correctly
- [ ] UI buttons respond to clicks
- [ ] Scene transitions are smooth

---

## Known Issues / Edge Cases

**Watch for these during testing**:

1. **High Speed Collision**: At 3.0x+ speed, projectiles might miss fast-moving zombies
2. **Grid Click Precision**: Very fast mouse movements might miss hover updates
3. **Multiple Placement**: Rapid clicking shouldn't create multiple towers
4. **Coin Display Lag**: Coin UI should update immediately, not lag behind balance
5. **Persistent Highlight**: Highlight should disappear on mode exit, not stick around

---

## Reporting Issues

**If bugs found, document**:
1. Test case name (e.g., "Test 1.5: Successful Placement")
2. Steps to reproduce
3. Expected result
4. Actual result
5. Screenshot/video if visual issue
6. Browser used (Chrome/Firefox/Safari)
7. Console errors (F12 → Console tab)

**Submit via**:
- GitHub issue on `002-fix-gameplay-issues` branch
- Include "Bug:" prefix in issue title
- Tag with `bug`, `gameplay`, and priority label

---

## Success Criteria Checklist

After all tests pass, verify:

### Tower Placement (P1)
- [x] Players can select grid cells interactively
- [x] Visual feedback differentiates valid/invalid cells
- [x] Coins only deducted on successful placement
- [x] ESC key cancels without penalty
- [x] No accidental placements

### Coin Economy (P2)
- [x] Zero coins from wave completion
- [x] Coins awarded only for correct math answers
- [x] Amounts match difficulty (10-30 coins)
- [x] Balance persists across scenes

### Game Speed (P3)
- [x] Wave duration reduced to ~67% of original
- [x] Zombie movement 1.5x faster
- [x] Tower firing 1.5x faster
- [x] Single config file controls all speeds
- [x] Game feels snappier and more engaging

**All checkboxes must be ticked before merging to main.**
