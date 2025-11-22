// Zombie enemy - follows path and attacks base
import { Zombie as IZombie, ZombieStats } from '../../types/EnemyTypes';
import { ScreenPosition, GridPosition } from '../../types/GameTypes';

export class Zombie implements IZombie {
    id: string;
    health: number;
    maxHealth: number;
    speed: number;
    pathProgress: number;
    position: ScreenPosition;
    damageToBase: number;
    sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    healthBar?: Phaser.GameObjects.Graphics;
    
    private path: GridPosition[];
    private currentWaypointIndex: number;
    private scene: Phaser.Scene;
    
    constructor(
        stats: ZombieStats,
        path: GridPosition[],
        spawnPosition: ScreenPosition,
        scene: Phaser.Scene
    ) {
        this.id = `zombie-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.speed = stats.speed;
        this.pathProgress = 0;
        this.position = { ...spawnPosition };
        this.damageToBase = 1;
        this.path = path;
        this.currentWaypointIndex = 0;
        this.scene = scene;
        
        this.createSprite();
    }
    
    private createSprite(): void {
        // Create a green rectangle as placeholder zombie
        this.sprite = this.scene.add.rectangle(
            this.position.x,
            this.position.y,
            40,
            40,
            0x00ff00
        );
        this.sprite.setStrokeStyle(2, 0x000000);
        
        // Create health bar
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }
    
    update(delta: number, gridToScreen: (pos: GridPosition) => ScreenPosition): void {
        if (this.currentWaypointIndex >= this.path.length) {
            return; // Reached end
        }
        
        // Get target waypoint
        const targetWaypoint = this.path[this.currentWaypointIndex];
        const targetPos = gridToScreen(targetWaypoint);
        
        // Calculate direction to target
        const dx = targetPos.x - this.position.x;
        const dy = targetPos.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Reached waypoint, move to next
            this.currentWaypointIndex++;
            this.pathProgress = this.currentWaypointIndex / this.path.length;
        } else {
            // Move toward waypoint
            const moveDistance = (this.speed * delta) / 1000; // Convert delta to seconds
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            this.position.x += moveX;
            this.position.y += moveY;
        }
        
        // Update sprite position
        if (this.sprite) {
            this.sprite.setPosition(this.position.x, this.position.y);
        }
        
        // Update health bar
        this.updateHealthBar();
    }
    
    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        this.updateHealthBar();
    }
    
    private updateHealthBar(): void {
        if (!this.healthBar) return;
        
        this.healthBar.clear();
        
        // Health bar background (red)
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(
            this.position.x - 20,
            this.position.y - 30,
            40,
            4
        );
        
        // Health bar foreground (green)
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(
            this.position.x - 20,
            this.position.y - 30,
            40 * healthPercent,
            4
        );
    }
    
    hasReachedEnd(): boolean {
        return this.currentWaypointIndex >= this.path.length;
    }
    
    isAlive(): boolean {
        return this.health > 0;
    }
    
    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = undefined;
        }
        if (this.healthBar) {
            this.healthBar.destroy();
            this.healthBar = undefined;
        }
    }
}
