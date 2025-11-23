// DefenseWave scene - tower defense combat phase
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { Grid } from '../entities/Grid';
import { BasicTower } from '../entities/towers/BasicTower';
import { WaveManager } from '../systems/WaveManager';
import { Base } from '../entities/Base';
import { Zombie } from '../entities/enemies/Zombie';
import { SpeedControl } from '../entities/SpeedControl';

export class DefenseWave extends Scene {
    private session: GameSession;
    private grid: Grid;
    private towers: BasicTower[];
    private waveManager: WaveManager;
    private base: Base;
    private speedControl: SpeedControl;
    
    // UI elements
    private background: GameObjects.Image;
    private waveText: GameObjects.Text;
    private coinText: GameObjects.Text;
    private baseHealthText: GameObjects.Text;
    
    constructor() {
        super('DefenseWave');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.grid = new Grid();
        this.towers = [];
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);
        
        // Create grid visuals
        this.grid.createVisuals(this);
        
        // Create base
        this.base = new Base(this.grid.basePoint, this, this.session.baseHealth);
        
        // Restore towers from placement
        this.restoreTowers();
        
        // Initialize wave manager
        this.waveManager = new WaveManager();
        this.waveManager.initializeWave(this.session.currentWave, this.grid, this);
        
        this.createUI();
        
        // Start wave after a short delay
        this.time.delayedCall(1000, () => {
            this.waveManager.startWave();
        });
    }
    
    private createUI(): void {
        // Wave counter
        this.waveText = this.add.text(512, 30, DanishText.waveCounter(this.session.currentWave, 5), {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Coin display
        this.coinText = this.add.text(50, 30, DanishText.coins + ' ' + this.session.coins, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Base health display
        this.baseHealthText = this.add.text(950, 30, `Base: ${this.base.health}/${this.base.maxHealth}`, {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);
        
        // Speed control - initialized with callback to update scene's timeScale
        this.speedControl = new SpeedControl(this, (speed: number) => {
            this.time.timeScale = speed;
            this.session.setGameSpeed(speed);
        });
    }
    
    update(time: number, delta: number): void {
        // Update wave manager (spawns zombies, moves them)
        this.waveManager.update(time, delta);
        
        // Get active zombies
        const zombies = this.waveManager.getActiveZombies();
        
        // Update towers (targeting and firing)
        this.towers.forEach(tower => {
            tower.update(time, zombies);
        });
        
        // Check for zombies that reached the base
        const zombiesAtBase = this.waveManager.getZombiesReachedEnd();
        zombiesAtBase.forEach(zombie => {
            this.base.takeDamage(zombie.damageToBase);
            this.session.damageBase(zombie.damageToBase);
            this.waveManager.removeZombie(zombie);
            this.updateBaseHealthDisplay();
            
            // Check if base is destroyed
            if (this.base.isDestroyed()) {
                this.onGameOver(false);
            }
        });
        
        // Check if wave is complete
        if (this.waveManager.isWaveComplete() && !this.base.isDestroyed()) {
            this.onWaveComplete();
        }
    }
    
    private restoreTowers(): void {
        // Restore towers from session
        this.session.placedTowers.forEach(towerData => {
            const tower = new BasicTower(towerData.position, this);
            this.towers.push(tower);
            this.grid.placeTower(towerData.position.row, towerData.position.col, tower);
        });
    }
    
    private onWaveComplete(): void {
        // Reset speed to normal
        this.time.timeScale = 1.0;
        this.session.resetGameSpeed();
        
        // Show completion message (no coins awarded for wave completion)
        const message = this.add.text(512, 384, 
            DanishText.waveComplete, {
            fontFamily: 'Arial Black',
            fontSize: 36,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // Check if this was the last wave
        if (this.session.currentWave >= 5) {
            // Victory!
            this.time.delayedCall(2000, () => {
                this.scene.start('GameOver', { victory: true });
            });
        } else {
            // Continue to next wave
            this.session.incrementWave();
            
            this.time.delayedCall(2000, () => {
                this.scene.start('MathChallenge');
            });
        }
    }
    
    private onGameOver(victory: boolean): void {
        // Reset speed to normal
        this.time.timeScale = 1.0;
        this.session.resetGameSpeed();
        
        this.scene.start('GameOver', { victory });
    }
    
    private updateBaseHealthDisplay(): void {
        this.baseHealthText.setText(`Base: ${this.base.health}/${this.base.maxHealth}`);
        
        // Change color based on health
        const healthPercent = this.base.health / this.base.maxHealth;
        if (healthPercent > 0.5) {
            this.baseHealthText.setColor('#00ff00');
        } else if (healthPercent > 0.25) {
            this.baseHealthText.setColor('#ffaa00');
        } else {
            this.baseHealthText.setColor('#ff0000');
        }
    }
}
