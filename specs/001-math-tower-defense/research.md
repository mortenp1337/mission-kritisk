# Research: Math Tower Defense Game

**Purpose**: Resolve unknowns, establish best practices, and document technical decisions  
**Created**: 2025-11-22  
**Feature**: Math Tower Defense Game

## Research Areas

### 1. Phaser 3 Tower Defense Patterns

**Question**: What are the established patterns for implementing tower defense mechanics in Phaser 3?

**Decision**: Use object pooling for projectiles, Phaser's built-in arcade physics for collision detection, and timer events for tower fire rates.

**Rationale**:
- **Object Pooling**: Reusing projectile game objects prevents garbage collection spikes during intense combat. Phaser's `Group` class provides built-in pool management.
- **Arcade Physics**: Lightweight physics system perfect for 2D tower defense. Provides collision detection between projectiles and zombies without overhead of full physics simulation.
- **Timer Events**: `this.time.addEvent()` for tower fire rates ensures frame-rate independent timing, critical for consistent gameplay across different devices.

**Alternatives Considered**:
- Matter.js physics (rejected: too heavy for simple projectile/enemy collisions)
- Manual collision detection (rejected: reinventing the wheel, arcade physics is optimized)
- `setInterval` for fire rates (rejected: not frame-synced, can cause timing issues)

**Implementation Notes**:
- Create projectile pool in `DefenseWave` scene's `create()` method
- Each tower maintains a `Phaser.Time.TimerEvent` for its fire rate
- Use `this.physics.add.overlap(projectiles, zombies, handleHit)` for collision

---

### 2. 2D Grid System for Tower Placement

**Question**: How should the grid system be implemented for tower placement and pathfinding?

**Decision**: Use a 2D array representation (e.g., 15x10 grid) with cell types (empty/occupied/path/base), convert screen coordinates to grid positions for placement.

**Rationale**:
- **2D Array**: Simple `Cell[][]` structure maps directly to visual grid. Easy to check valid placement cells and query neighbors for pathfinding.
- **Cell Types**: Enum-based cell types (`CellType.Empty`, `CellType.Path`, etc.) make validation logic clear and extensible.
- **Coordinate Conversion**: `screenToGrid(x, y)` and `gridToScreen(row, col)` functions centralize conversion logic, preventing coordinate bugs.

**Alternatives Considered**:
- Tilemap system (rejected: overkill for simple grid, adds complexity)
- Free-form placement without grid (rejected: conflicts with spec requirement for grid-based placement)
- Hex grid (rejected: orthogonal grid is simpler and sufficient for MVP)

**Implementation Notes**:
```typescript
interface GridCell {
  type: CellType;
  tower: Tower | null;
  position: {row: number, col: number};
}

class Grid {
  private cells: GridCell[][];
  private cellSize = 64; // pixels
  
  isValidPlacement(row: number, col: number): boolean {
    return this.cells[row][col].type === CellType.Empty;
  }
}
```

---

### 3. Math Problem Generation by Grade Level

**Question**: How should grade-appropriate math problems be generated and validated?

**Decision**: Use problem templates with configurable ranges per grade, generate problems programmatically with distractor answer generation algorithm.

**Rationale**:
- **Templates**: Define operations and ranges per grade (e.g., Grade 0: `{a} + {b}` where `a, b ∈ [0,5]`). Allows easy difficulty tuning.
- **Programmatic Generation**: Reduces need for manual problem authoring. Can generate unlimited variations within grade constraints.
- **Distractor Algorithm**: Generate 3 incorrect answers near correct answer (±1-3 range) to make multiple choice challenging but fair.

**Alternatives Considered**:
- Static problem database (rejected: limits variety, requires extensive content creation)
- Pure random generation (rejected: can create confusing problems like 5-8 for grade 0)
- AI-generated problems (rejected: overkill for MVP, adds external dependency)

