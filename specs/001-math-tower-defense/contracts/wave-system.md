# Wave System Contract

**Purpose**: Define interfaces for enemy spawning, wave management, and difficulty scaling  
**Created**: 2025-11-22

## Interfaces

### IWaveManager

**Responsibility**: Control zombie spawning, wave progression, and difficulty scaling.

```typescript
interface IWaveManager {
  /**
   * Initialize wave with configuration
   * @param waveNumber - Wave number (1-5)
   * @param grid - Grid system for path
   * @param scene - Phaser scene for zombie creation
   */
  initializeWave(waveNumber: number, grid: Grid, scene: Phaser.Scene): void;
  
  /**
   * Start spawning zombies for current wave
   */
  startWave(): void;
  
  /**
   * Update wave state each frame
   * @param time - Current game time
   * @param delta - Time since last frame
   */
  update(time: number, delta: number): void;
  
  /**
   * Check if wave is complete
   * @returns True if all zombies spawned and destroyed/reached base
   */
  isWaveComplete(): boolean;
  
  /**
   * Get current wave configuration
   * @returns Wave config data
   */
  getWaveConfig(): WaveConfig;
  
  /**
   * Get active zombies
   * @returns Array of alive zombies
   */
  getActiveZombies(): Zombie[];
}
```

### IPathFollowing

**Responsibility**: Handle zombie movement along predetermined paths.

```typescript
interface IPathFollowing {
  /**
   * Update zombie position along path
   * @param zombie - Zombie to move
   * @param path - Array of grid positions defining path
   * @param delta - Time since last frame (ms)
   */
  updateMovement(zombie: Zombie, path: GridPosition[], delta: number): void;
  
  /**
   * Check if zombie reached end of path
   * @param zombie - Zombie to check
   * @param path - Path array
   * @returns True if zombie reached base
   */
  hasReachedEnd(zombie: Zombie, path: GridPosition[]): boolean;
  
  /**
   * Get zombie progress along path
   * @param zombie - Zombie to check
   * @param path - Path array
   * @returns Progress value 0-1 (0=spawn, 1=base)
   */
  getPathProgress(zombie: Zombie, path: GridPosition[]): number;
}
```

## Type Definitions

### WaveConfig

```typescript
interface WaveConfig {
  waveNumber: number;
  zombieCount: number;
  zombieStats: {
    health: number;
    speed: number;          // pixels per second
  };
  spawnInterval: number;    // milliseconds between spawns
  rewards: {
    coinPerProblem: number;
    bonusCoins: number;     // awarded on wave completion
  };
}
```

### ZombieSpawnData

```typescript
interface ZombieSpawnData {
  id: string;
  health: number;
  speed: number;
  spawnTime: number;        // When to spawn (ms from wave start)
  position: ScreenPosition; // Spawn point
}
```

## Wave Configuration

```typescript
function calculateWaveConfig(waveNumber: number): WaveConfig {
  const baseZombies = 5;
  const baseHealth = 5;
  const baseSpeed = 50;      // pixels/second
  const baseCoinReward = 10;
  const bonusCoins = 25;
  const spawnInterval = 2000; // 2 seconds between spawns
  
  return {
    waveNumber,
    zombieCount: Math.floor(baseZombies * Math.pow(1.2, waveNumber - 1)),
    zombieStats: {
      health: baseHealth + (waveNumber - 1),
      speed: waveNumber >= 4 
        ? baseSpeed * (1 + (waveNumber - 3) * 0.1) 
        : baseSpeed
    },
    spawnInterval,
    rewards: {
      coinPerProblem: baseCoinReward + (waveNumber - 1) * 5,
      bonusCoins
    }
  };
}
```

**Wave Scaling Table**:
| Wave | Zombies | Health | Speed (px/s) | Coins/Problem | Bonus Coins |
|------|---------|--------|--------------|---------------|-------------|
| 1    | 5       | 5      | 50           | 10            | 25          |
| 2    | 6       | 6      | 50           | 15            | 25          |
| 3    | 7       | 7      | 50           | 20            | 25          |
| 4    | 8       | 8      | 55           | 25            | 25          |
| 5    | 10      | 9      | 60           | 30            | 25          |

## Behavior Specifications

### Zombie Spawning

