// ChallengeTypeMenu scene - displays available challenge types based on category and difficulty
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { ChallengeRegistry } from '../systems/ChallengeRegistry';
import { ChallengeCategory, ChallengeType } from '../types/ChallengeTypes';

export class ChallengeTypeMenu extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    backButton: GameObjects.Text;
    challengeButtons: GameObjects.Container[];
    
    constructor() {
        super('ChallengeTypeMenu');
    }
    
    create() {
        const session = GameSession.getInstance();
        const registry = ChallengeRegistry.getInstance();
        
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Title
        this.title = this.add.text(512, 150, DanishText.challengeTypeMenuTitle, {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Get available challenge types for current category and difficulty
        const category = session.category as ChallengeCategory;
        const availableTypes = registry.getChallengeTypes(category, session.difficulty);
        
        // Create challenge type buttons
        this.challengeButtons = [];
        const buttonWidth = 250;
        const buttonHeight = 100;
        const spacing = 30;
        const startY = 300;
        
        availableTypes.forEach((challengeType, index) => {
            const y = startY + index * (buttonHeight + spacing);
            const button = this.createChallengeButton(
                512,
                y,
                buttonWidth,
                buttonHeight,
                challengeType
            );
            this.challengeButtons.push(button);
        });
        
        // Back button
        this.backButton = this.add.text(100, 700, `← ${DanishText.backButton}`, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.backButton.setInteractive({ useHandCursor: true });
        this.backButton.on('pointerdown', () => {
            this.scene.start('CategorySelection');
        });
        
        this.backButton.on('pointerover', () => {
            this.backButton.setColor('#ffff00');
            this.backButton.setScale(1.1);
        });
        
        this.backButton.on('pointerout', () => {
            this.backButton.setColor('#ffffff');
            this.backButton.setScale(1.0);
        });
    }
    
    createChallengeButton(x: number, y: number, width: number, height: number, challengeType: ChallengeType): GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Button background
        const buttonBg = this.add.rectangle(0, 0, width, height, 0x4444ff, 0.8);
        buttonBg.setStrokeStyle(4, 0xffffff);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // Button text
        const buttonText = this.add.text(0, 0, challengeType.name, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        container.add(buttonBg);
        container.add(buttonText);
        
        // Button interactions
        buttonBg.on('pointerdown', () => {
            this.selectChallengeType(challengeType);
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
    
    selectChallengeType(challengeType: ChallengeType): void {
        const session = GameSession.getInstance();
        const registry = ChallengeRegistry.getInstance();
        
        session.setChallengeType(challengeType.id);
        
        // Get the target scene name and transition
        const sceneName = registry.getSceneName(challengeType.id);
        if (sceneName) {
            this.scene.start(sceneName);
        }
    }
}
