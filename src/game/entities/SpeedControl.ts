import { Scene, GameObjects } from 'phaser';
import { SPEED_CONTROL } from '../constants/speedControl';

export class SpeedControl {
    private scene: Scene;
    private onSpeedChange: (speed: number) => void;
    
    private currentSpeed: number = 1.0;
    private readonly MIN_SPEED = SPEED_CONTROL.MIN_SPEED;
    private readonly MAX_SPEED = SPEED_CONTROL.MAX_SPEED;
    private readonly SPEED_STEP = SPEED_CONTROL.SPEED_STEP;
    private readonly DEBOUNCE_DELAY = SPEED_CONTROL.DEBOUNCE_DELAY;
    
    // UI elements
    private decreaseButton: GameObjects.Text;
    private displayText: GameObjects.Text;
    private increaseButton: GameObjects.Text;
    
    // Debounce tracking
    private lastClickTime: number = 0;
    
    constructor(scene: Scene, onSpeedChange: (speed: number) => void) {
        this.scene = scene;
        this.onSpeedChange = onSpeedChange || (() => {});
        
        this.createButtons();
    }
    
    private createButtons(): void {
        const decreaseX = 860;
        const displayX = 925;
        const increaseX = 990;
        const buttonY = 720;  // Bottom-right positioning to avoid UI overlap
        
        // Decrease button (−)
        this.decreaseButton = this.scene.add.text(decreaseX, buttonY, '−', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.decreaseButton.on('pointerdown', () => this.handleDecreaseClick());
        
        // Speed display
        this.displayText = this.scene.add.text(displayX, buttonY, this.formatSpeed(this.currentSpeed), {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
        
        // Increase button (+)
        this.increaseButton = this.scene.add.text(increaseX, buttonY, '+', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.increaseButton.on('pointerdown', () => this.handleIncreaseClick());
    }
    
    private handleDecreaseClick(): void {
        if (!this.canClick()) return;
        this.lastClickTime = Date.now();
        this.decreaseSpeed();
    }
    
    private handleIncreaseClick(): void {
        if (!this.canClick()) return;
        this.lastClickTime = Date.now();
        this.increaseSpeed();
    }
    
    private canClick(): boolean {
        const now = Date.now();
        return (now - this.lastClickTime) >= this.DEBOUNCE_DELAY;
    }
    
    public decreaseSpeed(): void {
        let newSpeed = this.currentSpeed - this.SPEED_STEP;
        newSpeed = Math.max(this.MIN_SPEED, newSpeed);
        this.setSpeed(newSpeed);
    }
    
    public increaseSpeed(): void {
        let newSpeed = this.currentSpeed + this.SPEED_STEP;
        newSpeed = Math.min(this.MAX_SPEED, newSpeed);
        this.setSpeed(newSpeed);
    }
    
    public setSpeed(multiplier: number): void {
        // Validate and clamp
        if (isNaN(multiplier) || multiplier === undefined) {
            console.error('Invalid speed value:', multiplier);
            return;
        }
        
        multiplier = Math.max(this.MIN_SPEED, Math.min(this.MAX_SPEED, multiplier));
        
        // No-op check
        if (multiplier === this.currentSpeed) return;
        
        // Update state
        this.currentSpeed = multiplier;
        this.updateDisplay(multiplier);
        this.onSpeedChange(multiplier);
    }
    
    public updateDisplay(speed: number): void {
        this.displayText.setText(this.formatSpeed(speed));
        
        // Update button states based on boundaries
        if (speed >= this.MAX_SPEED) {
            this.increaseButton.setAlpha(0.5);
            this.increaseButton.setInteractive({ useHandCursor: false });
        } else {
            this.increaseButton.setAlpha(1.0);
            this.increaseButton.setInteractive({ useHandCursor: true });
        }
        
        if (speed <= this.MIN_SPEED) {
            this.decreaseButton.setAlpha(0.5);
            this.decreaseButton.setInteractive({ useHandCursor: false });
        } else {
            this.decreaseButton.setAlpha(1.0);
            this.decreaseButton.setInteractive({ useHandCursor: true });
        }
    }
    
    private formatSpeed(speed: number): string {
        return `${speed.toFixed(1)}x`;
    }
    
    public getSpeed(): number {
        return this.currentSpeed;
    }
    
    public destroy(): void {
        if (this.decreaseButton) {
            this.decreaseButton.destroy();
        }
        if (this.displayText) {
            this.displayText.destroy();
        }
        if (this.increaseButton) {
            this.increaseButton.destroy();
        }
    }
}