**Implementation Notes**:
```typescript
interface ProblemTemplate {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  rangeA: [number, number];
  rangeB: [number, number];
  displayFormat: string; // e.g., "{a} + {b} = ?"
}

const gradeTemplates: Record<number, ProblemTemplate[]> = {
  0: [{ operation: 'add', rangeA: [0, 5], rangeB: [0, 5], displayFormat: '{a} + {b} = ?' }],
  1: [
    { operation: 'add', rangeA: [0, 10], rangeB: [0, 10], displayFormat: '{a} + {b} = ?' },
    { operation: 'subtract', rangeA: [0, 10], rangeB: [0, 10], displayFormat: '{a} - {b} = ?' }
  ],
  // ... grades 2, 3
};

function generateDistractors(correct: number, count: number = 3): number[] {
  const distractors: number[] = [];
  const offsets = [-3, -2, -1, 1, 2, 3];
  
  while (distractors.length < count) {
    const offset = Phaser.Math.RND.pick(offsets);
    const distractor = Math.max(0, correct + offset);
    if (distractor !== correct && !distractors.includes(distractor)) {
      distractors.push(distractor);
    }
  }
  
  return distractors;
}
```

---

### 4. Difficulty Scaling Across Waves

**Question**: What's the best way to scale difficulty while keeping the game balanced for children?

**Decision**: Use compound scaling - increase zombie count by 20% per wave, increase zombie health by 1 per wave, keep speed constant until wave 4+ (then increase by 10%).

**Rationale**:
- **Graduated Scaling**: Multiple smaller increases feel smoother than one dramatic jump. Children have time to adapt strategy.
- **Health Before Speed**: Increasing health first rewards tower placement strategy. Speed increases later add urgency but don't invalidate earlier tower placement.
- **Percentage-Based**: 20% zombie count increase scales naturally (wave 1: 5 zombies, wave 2: 6, wave 3: 7, wave 4: 8, wave 5: 10).

**Alternatives Considered**:
- Linear scaling (rejected: +2 zombies per wave feels too predictable)
- Exponential scaling (rejected: too punishing, children may quit before wave 3)
- Speed-first scaling (rejected: punishes slower problem solvers, conflicts with educational focus)

**Implementation Notes**:
```typescript
interface WaveConfig {
  waveNumber: number;
  zombieCount: number;
  zombieHealth: number;
  zombieSpeed: number; // pixels per second
  coinRewardPerProblem: number;
}

function calculateWaveConfig(wave: number): WaveConfig {
  const baseZombies = 5;
  const baseHealth = 5;
  const baseSpeed = 50;
  const baseCoinReward = 10;
  
  return {
    waveNumber: wave,
    zombieCount: Math.floor(baseZombies * Math.pow(1.2, wave - 1)),
    zombieHealth: baseHealth + (wave - 1),
    zombieSpeed: wave >= 4 ? baseSpeed * (1 + (wave - 3) * 0.1) : baseSpeed,
    coinRewardPerProblem: baseCoinReward + (wave - 1) * 5
  };
}
```

---

### 5. Tower Targeting and Combat System

**Question**: How should towers select and engage targets?

**Decision**: Use "first in range" targeting with distance-based prioritization. Each tower maintains its own target lock until zombie is destroyed or leaves range.

**Rationale**:
- **First in Range**: Simple, predictable, teaches children about tower placement importance.
- **Target Lock**: Prevents towers from constantly retargeting, ensures projectiles don't go to waste mid-flight.
- **Distance Priority**: When multiple zombies enter range simultaneously, target closest to base to prevent leaks.

**Alternatives Considered**:
- Lowest health targeting (rejected: too complex for children to understand tower behavior)
- Random targeting (rejected: unpredictable, frustrating for players)
- Player-controlled targeting (rejected: too much micro-management, conflicts with "automatic" spec requirement)

