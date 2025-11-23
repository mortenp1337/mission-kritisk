# Data Model: Gameplay Bug Fixes

**Feature**: 002-fix-gameplay-issues  
**Date**: November 23, 2025  
**Purpose**: Define entities and their relationships for tower placement, coin economy, and game speed systems

---

## Entity Definitions

### 1. PlacementState

**Description**: Represents the tower placement mode state within TowerPlacement scene

**Fields**:
- `isActive: boolean` - Whether placement mode is currently active
- `selectedTowerType: TowerType` - Type of tower being placed ('basic', 'advanced', etc.)
- `highlightedCell: GridPosition | null` - Currently highlighted grid cell under cursor
- `availableCells: GridPosition[]` - Valid placement locations (not occupied, not on path)

**State Transitions**:
```
IDLE (isActive: false)
  ↓ [Player clicks "Køb Tårn" with sufficient coins]
ACTIVE (isActive: true, selectedTowerType set)
  ↓ [Player clicks valid grid cell]
IDLE (tower placed, coins deducted)

ACTIVE
  ↓ [Player presses ESC or clicks cancel]
IDLE (no coins deducted, placement cancelled)
```

**Validation Rules**:
- Cannot enter ACTIVE state if `session.coins < getTowerCost(towerType)`
- Cell must not be occupied (`grid.getCell(pos).isOccupied === false`)
- Cell must not be on path (`!isOnPath(pos)`)
- Cell must be within grid bounds (`0 <= row < GRID_ROWS && 0 <= col < GRID_COLS`)

**Lifecycle**:
- Created: On TowerPlacement scene initialization
- Updated: On pointer move (highlightedCell), button click (isActive, selectedTowerType)
- Destroyed: On scene transition to DefenseWave

**Relationships**:
- Uses: `Grid` entity for cell validation
- Uses: `GameSession` for coin balance checks
- Produces: `BasicTower` instance on successful placement

---

### 2. GameplayConfig

**Description**: Centralized configuration for game speed and timing parameters

**Fields**:
- `speedMultiplier: number` - Master speed control (default: 1.5 for 50% faster)
- `zombieSpeedMultiplier: number` - Zombie movement speed multiplier (default: 1.5)
- `towerFireRateMultiplier: number` - Tower firing rate multiplier (default: 1.5)

**Default Values**:
```typescript
{
    speedMultiplier: 1.5,
    zombieSpeedMultiplier: 1.5,
    towerFireRateMultiplier: 1.5
}
```

**Constraints**:
- `speedMultiplier` should be clamped to [0.5, 3.0] to prevent gameplay breaking
- `zombieSpeedMultiplier` and `towerFireRateMultiplier` can differ for asymmetric tuning
- Values must be positive numbers (> 0)

**Usage Pattern**:
```typescript
// In Zombie.update()
const adjustedSpeed = getAdjustedSpeed(this.baseSpeed);
this.position.x += deltaX * adjustedSpeed * deltaTime;

// In Tower constructor
const adjustedFireRate = getAdjustedFireRate(this.baseFireRate);
this.fireTimer = scene.time.addEvent({
    delay: 1000 / adjustedFireRate,
    callback: () => this.fire(),
    loop: true
});
```

**Lifecycle**:
- Loaded: Once at game initialization (static import)
- Modified: Only by developers (no runtime changes in MVP)
- Persisted: No persistence (config file only)

**Relationships**:
- Used by: `Zombie` entity (movement speed)
- Used by: `Tower` and `BasicTower` entities (fire rate)
- Independent of: Scene state (global configuration)

---

### 3. CoinTransaction (Modified Existing Entity)

**Description**: Represents a coin award event tied to specific gameplay actions

**Fields**:
- `amount: number` - Number of coins awarded (positive integer)
- `source: 'math_problem'` - Source type (REMOVED: 'wave_completion')
- `difficulty: number` - Math problem difficulty level (1-5, affects amount)
- `timestamp: number` - When transaction occurred (for potential history tracking)

**Award Rules**:
```typescript
// KEEP: Award coins for correct math answers
if (correctAnswer) {
    const reward = calculateReward(problemDifficulty); // 5-25 coins based on difficulty
    session.addCoins(reward);
}

// REMOVE: Wave completion awards
// ❌ session.addCoins(waveBonus); // DELETE THIS
```

**Calculation Formula** (existing, unchanged):
```typescript
function calculateReward(difficulty: number): number {
    return 5 + (difficulty * 5); // Grade 1 = 10 coins, Grade 5 = 30 coins
}
```

**Validation Rules**:
- Amount must be positive integer
- Only 'math_problem' source is valid (wave_completion removed)
- Difficulty must match selected grade level (1-5)

**Lifecycle**:
- Created: When player submits correct math answer in MathChallenge scene
- Applied: Immediately to `GameSession.coins` balance
- Persisted: Via GameSession to localStorage (balance only, not individual transactions)

**Relationships**:
- Created by: `MathChallenge` scene on correct answer
- Modifies: `GameSession.coins` balance
- Triggers: UI update for coin display across all scenes

---

## Entity Relationships Diagram

```
TowerPlacement Scene
├── Contains: PlacementState
│   ├── Reads: GameSession.coins
│   ├── Validates: Grid.cells[].isOccupied
│   └── Creates: BasicTower on placement
│
MathChallenge Scene
├── Creates: CoinTransaction (on correct answer)
│   └── Modifies: GameSession.coins
│
DefenseWave Scene
├── Uses: GameplayConfig (speed multipliers)
│   ├── Applied to: Zombie.update()
│   └── Applied to: Tower.fire()
│
GameplayConfig (static)
├── Imported by: Zombie entity
├── Imported by: Tower entity
└── Imported by: BasicTower entity
```

