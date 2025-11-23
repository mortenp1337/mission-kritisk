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
        
        // Create bullet graphic
        const bullet = this.scene.add.circle(startX, startY, 5, 0xffff00);
        
        // Calculate initial direction and distance
        let dx = target.position.x - startX;
        let dy = target.position.y - startY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Bullet speed: 300 pixels per second
        const bulletSpeed = 300;
        let duration = (distance / bulletSpeed) * 1000; // Convert to milliseconds
        
        // Animate bullet toward target, updating target position each frame
        this.scene.tweens.add({
            targets: bullet,
            x: { from: startX, to: target.position.x },
            y: { from: startY, to: target.position.y },
            duration: duration,
            onUpdate: (tween) => {
                // Recalculate target position every frame for moving enemies
                if (target && target.sprite) {
                    const progress = tween.progress;
                    
                    // Calculate new direction to actual zombie position
                    const newDx = target.sprite.x - startX;
                    const newDy = target.sprite.y - startY;
                    const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);
                    
                    // Move bullet along updated direction
                    const moveDistance = bulletSpeed * (tween.elapsed / 1000) * this.scene.time.timeScale;
                    if (newDistance > 0) {
                        bullet.setPosition(
                            startX + (newDx / newDistance) * Math.min(moveDistance, newDistance),
                            startY + (newDy / newDistance) * Math.min(moveDistance, newDistance)
                        );
                    }
                }
            },
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
