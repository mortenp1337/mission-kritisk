// LogicChallenge scene - presents logic puzzles with multiple choice answers
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { LogicProblemGenerator } from '../systems/LogicProblemGenerator';
import { LogicProblem } from '../entities/LogicProblem';
import { ProblemType } from '../types/LogicTypes';
import { calculateWaveConfig } from '../data/waveConfig';

export class LogicChallenge extends Scene {
    private generator: LogicProblemGenerator;
    private currentProblem: LogicProblem | null;
    private problemIndex: number;
    private totalProblems: number;
    private session: GameSession;
    
    // UI elements
    private background: GameObjects.Image;
    private waveText: GameObjects.Text;
    private problemCounterText: GameObjects.Text;
    private questionText: GameObjects.Text;
    private answerButtons: GameObjects.Container[];
    private feedbackText: GameObjects.Text;
    private coinText: GameObjects.Text;
    
    constructor() {
        super('LogicChallenge');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.generator = new LogicProblemGenerator();
        this.currentProblem = null;
        this.problemIndex = 0;
        this.totalProblems = 3;  // 3 problems to match spec (FR-018)
        
        this.createUI();
        this.nextProblem();
    }
    
    private createUI(): void {
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Wave counter
        this.waveText = this.add.text(512, 50, DanishText.waveCounter(this.session.currentWave, 5), {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Problem counter
        this.problemCounterText = this.add.text(512, 100, '', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Question text (larger area for emoji display)
        this.questionText = this.add.text(512, 220, '', {
            fontFamily: 'Arial Black',
            fontSize: 40,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);
        
        // Feedback text (initially hidden)
        this.feedbackText = this.add.text(512, 320, '', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        this.feedbackText.setVisible(false);
        
        // Coin display
        this.coinText = this.add.text(50, 50, DanishText.coins + ' ' + this.session.coins, {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0, 0.5);
        
        // Answer buttons (will be populated when problem is loaded)
        this.answerButtons = [];
    }
    
    private nextProblem(): void {
        if (this.problemIndex >= this.totalProblems) {
            // All problems solved, transition to TowerPlacement
            this.scene.start('TowerPlacement');
            return;
        }
        
        this.problemIndex++;
        
        // Generate halves or doubles problem randomly
        const problemType: ProblemType = Math.random() > 0.5 ? 'halves' : 'doubles';
        this.currentProblem = this.generator.generate(this.session.difficulty, problemType);
        
        this.updateUI();
        this.createAnswerButtons();
    }
    
    private updateUI(): void {
        if (!this.currentProblem) return;
        
        this.problemCounterText.setText(DanishText.problemCounter(this.problemIndex, this.totalProblems));
        this.questionText.setText(this.currentProblem.getFormattedQuestion());
        this.feedbackText.setVisible(false);
    }
    
    private createAnswerButtons(): void {
        // Clear existing buttons
        this.answerButtons.forEach(btn => btn.destroy());
        this.answerButtons = [];
        
        if (!this.currentProblem) return;
        
        const options = this.currentProblem.options;
        const buttonWidth = 200;
        const buttonHeight = 100;
        const spacing = 40;
        
        // Layout: 2x2 grid, with empty slot for 3 options (like MathChallenge pattern)
        const startX = 512 - buttonWidth - spacing / 2;
        const startY = 450;
        
        options.forEach((option, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);
            
            const container = this.add.container(x, y);
            
            // Button background
            const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4444ff, 0.8);
            bg.setStrokeStyle(4, 0xffffff);
            bg.setInteractive({ useHandCursor: true });
            
            // Button text - show emoji representation
            const text = this.add.text(0, 0, option.emojiRepresentation, {
                fontFamily: 'Arial',
                fontSize: 32,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            container.add([bg, text]);
            this.answerButtons.push(container);
            
            // Button interactions
            bg.on('pointerdown', () => {
                this.handleAnswer(option.value);
            });
            
            bg.on('pointerover', () => {
                bg.setFillStyle(0x6666ff);
                container.setScale(1.1);
            });
            
            bg.on('pointerout', () => {
                bg.setFillStyle(0x4444ff);
                container.setScale(1.0);
            });
        });
    }
    
    private handleAnswer(answer: number): void {
        if (!this.currentProblem) return;
        
        const isCorrect = this.currentProblem.isCorrect(answer);
        
        if (isCorrect) {
            // Award coins (reuse existing coin reward logic from MathChallenge - FR-031)
            const waveConfig = calculateWaveConfig(this.session.currentWave);
            this.session.addCoins(waveConfig.rewards.coinPerProblem);
            this.session.incrementProblemsSolved();
            this.updateCoinDisplay();
            
            // Show positive feedback (green)
            this.showFeedback(DanishText.correct, 0x00ff00);
            
            // Proceed to next problem after delay
            this.time.delayedCall(1000, () => {
                this.nextProblem();
            });
        } else {
            this.currentProblem.decrementAttempts();
            
            if (!this.currentProblem.hasAttemptsRemaining()) {
                // Show correct answer and move on (FR-019)
                this.showFeedback(
                    DanishText.theAnswerIs(this.currentProblem.correctAnswer), 
                    0xff8800
                );
                
                this.time.delayedCall(2000, () => {
                    this.nextProblem();
                });
            } else {
                // Show try again feedback (yellow/red - FR-028)
                this.showFeedback(DanishText.tryAgain, 0xffff00);
            }
        }
    }
    
    private showFeedback(message: string, color: number): void {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
        this.feedbackText.setVisible(true);
        
        // Fade in effect (within 300ms - FR-028)
        this.feedbackText.setAlpha(0);
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
    }
    
    private updateCoinDisplay(): void {
        this.coinText.setText(DanishText.coins + ' ' + this.session.coins);
        
        // Pulse animation
        this.tweens.add({
            targets: this.coinText,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
}
