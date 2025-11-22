// Base entity - player's objective that zombies attack
import { GridPosition } from '../types/GameTypes';
import { gridToScreen } from '../data/levelLayout';

export class Base {
    health: number;
    maxHealth: number;
    position: GridPosition;
    sprite: Phaser.GameObjects.Rectangle;
    healthText: Phaser.GameObjects.Text;
    private scene: Phaser.Scene;
    
    constructor(position: GridPosition, scene: Phaser.Scene, maxHealth: number = 10) {
        this.position = position;
        this.scene = scene;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        
        this.createSprite();
    }
    
    private createSprite(): void {
        const screenPos = gridToScreen(this.position);
        
        // Create base sprite - large blue building
        this.sprite = this.scene.add.rectangle(
            screenPos.x,
            screenPos.y,
            60,
            60,
            0x0000ff
        );
        this.sprite.setStrokeStyle(4, 0xffffff);
        
        // Create health text
        this.healthText = this.scene.add.text(
            screenPos.x,
            screenPos.y,
            `${this.health}`,
            {
                fontFamily: 'Arial Black',
                fontSize: 24,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
    }
    
    takeDamage(amount: number = 1): void {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        this.updateDisplay();
    }
    
    private updateDisplay(): void {
        this.healthText.setText(`${this.health}`);
        
        // Change color based on health
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent > 0.5) {
            this.sprite.setFillStyle(0x0000ff); // Blue
        } else if (healthPercent > 0.25) {
            this.sprite.setFillStyle(0xffaa00); // Orange
        } else {
            this.sprite.setFillStyle(0xff0000); // Red
        }
    }
    
    isDestroyed(): boolean {
        return this.health <= 0;
    }
    
    destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
        if (this.healthText) {
            this.healthText.destroy();
        }
    }
}
