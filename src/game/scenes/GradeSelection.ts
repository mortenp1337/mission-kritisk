// GradeSelection scene - allows children to select their grade level (0-3)
// DEPRECATED: This scene is replaced by DifficultySelection which uses difficulty levels (1-4)
// instead of grade levels (0-3). This scene is kept for backward compatibility but should
// not be used in new code. Use DifficultySelection → CategorySelection → ChallengeTypeMenu flow instead.
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';

export class GradeSelection extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    gradeButtons: GameObjects.Text[];
    
    constructor() {
        super('GradeSelection');
    }
    
    create() {
        // Reset game session for new game
        const session = GameSession.getInstance();
        session.reset();
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Title
        this.title = this.add.text(512, 150, DanishText.gradeSelectionTitle, {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Create grade buttons in a 2x2 grid
        this.gradeButtons = [];
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
            
            // Button background
            const buttonBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x4444ff, 0.8);
            buttonBg.setStrokeStyle(4, 0xffffff);
            buttonBg.setInteractive({ useHandCursor: true });
            
            // Button text
            const buttonText = this.add.text(x, y, DanishText.gradeLabels[i], {
                fontFamily: 'Arial Black',
                fontSize: 32,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            this.gradeButtons.push(buttonText);
            
            // Button interactions
            const grade = i;
            buttonBg.on('pointerdown', () => {
                this.selectGrade(grade);
            });
            
            buttonBg.on('pointerover', () => {
                buttonBg.setFillStyle(0x6666ff);
                buttonText.setScale(1.1);
            });
            
            buttonBg.on('pointerout', () => {
                buttonBg.setFillStyle(0x4444ff);
                buttonText.setScale(1.0);
            });
        }
        
        // Instructions
        this.add.text(512, 600, 'Vælg din klasse', {  // Could add to DanishText
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    selectGrade(grade: number): void {
        const session = GameSession.getInstance();
        session.setGrade(grade);
        
        // Transition to MathChallenge scene
        this.scene.start('MathChallenge');
    }
}
