// DifficultySelection scene - allows children to select difficulty level (1-4)
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { DIFFICULTY_CONFIGS } from '../data/difficultyConfig';

export class DifficultySelection extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    difficultyButtons: GameObjects.Container[];
    
    constructor() {
        super('DifficultySelection');
    }
    
    create() {
        // Reset game session for new game
        const session = GameSession.getInstance();
        session.reset();
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Title
        this.title = this.add.text(512, 150, DanishText.difficultySelectionTitle, {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Create difficulty buttons in a 2x2 grid
        this.difficultyButtons = [];
        const buttonWidth = 200;
        const buttonHeight = 120;
        const spacing = 40;
        const startX = 512 - buttonWidth - spacing / 2;
        const startY = 350;
        
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);
            
            const difficultyConfig = DIFFICULTY_CONFIGS[i];
            const container = this.createDifficultyButton(x, y, buttonWidth, buttonHeight, difficultyConfig.level, difficultyConfig.label);
            this.difficultyButtons.push(container);
        }
        
        // Instructions
        this.add.text(512, 600, 'Vælg din sværhedsgrad', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    createDifficultyButton(x: number, y: number, width: number, height: number, level: number, label: string): GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Button background
        const buttonBg = this.add.rectangle(0, 0, width, height, 0x4444ff, 0.8);
        buttonBg.setStrokeStyle(4, 0xffffff);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // Button text - split label into main text and subtitle
        const parts = label.split(' - ');
        const mainText = parts[0];  // "Niveau X"
        const subtitle = parts[1] || '';  // "Begynder", etc.
        
        const buttonTextMain = this.add.text(0, subtitle ? -15 : 0, mainText, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        let buttonTextSub: GameObjects.Text | null = null;
        if (subtitle) {
            buttonTextSub = this.add.text(0, 15, subtitle, {
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);
        }
        
        container.add(buttonBg);
        container.add(buttonTextMain);
        if (buttonTextSub) {
            container.add(buttonTextSub);
        }
        
        // Button interactions
        buttonBg.on('pointerdown', () => {
            this.selectDifficulty(level);
        });
        
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x6666ff);
            container.setScale(1.1);
        });
        
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4444ff);
            container.setScale(1.0);
        });
        
        return container;
    }
    
    selectDifficulty(level: number): void {
        const session = GameSession.getInstance();
        session.setDifficulty(level);
        
        // Transition to CategorySelection scene
        this.scene.start('CategorySelection');
    }
}
