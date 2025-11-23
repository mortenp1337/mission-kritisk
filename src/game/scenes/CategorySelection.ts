// CategorySelection scene - allows children to select challenge category (Math or Logic)
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { ChallengeCategory } from '../types/ChallengeTypes';
import { CATEGORY_NAMES } from '../data/challengeCategories';

export class CategorySelection extends Scene {
    background: GameObjects.Image;
    title: GameObjects.Text;
    backButton: GameObjects.Text;
    categoryButtons: GameObjects.Container[];
    
    constructor() {
        super('CategorySelection');
    }
    
    create() {
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Title
        this.title = this.add.text(512, 150, DanishText.categorySelectionTitle, {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Create category buttons (2 buttons centered vertically)
        this.categoryButtons = [];
        const buttonWidth = 250;
        const buttonHeight = 120;
        const spacing = 60;
        const startY = 350;
        
        // Math category button
        const mathButton = this.createCategoryButton(
            512,
            startY,
            buttonWidth,
            buttonHeight,
            CATEGORY_NAMES[ChallengeCategory.Math],
            ChallengeCategory.Math
        );
        this.categoryButtons.push(mathButton);
        
        // Logic category button
        const logicButton = this.createCategoryButton(
            512,
            startY + buttonHeight + spacing,
            buttonWidth,
            buttonHeight,
            CATEGORY_NAMES[ChallengeCategory.Logic],
            ChallengeCategory.Logic
        );
        this.categoryButtons.push(logicButton);
        
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
            this.scene.start('DifficultySelection');
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
    
    createCategoryButton(x: number, y: number, width: number, height: number, label: string, category: ChallengeCategory): GameObjects.Container {
        const container = this.add.container(x, y);
        
        // Button background
        const buttonBg = this.add.rectangle(0, 0, width, height, 0x4444ff, 0.8);
        buttonBg.setStrokeStyle(4, 0xffffff);
        buttonBg.setInteractive({ useHandCursor: true });
        
        // Button text
        const buttonText = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        container.add(buttonBg);
        container.add(buttonText);
        
        // Button interactions
        buttonBg.on('pointerdown', () => {
            this.selectCategory(category);
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
    
    selectCategory(category: ChallengeCategory): void {
        const session = GameSession.getInstance();
        session.setCategory(category);
        
        // Transition to ChallengeTypeMenu scene
        this.scene.start('ChallengeTypeMenu');
    }
}
