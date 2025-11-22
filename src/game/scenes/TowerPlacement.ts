// TowerPlacement scene - tower shop and placement (temporary stub)
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';

export class TowerPlacement extends Scene {
    private background: GameObjects.Image;
    private title: GameObjects.Text;
    private coinText: GameObjects.Text;
    private continueButton: GameObjects.Text;
    
    constructor() {
        super('TowerPlacement');
    }
    
    create() {
        const session = GameSession.getInstance();
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Title
        this.title = this.add.text(512, 150, 'Tower Placement', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Coin display
        this.coinText = this.add.text(512, 250, DanishText.coins + ' ' + session.coins, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Temporary message
        this.add.text(512, 350, 'Tower placement coming soon!', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Continue button (for now, loops back to MathChallenge or goes to menu)
        this.continueButton = this.add.text(512, 500, 'Back to Menu', {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        this.continueButton.setInteractive({ useHandCursor: true });
        this.continueButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        
        this.continueButton.on('pointerover', () => {
            this.continueButton.setScale(1.1);
        });
        
        this.continueButton.on('pointerout', () => {
            this.continueButton.setScale(1.0);
        });
    }
}
