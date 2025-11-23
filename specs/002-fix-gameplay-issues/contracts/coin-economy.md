# Contract: Coin Economy System

**Feature**: 002-fix-gameplay-issues  
**Component**: MathChallenge + DefenseWave scenes + GameSession  
**Purpose**: Define coin award rules ensuring coins only come from correct math answers

---

## Overview

The Coin Economy System manages when and how players earn coins. This contract specifies the removal of wave completion rewards and ensures coins are exclusively tied to mathematical problem-solving performance.

---

## Coin Award Sources

### ✅ KEEP: Math Problem Correct Answers

**Location**: `MathChallenge` scene

**Trigger**: Player submits correct answer to math problem

**Award Calculation**:
```typescript
function calculateCoinReward(difficulty: number): number {
    // Difficulty = player's selected grade (1-5)
    return 5 + (difficulty * 5);
}

// Examples:
// Grade 1: 5 + (1 × 5) = 10 coins
// Grade 2: 5 + (2 × 5) = 15 coins
// Grade 3: 5 + (3 × 5) = 20 coins
// Grade 4: 5 + (4 × 5) = 25 coins
// Grade 5: 5 + (5 × 5) = 30 coins
```

**Existing Logic** (no changes):
```typescript
// In MathChallenge.checkAnswer()
private checkAnswer(selectedAnswer: number): void {
    if (this.currentProblem?.checkAnswer(selectedAnswer)) {
        const reward = this.currentProblem.coinReward;
        this.session.addCoins(reward); // ✅ KEEP THIS
        this.updateCoinDisplay();
        this.showFeedback(`Korrekt! +${reward} mønter`, true);
    } else {
        this.showFeedback('Forkert svar, prøv igen', false);
    }
}
```

**Rationale**: Coins tied to educational achievement incentivizes learning and reinforces game's educational purpose.

---

### ❌ REMOVE: Wave Completion Bonus

**Location**: `DefenseWave` scene (to be verified and removed)

**Previous Trigger**: All zombies defeated, wave ends successfully

**Previous Award**: Fixed bonus regardless of performance (exact amount TBD from code inspection)

**Logic to Remove**:
```typescript
// In DefenseWave scene - FIND AND DELETE THIS PATTERN
private onWaveComplete(): void {
    // ❌ DELETE: const waveBonus = 50; // or similar
    // ❌ DELETE: this.session.addCoins(waveBonus);
    // ❌ DELETE: this.showFeedback(`Bølge gennemført! +${waveBonus} mønter`);
    
    // ✅ KEEP: Transition to MathChallenge
    this.scene.start('MathChallenge');
}
```

**Rationale**: Wave completion is a prerequisite for math problems, not an achievement itself. Rewarding wave completion dilutes the educational focus and creates inflation in coin economy.

---

## API: GameSession (Existing, Minimal Changes)

### Method: `addCoins(amount: number): void`

**Purpose**: Add coins to player's balance

**Parameters**:
- `amount: number` - Number of coins to add (must be positive integer)

**Behavior**:
1. Validate `amount > 0`
2. Add to balance: `this.coins += amount`
3. Persist to localStorage: `this.save()`
4. Emit update event (if event system exists)

**Callers** (after changes):
- ✅ `MathChallenge.checkAnswer()` on correct answer ONLY
- ❌ NO calls from `DefenseWave` scene

**No Changes Needed**: Method implementation unchanged, only call sites modified

---

### Method: `removeCoins(amount: number): boolean`

**Purpose**: Deduct coins for tower purchases

**Parameters**:
- `amount: number` - Number of coins to remove (must be positive)

**Returns**:
- `boolean` - `true` if deduction succeeded, `false` if insufficient balance

**Behavior**:
1. Check: `this.coins >= amount`
2. If insufficient: return `false`
3. Deduct: `this.coins -= amount`
4. Persist: `this.save()`
5. Return `true`

**Callers** (unchanged):
- `TowerPlacement.attemptPlacement()` on successful tower placement

**No Changes Needed**: Existing implementation correct

---

## Coin Transaction Flow

### Math Problem Solving (✅ Active Flow)

```
1. MathChallenge Scene Created
   ↓
2. Player views math problem
   ↓
3. Player selects answer
   ↓
4. MathChallenge.checkAnswer(answer)
   ├── If correct:
   │   ├── Calculate reward = calculateCoinReward(difficulty)
   │   ├── session.addCoins(reward)
   │   ├── Show feedback: "Korrekt! +{reward} mønter"
   │   └── Update coin display UI
   └── If incorrect:
       └── Show feedback: "Forkert svar, prøv igen"
   ↓
5. Move to next problem or complete challenge
```

---

### Wave Defense (❌ Removed Flow)

**Before (Incorrect)**:
```
DefenseWave.onWaveComplete()
├── session.addCoins(waveBonus) ← DELETE THIS
├── Show "Bølge gennemført! +X mønter" ← DELETE THIS
└── scene.start('MathChallenge')
```

**After (Correct)**:
```
DefenseWave.onWaveComplete()
└── scene.start('MathChallenge') ← ONLY THIS REMAINS
```

**Result**: Wave completion transitions directly to math problems without coin award

---

## UI Feedback Messages (Danish)

### Keep (Existing):
- ✅ `"Korrekt! +{amount} mønter"` - Shown on correct math answer
- ✅ `"Forkert svar, prøv igen"` - Shown on incorrect math answer
- ✅ `"Mønter: {balance}"` - Coin display (always visible)

