# Tower System Contract

**Purpose**: Define interfaces for tower creation, placement, targeting, and combat  
**Created**: 2025-11-22

## Interfaces

### ITowerFactory

**Responsibility**: Create tower instances based on type.

```typescript
interface ITowerFactory {
  /**
   * Create a tower of specified type
   * @param type - Tower variant (basic/rapid/area)
   * @param position - Grid position for placement
   * @param scene - Phaser scene for sprite creation
   * @returns Tower instance
   */
  createTower(type: TowerType, position: GridPosition, scene: Phaser.Scene): Tower;
  
  /**
   * Get tower cost
   * @param type - Tower variant
   * @returns Cost in coins
   */
  getTowerCost(type: TowerType): number;
  
  /**
   * Get tower stats for display
   * @param type - Tower variant
   * @param level - Tower level (1-2)
   * @returns Tower statistics
   */
  getTowerStats(type: TowerType, level: number): TowerStats;
}
```

### ITower

**Responsibility**: Base interface for all tower types.

```typescript
interface ITower {
  readonly id: string;
  readonly type: TowerType;
  readonly position: GridPosition;
  level: number;
  
  /**
   * Update tower state each frame
   * @param time - Current game time
   * @param zombies - Array of active zombies
   */
  update(time: number, zombies: Zombie[]): void;
  
  /**
   * Upgrade tower to next level
   * @returns Upgrade cost in coins
   */
  upgrade(): number;
  
  /**
   * Check if tower can upgrade
   * @returns True if upgrade available
   */
  canUpgrade(): boolean;
  
  /**
   * Get current tower stats
   * @returns Tower statistics
   */
  getStats(): TowerStats;
  
  /**
   * Destroy tower and cleanup
   */
  destroy(): void;
}
```

### ICombatSystem

**Responsibility**: Handle tower targeting, projectile firing, and damage application.

```typescript
interface ICombatSystem {
  /**
   * Find best target for tower
   * @param tower - Tower searching for target
   * @param zombies - Array of active zombies
   * @returns Best zombie to target or null
   */
  findTarget(tower: Tower, zombies: Zombie[]): Zombie | null;
  
  /**
   * Fire projectile from tower to target
   * @param tower - Tower firing
   * @param target - Target zombie
   * @param scene - Phaser scene for projectile creation
   * @returns Created projectile
   */
  fireProjectile(tower: Tower, target: Zombie, scene: Phaser.Scene): Projectile;
  
  /**
   * Apply damage to zombie
   * @param zombie - Target zombie
   * @param damage - Damage amount
   * @param source - Tower that dealt damage
   * @returns True if zombie was destroyed
   */
  applyDamage(zombie: Zombie, damage: number, source: Tower): boolean;
  
  /**
   * Apply area damage to multiple zombies
   * @param center - Explosion center position
   * @param radius - Effect radius in pixels
   * @param damage - Damage amount
   * @param zombies - Array of all zombies
   * @returns Number of zombies hit
   */
  applyAreaDamage(center: ScreenPosition, radius: number, damage: number, zombies: Zombie[]): number;
}
```

## Type Definitions

### TowerType

```typescript
enum TowerType {
  Basic = 'basic',
  Rapid = 'rapid',
  Area = 'area'
}
```

### TowerStats

```typescript
interface TowerStats {
  cost: number;
  attackDamage: number;
  attackRange: number;      // pixels
  fireRate: number;         // milliseconds
  upgradeCost: number;
  special: string;          // Description of special ability
}
```

### TowerConfig