**Spawn Sequence**:
```typescript
Wave starts at time T0
Zombie 1 spawns at T0 + 0ms
Zombie 2 spawns at T0 + 2000ms
Zombie 3 spawns at T0 + 4000ms
...
Zombie N spawns at T0 + (N-1) * 2000ms
```

**Spawn Process**:
1. Create zombie at spawn point
2. Initialize health, speed from WaveConfig
3. Assign unique ID
4. Add to active zombies array
5. Start path following behavior

### Path Following

**Movement Algorithm**:
```typescript
Each frame:
1. Calculate target position (next waypoint on path)
2. Calculate direction vector toward target
3. Move zombie: position += direction * speed * deltaTime
4. Check if reached waypoint:
   - If yes, advance to next waypoint
   - If at last waypoint, zombie reached base
5. Update pathProgress = current waypoint / total waypoints
```

**Waypoint Transition**:
- Zombie considered "at waypoint" when distance < 5 pixels
- Smooth transitions without stopping
- No diagonal movement (follow grid-aligned path)

### Wave Completion

**Completion Conditions**:
- All zombies have been spawned AND
- All zombies are either destroyed OR reached base

**Completion Actions**:
1. Award bonus coins (GameSession.coins += 25)
2. Check game state:
   - If baseHealth > 0: Advance to next wave
   - If baseHealth = 0: Game over (defeat)
   - If wave = 5 and baseHealth > 0: Victory
3. Transition to appropriate scene

## Example Usage

```typescript
// In DefenseWave scene
class DefenseWave extends Phaser.Scene {
  private waveManager: IWaveManager;
  private pathFollowing: IPathFollowing;
  
  create() {
    const session = GameSession.getInstance();
    
    // Initialize wave manager
    this.waveManager = new WaveManager();
    this.waveManager.initializeWave(session.currentWave, this.grid, this);
    
    // Start spawning
    this.waveManager.startWave();
  }
  
  update(time: number, delta: number) {
    // Update wave (spawns zombies, checks completion)
    this.waveManager.update(time, delta);
    
    // Get active zombies for tower targeting
    const zombies = this.waveManager.getActiveZombies();
    
    // Update zombie movement
    zombies.forEach(zombie => {
      this.pathFollowing.updateMovement(zombie, this.grid.path, delta);
      
      // Check if reached base
      if (this.pathFollowing.hasReachedEnd(zombie, this.grid.path)) {
        this.onZombieReachedBase(zombie);
      }
    });
    
    // Check wave completion
    if (this.waveManager.isWaveComplete()) {
      this.onWaveComplete();
    }
  }
  
  private onZombieReachedBase(zombie: Zombie): void {
    const session = GameSession.getInstance();
    session.baseHealth -= 1;
    zombie.destroy();
    
    if (session.baseHealth <= 0) {
      this.scene.start('GameOver', { victory: false });
    }
  }
  
  private onWaveComplete(): void {
    const session = GameSession.getInstance();
    const config = this.waveManager.getWaveConfig();
    
    // Award bonus coins
    session.coins += config.rewards.bonusCoins;
    
    if (session.currentWave >= 5) {
      // Victory!
      this.scene.start('GameOver', { victory: true });
    } else {
      // Next wave
      session.currentWave++;
      this.scene.start('MathChallenge');
    }
  }
}
```

## Validation Rules

- Wave number must be 1-5
- Zombie count must be > 0
- Zombie health must be > 0
- Zombie speed must be > 0
- Spawn interval must be >= 1000ms
- Path must have at least 2 waypoints (spawn → base)
- All spawned zombies must be tracked

## Performance Considerations

- **Object Pooling**: Reuse zombie objects (pool size: 20)
- **Path Caching**: Pre-calculate screen positions for waypoints
- **Movement Updates**: Only update active zombies
- **Spawn Scheduling**: Use Phaser timer events for spawning
- **Collision Checks**: Only check zombies in tower range (spatial partitioning future optimization)

## Edge Cases

- **All towers destroyed**: Zombies still spawn, wave continues
- **Base destroyed mid-spawn**: Stop spawning, transition to game over
- **Zombie stuck**: Timeout after 60 seconds without progress → force destroy
- **Zero zombies config**: Should never happen, but default to 1 zombie minimum