---

## Data Flow: Tower Placement

```
1. Player clicks "Køb Tårn"
   ↓
2. TowerPlacement.enterPlacementMode()
   ├── Check: session.coins >= towerCost
   ├── Set: placementState.isActive = true
   └── Enable: grid pointer events
   ↓
3. Player moves mouse over grid
   ↓
4. TowerPlacement.highlightCell(gridPos)
   ├── Validate: cell.isOccupied, isOnPath
   ├── Update: placementState.highlightedCell
   └── Render: green/red highlight rectangle
   ↓
5. Player clicks grid cell
   ↓
6. TowerPlacement.attemptPlacement(gridPos)
   ├── Validate: cell.isOccupied === false
   ├── Create: new BasicTower(gridPos, type)
   ├── Deduct: session.removeCoins(towerCost)
   ├── Update: grid.cells[].isOccupied = true
   └── Exit: placementMode
```

---

## Data Flow: Coin Economy

```
MathChallenge Scene:
1. Player solves math problem correctly
   ↓
2. MathChallenge.checkAnswer(answer)
   ├── Validate: answer === currentProblem.correctAnswer
   ├── Calculate: reward = 5 + (grade * 5)
   └── Award: session.addCoins(reward)
   ↓
3. GameSession.addCoins(amount)
   ├── Update: this.coins += amount
   ├── Persist: localStorage.setItem('gameSession', JSON.stringify(this))
   └── Trigger: UI update event
   ↓
4. All scenes with coinText update display
   └── coinText.setText(`Mønter: ${session.coins}`)

DefenseWave Scene:
1. Wave completes (all zombies defeated)
   ↓
2. DefenseWave.onWaveComplete()
   ├── ❌ REMOVE: session.addCoins(waveBonus)
   └── Transition: scene.start('MathChallenge')
```

---

## Data Flow: Game Speed

```
Game Initialization:
1. Import GAMEPLAY_CONFIG from gameplayConfig.ts
   ↓
2. Zombie constructor
   ├── Read: baseSpeed from waveConfig
   ├── Apply: adjustedSpeed = getAdjustedSpeed(baseSpeed)
   └── Store: this.speed = adjustedSpeed
   ↓
3. Zombie.update(deltaTime)
   ├── Calculate: pixelsToMove = this.speed * deltaTime
   └── Move: position += pixelsToMove
   
4. Tower constructor
   ├── Read: baseFireRate from towerConfig
   ├── Apply: adjustedRate = getAdjustedFireRate(baseFireRate)
   └── Create: timer with delay = 1000 / adjustedRate
   ↓
5. Tower.fire()
   ├── Triggered: by Phaser TimerEvent at adjusted rate
   └── Create: projectile toward target
```

---

## Validation Matrix

| Entity | Field | Validation Rule | Error Message (Danish) |
|--------|-------|----------------|----------------------|
| PlacementState | selectedTowerType | Must be valid TowerType | "Ugyldigt tårntype" |
| PlacementState | highlightedCell | Must be within grid bounds | "Udenfor området" |
| PlacementState | - | Sufficient coins for purchase | "Ikke nok mønter" |
| PlacementState | - | Cell not occupied | "Celle optaget" |
| PlacementState | - | Cell not on path | "Kan ikke placere på stien" |
| GameplayConfig | speedMultiplier | 0.5 <= value <= 3.0 | N/A (dev-only) |
| GameplayConfig | *Multiplier | value > 0 | N/A (dev-only) |
| CoinTransaction | amount | amount > 0 | N/A (internal) |
| CoinTransaction | difficulty | 1 <= difficulty <= 5 | N/A (internal) |

---

## Persistence Strategy

| Entity | Persisted? | Storage | Lifetime |
|--------|-----------|---------|----------|
| PlacementState | No | Scene memory only | Scene duration |
| GameplayConfig | No | Static code | Application lifetime |
| CoinTransaction | No (balance only) | Via GameSession | Transaction instant, balance persistent |
| GameSession.coins | Yes | localStorage | Cross-session |
| Grid.cells[].isOccupied | Yes | Via GameSession.towerPositions | Cross-wave |

**GameSession localStorage structure** (unchanged):
```typescript
{
    currentWave: number,
    coins: number,
    selectedGrade: number,
    towerPositions: Array<{ row: number, col: number, type: TowerType }>
}
```

---

## Type Definitions

**New TypeScript Types**:

```typescript
// src/game/types/GameTypes.ts additions

export type PlacementMode = 'idle' | 'active';

export interface PlacementStateData {
    isActive: boolean;
    selectedTowerType: TowerType | null;
    highlightedCell: GridPosition | null;
}

// src/game/data/gameplayConfig.ts

export interface GameplayConfig {
    speedMultiplier: number;
    zombieSpeedMultiplier: number;
    towerFireRateMultiplier: number;
}
```

**Existing Types Used** (no changes):
```typescript
export type TowerType = 'basic'; // From GameTypes.ts
export interface GridPosition { row: number; col: number; } // From GridTypes.ts
```

---

## Summary

**New Entities**: 
- PlacementState (scene-local state)
- GameplayConfig (static configuration)

**Modified Entities**:
- CoinTransaction (removed 'wave_completion' source)

**No Breaking Changes**: All modifications are additive or removals of existing logic. Existing entities (Grid, GameSession, Tower, Zombie) maintain their current interfaces with internal speed adjustments only.

**Type Safety**: All new fields have explicit TypeScript types. No `any` types used.
