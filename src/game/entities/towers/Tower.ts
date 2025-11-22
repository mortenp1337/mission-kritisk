// Tower base class - defensive structure that targets and shoots enemies
import { GridPosition } from '../../types/GameTypes';
import { TowerStats } from '../../types/TowerTypes';
import { Zombie } from '../../types/EnemyTypes';

export abstract class Tower {
    id: string;
    type: string;
    position: GridPosition;
    level: number;
    
    // Combat stats
    protected attackDamage: number;
    protected attackRange: number;
    protected fireRate: number;
    protected lastFireTime: number;
    
    // Current target
    protected target: Zombie | null;
    
    // Visual
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    scene: Phaser.Scene;
    
    constructor(
        type: string,
        position: GridPosition,
        stats: TowerStats,
        scene: Phaser.Scene
    ) {
        this.id = `tower-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        this.type = type;
        this.position = position;
        this.level = 1;
        this.scene = scene;
        
        this.attackDamage = stats.attackDamage;
        this.attackRange = stats.attackRange;
        this.fireRate = stats.fireRate;
        this.lastFireTime = 0;
        
        this.target = null;
        
        // Subclasses should create the sprite
        this.sprite = this.createSprite();
    }
    
    protected abstract createSprite(): Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    
    update(time: number, zombies: Zombie[]): void {
        // Retarget if needed
        if (!this.target || !this.isValidTarget(this.target)) {
            this.target = this.findTarget(zombies);
        }
        
        // Fire if ready
        if (this.target && this.canFire(time)) {
            this.shoot(this.target);
            this.lastFireTime = time;
        }
    }
    
    protected findTarget(zombies: Zombie[]): Zombie | null {
        // Filter zombies in range and alive
        const zombiesInRange = zombies.filter(zombie => {
            if (!zombie || zombie.health <= 0) return false;
            const distance = this.distanceToZombie(zombie);
            return distance <= this.attackRange;
        });
        
        if (zombiesInRange.length === 0) {
            return null;
        }
        
        // Sort by path progress (descending) - target closest to base
        zombiesInRange.sort((a, b) => b.pathProgress - a.pathProgress);
        
        return zombiesInRange[0];
    }
    
    protected isValidTarget(zombie: Zombie): boolean {
        if (!zombie || zombie.health <= 0) {
            return false;
        }
        const distance = this.distanceToZombie(zombie);
        return distance <= this.attackRange;
    }
    
    protected canFire(time: number): boolean {
        return time >= this.lastFireTime + this.fireRate;
    }
    
    protected abstract shoot(target: Zombie): void;
    
    protected distanceToZombie(zombie: Zombie): number {
        const dx = zombie.position.x - this.sprite.x;
        const dy = zombie.position.y - this.sprite.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    upgrade(stats: TowerStats): void {
        if (this.level >= 2) {
            throw new Error('Tower already at max level');
        }
        
        this.level++;
        this.attackDamage = stats.attackDamage;
        this.attackRange = stats.attackRange;
        this.fireRate = stats.fireRate;
        
        // Visual update - make sprite slightly darker and larger
        if (this.sprite instanceof Phaser.GameObjects.Rectangle) {
            this.sprite.setScale(1.2);
        }
    }
    
    canUpgrade(): boolean {
        return this.level < 2;
    }
    
    getStats(): TowerStats {
        return {
            cost: 0, // Cost is in config
            attackDamage: this.attackDamage,
            attackRange: this.attackRange,
            fireRate: this.fireRate,
            upgradeCost: 0, // From config
            special: ''
        };
    }
    
    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}
