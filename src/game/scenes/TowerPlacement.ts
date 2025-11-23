// TowerPlacement scene - tower shop and grid placement
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { Grid } from '../entities/Grid';
import { BasicTower } from '../entities/towers/BasicTower';
import { getTowerCost } from '../data/towerConfig';
import { TowerType } from '../types/GameTypes';

export class TowerPlacement extends Scene {
    private session: GameSession;
    private grid: Grid;
    private towers: BasicTower[];
    
    // UI elements
    private background: GameObjects.Image;
    private waveText: GameObjects.Text;
    private coinText: GameObjects.Text;
    private buyTowerButton: GameObjects.Rectangle;
    private buyTowerText: GameObjects.Text;
    private startWaveButton: GameObjects.Rectangle;
    private startWaveText: GameObjects.Text;
    private feedbackText: GameObjects.Text;
    
    // Tower placement state
    private placementMode: boolean;
    private selectedTowerType: string;
    private highlightedCell: Phaser.GameObjects.Rectangle | null;
    
    constructor() {
        super('TowerPlacement');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.grid = new Grid();
        this.towers = [];
        this.placementMode = false;
        this.selectedTowerType = 'basic';
        this.highlightedCell = null;
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);
        
        // Create grid visuals
        this.grid.createVisuals(this);
        
        // Restore towers from previous waves
        this.restoreTowers();
        
        this.createUI();
        this.setupInput();
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
        
        // Buy Tower button
        const towerCost = getTowerCost('basic');
        this.buyTowerButton = this.add.rectangle(900, 100, 200, 60, 0x4444ff, 0.8);
        this.buyTowerButton.setStrokeStyle(3, 0xffffff);
        this.buyTowerButton.setInteractive({ useHandCursor: true });
        
        this.buyTowerText = this.add.text(900, 100, 
            `${DanishText.buyTower}\n(${towerCost} ${DanishText.coins.toLowerCase()})`, {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        this.buyTowerButton.on('pointerdown', () => this.enterPlacementMode());
        this.buyTowerButton.on('pointerover', () => this.buyTowerButton.setFillStyle(0x6666ff));
        this.buyTowerButton.on('pointerout', () => this.buyTowerButton.setFillStyle(0x4444ff));
        
        // Start Wave button
        this.startWaveButton = this.add.rectangle(900, 200, 200, 60, 0x00aa00, 0.8);
        this.startWaveButton.setStrokeStyle(3, 0xffffff);
        this.startWaveButton.setInteractive({ useHandCursor: true });
        
        this.startWaveText = this.add.text(900, 200, DanishText.startWave, {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        this.startWaveButton.on('pointerdown', () => this.startDefenseWave());
        this.startWaveButton.on('pointerover', () => this.startWaveButton.setFillStyle(0x00ff00));
        this.startWaveButton.on('pointerout', () => this.startWaveButton.setFillStyle(0x00aa00));
        
        // Feedback text
        this.feedbackText = this.add.text(512, 720, '', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
    }
    
    private setupInput(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.placementMode) return;
            
            const gridPos = this.grid.screenToGrid(pointer.x, pointer.y);
            if (gridPos) {
                this.tryPlaceTower(gridPos.row, gridPos.col);
            }
        });
        
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.placementMode) return;
            
            const gridPos = this.grid.screenToGrid(pointer.x, pointer.y);
            this.updateHighlight(gridPos);
        });
        
        // ESC key to cancel placement mode
        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.placementMode) {
                this.exitPlacementMode();
            }
        });
    }
    
    private enterPlacementMode(): void {
        const towerCost = getTowerCost(this.selectedTowerType);
        
        if (this.session.coins < towerCost) {
            this.showFeedback(DanishText.notEnoughCoins);
            return;
        }
        
        this.placementMode = true;
        this.feedbackText.setText(DanishText.selectPlacement);
    }
    
    private updateHighlight(gridPos: { row: number; col: number } | null): void {
        // Remove old highlight
        if (this.highlightedCell) {
            this.highlightedCell.destroy();
            this.highlightedCell = null;
        }
        
        if (!gridPos) return;
        
        const screenPos = this.grid.gridToScreen(gridPos.row, gridPos.col);
        const isValid = this.grid.isValidPlacement(gridPos.row, gridPos.col);
        const color = isValid ? 0x00ff00 : 0xff0000;
        
        this.highlightedCell = this.add.rectangle(
            screenPos.x,
            screenPos.y,
            60,
            60
        );
        this.highlightedCell.setStrokeStyle(3, color);
        this.highlightedCell.setFillStyle(color, 0.2);
    }
    
    private tryPlaceTower(row: number, col: number): void {
        const towerCost = getTowerCost(this.selectedTowerType);
        
        if (!this.grid.isValidPlacement(row, col)) {
            this.showFeedback(DanishText.noSpace);
            return;
        }
        
        if (!this.session.spendCoins(towerCost)) {
            this.showFeedback(DanishText.notEnoughCoins);
            return;
        }
        
        // Create tower
        const tower = new BasicTower({ row, col }, this);
        this.towers.push(tower);
        this.grid.placeTower(row, col, tower);
        
        // Save to session
        this.session.placeTower({
            type: TowerType.Basic,
            position: { row, col },
            level: 1
        });
        
        // Update UI and show success feedback
        this.updateCoinDisplay();
        this.showFeedback(DanishText.towerPlaced);
        this.exitPlacementMode();
    }
    
    private exitPlacementMode(): void {
        this.placementMode = false;
        this.feedbackText.setText('');
        
        if (this.highlightedCell) {
            this.highlightedCell.destroy();
            this.highlightedCell = null;
        }
    }
    
    private restoreTowers(): void {
        // Restore towers from previous waves
        this.session.placedTowers.forEach(towerData => {
            const tower = new BasicTower(towerData.position, this);
            this.towers.push(tower);
            this.grid.placeTower(towerData.position.row, towerData.position.col, tower);
        });
    }
    
    private startDefenseWave(): void {
        this.scene.start('DefenseWave');
    }
    
    private showFeedback(message: string): void {
        this.feedbackText.setText(message);
        
        this.time.delayedCall(2000, () => {
            this.feedbackText.setText('');
        });
    }
    
    private updateCoinDisplay(): void {
        this.coinText.setText(DanishText.coins + ' ' + this.session.coins);
    }
}