**Implementation Notes**:
```typescript
class Tower extends Phaser.GameObjects.Sprite {
  private target: Zombie | null = null;
  private attackRange: number = 150; // pixels
  private fireRate: number = 1000; // milliseconds
  private lastFired: number = 0;
  
  update(time: number, zombies: Zombie[]): void {
    // Retarget if current target is invalid
    if (!this.target || !this.target.active || !this.isInRange(this.target)) {
      this.target = this.findTarget(zombies);
    }
    
    // Fire at target if available and fire rate ready
    if (this.target && time > this.lastFired + this.fireRate) {
      this.fireProjectile(this.target);
      this.lastFired = time;
    }
  }
  
  private findTarget(zombies: Zombie[]): Zombie | null {
    const inRange = zombies.filter(z => this.isInRange(z) && z.active);
    if (inRange.length === 0) return null;
    
    // Sort by distance to base (zombies further along path are priority)
    return inRange.sort((a, b) => b.pathProgress - a.pathProgress)[0];
  }
}
```

---

### 6. Scene Flow and State Management

**Question**: How should game state be passed between scenes (grade selection → math → tower placement → defense)?

**Decision**: Use Phaser's scene data passing via `this.scene.start('NextScene', { data })` combined with a global GameSession singleton for persistent state.

**Rationale**:
- **Scene Data**: Good for one-time transitions (passing selected grade from GradeSelection to MathChallenge).
- **GameSession Singleton**: Maintains state that persists across multiple scenes (coins, wave number, placed towers).
- **Hybrid Approach**: Best of both worlds - clean scene boundaries with shared state where needed.