```typescript
const TOWER_CONFIG: Record<TowerType, TowerStats[]> = {
  [TowerType.Basic]: [
    // Level 1
    { cost: 50, attackDamage: 2, attackRange: 150, fireRate: 1000, upgradeCost: 30, special: 'None' },
    // Level 2
    { cost: 80, attackDamage: 3, attackRange: 180, fireRate: 1000, upgradeCost: 0, special: 'None' }
  ],
  [TowerType.Rapid]: [
    // Level 1
    { cost: 100, attackDamage: 1, attackRange: 120, fireRate: 500, upgradeCost: 50, special: 'High fire rate' },
    // Level 2
    { cost: 150, attackDamage: 2, attackRange: 140, fireRate: 500, upgradeCost: 0, special: 'High fire rate' }
  ],
  [TowerType.Area]: [
    // Level 1
    { cost: 150, attackDamage: 3, attackRange: 180, fireRate: 1500, upgradeCost: 75, special: 'Area damage (128px radius)' },
    // Level 2
    { cost: 225, attackDamage: 4, attackRange: 200, fireRate: 1500, upgradeCost: 0, special: 'Area damage (150px radius)' }
  ]
};
```

## Behavior Specifications

### Targeting Algorithm

**Priority Order**:
1. Check if current target is still valid (alive, in range)
2. If no valid target, find new target:
   - Filter zombies: alive AND in range
   - Sort by path progress (descending) - target closest to base
   - Select first zombie from sorted list

**Target Locking**:
- Tower maintains target until:
  - Target is destroyed
  - Target leaves attack range
  - No manual retargeting

### Firing Mechanism

**Fire Rate Control**:
```typescript
if (hasValidTarget && currentTime >= lastFired + fireRate) {
  fireProjectile(target);
  lastFired = currentTime;
}
```

**Projectile Creation**:
- Basic/Rapid: Create BulletProjectile
- Area: Create AreaProjectile
- Pooling: Reuse inactive projectiles from pool
- Direction: Calculate angle from tower to target position

### Damage Application

**Single Target**:
```
zombie.health -= damage;
if (zombie.health <= 0) {
  zombie.destroy();
  return true; // zombie destroyed
}
return false;
```

**Area Effect**:
```
For each zombie in zombies:
  distance = distanceBetween(zombie.position, explosionCenter);
  if (distance <= radius) {
    applyDamage(zombie, damage);
    zombiesHit++;
  }
return zombiesHit;
```

### Upgrade System

**Upgrade Process**:
1. Check `tower.level < 2`
2. Deduct upgrade cost from coins
3. Increment tower.level
4. Update stats from TOWER_CONFIG[type][level]
5. Update sprite appearance (color/size change)

**Visual Indicators**:
- Level 1: Base color
- Level 2: Darker shade + larger sprite

## Example Usage

```typescript
const factory: ITowerFactory = new TowerFactory();
const combat: ICombatSystem = new CombatSystem();

// Create basic tower
const tower = factory.createTower(TowerType.Basic, {row: 5, col: 7}, scene);

// Update loop in DefenseWave scene
update(time: number) {
  const zombies = this.getActiveZombies();
  
  this.towers.forEach(tower => {
    tower.update(time, zombies);
  });
}

// Tower.update() implementation
update(time: number, zombies: Zombie[]): void {
  // Retarget if needed
  if (!this.target || !this.isInRange(this.target)) {
    this.target = combat.findTarget(this, zombies);
  }
  
  // Fire if ready
  if (this.target && time >= this.lastFired + this.fireRate) {
    const projectile = combat.fireProjectile(this, this.target, this.scene);
    this.lastFired = time;
  }
}

// Projectile hit callback
onProjectileHit(projectile: Projectile, zombie: Zombie): void {
  if (projectile.type === 'explosion') {
    combat.applyAreaDamage(projectile.position, 128, projectile.damage, this.zombies);
  } else {
    combat.applyDamage(zombie, projectile.damage, projectile.source);
  }
  projectile.returnToPool();
}
```

## Validation Rules

- Tower placement: Must be on empty grid cell
- Purchase: Must have sufficient coins
- Upgrade: Must be level 1, have sufficient coins
- Targeting: Target must be alive and in range
- Firing: Fire rate cooldown must be elapsed
- Area damage: Radius must be positive, center must be valid

## Performance Considerations

- **Object Pooling**: Reuse projectile objects (pool size: 50)
- **Range Checks**: Cache attack range squared to avoid sqrt calculations
- **Target Filtering**: Filter once per frame, not per tower
- **Sprite Updates**: Only update rotation when target changes
