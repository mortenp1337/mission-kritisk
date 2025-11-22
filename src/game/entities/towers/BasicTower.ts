// BasicTower - standard single-target tower
import { Tower } from './Tower';
import { GridPosition } from '../../types/GameTypes';
import { TowerStats } from '../../types/TowerTypes';
import { Zombie } from '../../types/EnemyTypes';
import { getTowerStats } from '../../data/towerConfig';
import { gridToScreen } from '../../data/levelLayout';

export class BasicTower extends Tower {
    constructor(position: GridPosition, scene: Phaser.Scene) {
        const stats = getTowerStats('basic', 1);
        super('basic', position, stats, scene);
    }
    
    protected createSprite(): Phaser.GameObjects.Rectangle {
        const screenPos = gridToScreen(this.position);
        
        // Create a blue square as placeholder
        const sprite = this.scene.add.rectangle(
            screenPos.x,
            screenPos.y,
            50,
            50,
            0x0000ff
        );
        
        sprite.setStrokeStyle(2, 0xffffff);
        
        return sprite;
    }
    
    protected shoot(target: Zombie): void {
        // Create a bullet projectile
        this.createBullet(target);
    }
    
    private createBullet(target: Zombie): void {
        // Simple projectile - will be replaced with proper projectile system later
        const startX = this.sprite.x;
        const startY = this.sprite.y;
        const endX = target.position.x;
        const endY = target.position.y;
        
        // Create bullet graphic
        const bullet = this.scene.add.circle(startX, startY, 5, 0xffff00);
        
        // Animate bullet to target
        this.scene.tweens.add({
            targets: bullet,
            x: endX,
            y: endY,
            duration: 200,
            onComplete: () => {
                // Apply damage using proper method
                if (target && target.health > 0) {
                    target.takeDamage(this.attackDamage);
                    
                    // Check if zombie died
                    if (target.health <= 0 && target.sprite) {
                        target.sprite.destroy();
                        if (target.healthBar) {
                            target.healthBar.destroy();
                        }
                    }
                }
                bullet.destroy();
            }
        });
    }
}