### Remove (If Exists):
- ❌ `"Bølge gennemført! +{amount} mønter"` - Wave completion bonus message
- ❌ Any other wave-related coin feedback

### No Changes Needed:
- Tower purchase feedback (not related to coin earning)
- Insufficient funds messages (not related to coin earning)

---

## Code Audit Checklist

**Files to Inspect**:
1. ✅ `src/game/scenes/MathChallenge.ts`
   - Verify `checkAnswer()` awards coins on correct answers
   - Verify no coin awards on incorrect answers or timeout
   - Confirm Danish feedback messages present

2. ❌ `src/game/scenes/DefenseWave.ts`
   - Search for `addCoins` calls → DELETE if found
   - Search for wave completion handlers → REMOVE coin logic
   - Verify scene transitions to MathChallenge without coin awards

3. 🔍 `src/game/systems/GameSession.ts`
   - Verify `addCoins()` and `removeCoins()` signatures unchanged
   - No new methods needed

4. 🔍 Search entire codebase:
   ```bash
   grep -r "addCoins" src/game/scenes/
   # Expected matches:
   # - MathChallenge.ts (correct answers) ✅
   # - NO matches in DefenseWave.ts ❌
   ```

---

## Validation Rules

### Coin Award Rules (Enforced by Logic)
1. Coins MUST only be awarded in `MathChallenge` scene
2. Coins MUST only be awarded for correct answers (`checkAnswer() === true`)
3. Coin amount MUST be based on problem difficulty (grade level)
4. Coin amount MUST be positive integer
5. NO coins awarded for:
   - Incorrect answers
   - Skipped problems
   - Wave completion
   - Time-based events
   - Any other gameplay events

### Balance Integrity
- `session.coins` must never be negative
- All coin additions go through `session.addCoins()`
- All coin deductions go through `session.removeCoins()`
- Balance persisted to localStorage on every change

---

## Testing Contract

### Test Scenarios

**Math Problem Coin Awards**:
```typescript
test('Awards coins for correct math answer', async () => {
    const initialBalance = session.coins;
    const difficulty = 3; // Grade 3
    const expectedReward = 20; // 5 + (3 × 5)
    
    await solveProblemCorrectly(difficulty);
    
    expect(session.coins).toBe(initialBalance + expectedReward);
    expect(feedbackText).toContain(`+${expectedReward} mønter`);
});

test('No coins for incorrect math answer', async () => {
    const initialBalance = session.coins;
    
    await solveProblemIncorrectly();
    
    expect(session.coins).toBe(initialBalance);
    expect(feedbackText).toContain('Forkert svar');
});
```

**Wave Completion No Awards**:
```typescript
test('No coins awarded on wave completion', async () => {
    const initialBalance = session.coins;
    
    await completeWaveSuccessfully();
    
    expect(session.coins).toBe(initialBalance); // No change
    expect(currentScene).toBe('MathChallenge'); // Transitioned
});
```

**Full Game Flow**:
```typescript
test('Coins only from math problems in full game', async () => {
    let coinBalance = 0;
    
    // Complete wave 1
    await playWaveToCompletion();
    expect(session.coins).toBe(coinBalance); // No change from wave
    
    // Solve 3 math problems correctly (Grade 2 = 15 coins each)
    await solveMathProblem(correctAnswer1);
    coinBalance += 15;
    expect(session.coins).toBe(coinBalance);
    
    await solveMathProblem(correctAnswer2);
    coinBalance += 15;
    expect(session.coins).toBe(coinBalance);
    
    await solveMathProblem(wrongAnswer); // Incorrect
    expect(session.coins).toBe(coinBalance); // No change
    
    await solveMathProblem(correctAnswer3);
    coinBalance += 15;
    expect(session.coins).toBe(coinBalance);
    
    // Start wave 2 (no coins from transition)
    expect(session.coins).toBe(coinBalance);
});
```

---

## Migration Notes

### Code Changes Required

**DefenseWave.ts**:
```typescript
// BEFORE
private onWaveComplete(): void {
    const waveBonus = 50;
    this.session.addCoins(waveBonus);
    this.showMessage(`Bølge gennemført! +${waveBonus} mønter`);
    this.time.delayedCall(2000, () => {
        this.scene.start('MathChallenge');
    });
}

// AFTER
private onWaveComplete(): void {
    // Removed coin award and related message
    this.time.delayedCall(2000, () => {
        this.scene.start('MathChallenge');
    });
}
```

**No Database Migration**: Existing player balances preserved (no schema changes)

**No UI Changes**: Coin display format unchanged, just source of coins changes

---

## Side Effects

### Expected Changes
- ✅ Players earn fewer total coins (no wave bonuses)
- ✅ Tower purchases become more strategic (limited currency)
- ✅ Math problem performance directly impacts progression
- ✅ Educational focus strengthened

### No Impact On
- ❌ Coin display UI (format unchanged)
- ❌ Tower costs (unchanged)
- ❌ Math problem difficulty (unchanged)
- ❌ Wave difficulty progression (unchanged)
- ❌ Existing player coin balances (preserved)

---

## Future Considerations

**Potential Enhancements** (not in MVP):
- Bonus coins for streaks of correct answers
- Penalty coins for incorrect answers (negative reinforcement, debatable)
- Difficulty multipliers (harder problems = more coins)
- Time-based bonuses (fast correct answers = extra coins)
- Performance rating system (A/B/C grade = different rewards)

**Current Design Supports**: Adding new coin sources in future without refactoring, as long as they go through `session.addCoins()` with clear sources documented.