**Alternatives Considered**:
- Global state only (rejected: tight coupling between scenes)
- Scene data only (rejected: can't maintain state when returning to previous scenes)
- Event bus (rejected: overkill for linear scene flow, harder to debug)

**Implementation Notes**:
```typescript
// Singleton pattern for game session
class GameSession {
  private static instance: GameSession;
  
  grade: number = 0;
  coins: number = 0;
  currentWave: number = 1;
  baseHealth: number = 10;
  placedTowers: Array<{type: string, position: {row: number, col: number}}> = [];
  
  static getInstance(): GameSession {
    if (!GameSession.instance) {
      GameSession.instance = new GameSession();
    }
    return GameSession.instance;
  }
  
  reset(): void {
    this.coins = 0;
    this.currentWave = 1;
    this.baseHealth = 10;
    this.placedTowers = [];
  }
}

// Scene transition example
// In MathChallenge scene after 5 problems solved:
const session = GameSession.getInstance();
this.scene.start('TowerPlacement', {
  coinsEarned: 50,
  waveNumber: session.currentWave
});
```

---

### 7. Danish Language Text Management

**Question**: How should Danish UI text be managed and displayed?

**Decision**: Create a centralized `DanishText` constants object with all UI strings, use TextStyle presets for consistent formatting.

**Rationale**:
- **Centralized Constants**: All Danish text in one place makes it easy to review for language correctness and consistency.
- **TextStyle Presets**: Ensures consistent typography across scenes (title style, button style, etc.).
- **Type Safety**: TypeScript ensures all text keys exist and are spelled correctly.

**Alternatives Considered**:
- Inline strings in scenes (rejected: scattered text hard to review, easy to miss English placeholders)
- JSON localization files (rejected: overkill for single language, adds parsing complexity)
- External CMS (rejected: MVP doesn't need dynamic content management)

**Implementation Notes**:
```typescript
// src/game/data/danishText.ts
export const DanishText = {
  gradeSelection: {
    title: 'Vælg Din Klasse',
    grades: ['Klasse 0', 'Klasse 1', 'Klasse 2', 'Klasse 3']
  },
  mathChallenge: {
    prompt: 'Løs opgaven:',
    correct: 'Rigtigt!',
    tryAgain: 'Prøv igen!',
    answer: 'Svar:',
    showAnswer: 'Svaret er:'
  },
  towerPlacement: {
    shopTitle: 'Tårn Butik',
    buyButton: 'Køb Tårn',
    notEnoughCoins: 'Ikke nok mønter!',
    noSpace: 'Ingen Plads!',
    startWave: 'Start Bølge',
    coinsLabel: 'Mønter:'
  },
  defenseWave: {
    waveComplete: 'Bølge Fuldført!',
    baseHealth: 'Base Helbred:',
    waveNumber: 'Bølge:'
  },
  gameOver: {
    victory: 'Niveau Fuldført!',
    defeat: 'Spil Tabt!',
    tryAgain: 'Prøv Igen!',
    buyMoreTowers: 'Køb Flere Tårne!',
    restart: 'Genstart'
  },
  towers: {
    basic: 'Basis Tårn',
    rapid: 'Hurtig Tårn',
    area: 'Område Tårn',
    upgrade: 'Opgradér'
  }
} as const;

// TextStyle presets
export const TextStyles = {
  title: {
    fontFamily: 'Arial Black',
    fontSize: 48,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
  },
  button: {
    fontFamily: 'Arial',
    fontSize: 24,
    color: '#000000'
  },
  label: {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#ffffff'
  }
};
```

---

### 8. Asset Organization and Loading

**Question**: How should game assets be organized and loaded efficiently?

**Decision**: Organize assets by category under `public/assets/math-tower-defense/`, load all assets in Preloader scene, use asset keys with consistent naming convention.

**Rationale**:
- **Category Organization**: Groups related assets (towers/, enemies/, ui/) for easy management and future expansion.
- **Preloader Loading**: Loads all assets upfront with progress bar. User waits once, then smooth gameplay without mid-scene loading.
- **Naming Convention**: Keys follow pattern `mtd-category-name` (e.g., `mtd-tower-basic`, `mtd-zombie`, `mtd-btn-buy`). Prevents key collisions with existing assets.

**Alternatives Considered**:
- Load assets per scene (rejected: causes loading delays between scenes, breaks game flow)
- Dynamic asset loading (rejected: adds complexity, not needed for fixed asset set)
- Single sprite atlas (rejected: MVP can use individual images, atlases for optimization later)

**Implementation Notes**:
```typescript
// In Preloader.ts preload() method
preload(): void {
  this.load.setPath('assets/math-tower-defense');
  
  // Towers
  this.load.image('mtd-tower-basic', 'towers/basic.png');
  this.load.image('mtd-tower-rapid', 'towers/rapid.png');
  this.load.image('mtd-tower-area', 'towers/area.png');
  
  // Enemies
  this.load.image('mtd-zombie', 'enemies/zombie.png');
  
  // Projectiles
  this.load.image('mtd-projectile-bullet', 'projectiles/bullet.png');
  this.load.image('mtd-projectile-explosion', 'projectiles/explosion.png');
  
  // UI
  this.load.image('mtd-btn-grade', 'ui/btn-grade.png');
  this.load.image('mtd-panel-shop', 'ui/panel-shop.png');
  this.load.image('mtd-grid-cell', 'ui/grid-cell.png');
  this.load.image('mtd-grid-highlight', 'ui/grid-highlight.png');
  
  // Reset path for other assets
  this.load.setPath('assets');
}
```

---

## Summary of Key Decisions

1. **Architecture**: Phaser 3 scene-based with 5 new scenes, object pooling for projectiles, arcade physics for collisions
2. **Grid System**: 2D array (15x10), cell-based placement with type checking, screen-to-grid coordinate conversion
3. **Math Problems**: Template-based generation per grade, algorithmic distractor creation, programmatic problem variation
4. **Difficulty Scaling**: Compound scaling (zombie count +20%, health +1, speed +10% from wave 4+), balanced progression
5. **Combat**: "First in range" targeting with distance prioritization, target locking, frame-rate independent timing
6. **State Management**: Hybrid approach using scene data passing + GameSession singleton for persistent state
7. **Danish Text**: Centralized DanishText constants, TextStyle presets, type-safe string access
8. **Assets**: Category-organized under math-tower-defense/, bulk loading in Preloader, mtd-* naming convention

All decisions align with Mission Kritisk Constitution requirements: scene-based architecture, bilingual implementation, type safety, and performance optimization for 60 FPS @ 1024x768.
