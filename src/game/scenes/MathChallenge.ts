// MathChallenge scene - presents math problems and awards coins
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { MathProblemGenerator } from '../systems/MathProblemGenerator';
import { MathProblem } from '../entities/MathProblem';
import { calculateWaveConfig } from '../data/waveConfig';

export class MathChallenge extends Scene {
    private generator: MathProblemGenerator;
    private currentProblem: MathProblem | null;
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
        super('MathChallenge');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.generator = new MathProblemGenerator();
        this.currentProblem = null;
        this.problemIndex = 0;
        this.totalProblems = 5;
        
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
        
        // Question text
        this.questionText = this.add.text(512, 200, '', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
        
        // Feedback text (initially hidden)
        this.feedbackText = this.add.text(512, 300, '', {
            fontFamily: 'Arial Black',
            fontSize: 36,
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
        // Use difficulty from session (maps to grade via difficulty - 1)
        const grade = this.session.difficulty - 1;
        this.currentProblem = this.generator.generate(grade, this.session.currentWave);
        
        this.updateUI();
        this.createAnswerButtons();
    }
    
    private updateUI(): void {
        if (!this.currentProblem) return;
        
        this.problemCounterText.setText(DanishText.problemCounter(this.problemIndex, this.totalProblems));
        this.questionText.setText(this.currentProblem.question);
        this.feedbackText.setVisible(false);
    }
    
    private createAnswerButtons(): void {
        // Clear existing buttons
        this.answerButtons.forEach(btn => btn.destroy());
        this.answerButtons = [];
        
        if (!this.currentProblem) return;
        
        const answers = this.currentProblem.allAnswers;
        const buttonWidth = 200;
        const buttonHeight = 100;
        const spacing = 40;
        const startX = 512 - buttonWidth - spacing / 2;
        const startY = 450;
        
        answers.forEach((answer, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);
            
            const container = this.add.container(x, y);
            
            // Button background
            const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x4444ff, 0.8);
            bg.setStrokeStyle(4, 0xffffff);
            bg.setInteractive({ useHandCursor: true });
            
            // Button text
            const text = this.add.text(0, 0, answer.toString(), {
                fontFamily: 'Arial Black',
                fontSize: 36,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            container.add([bg, text]);
            this.answerButtons.push(container);
            
            // Button interactions
            bg.on('pointerdown', () => {
                this.handleAnswer(answer);
            });
            
            bg.on('pointerover', () => {
                bg.setFillStyle(0x6666ff);
                text.setScale(1.1);
            });
            
            bg.on('pointerout', () => {
                bg.setFillStyle(0x4444ff);
                text.setScale(1.0);
            });
        });
    }
    
    private handleAnswer(answer: number): void {
        if (!this.currentProblem) return;
        
        this.currentProblem.incrementAttempt();
        const isCorrect = this.currentProblem.isCorrect(answer);
        
        if (isCorrect) {
            // Award coins
            const waveConfig = calculateWaveConfig(this.session.currentWave);
            this.session.addCoins(waveConfig.rewards.coinPerProblem);
            this.session.incrementProblemsSolved();
            this.updateCoinDisplay();
            
            // Show positive feedback
            this.showFeedback(DanishText.correct, 0x00ff00);
            
            // Proceed to next problem after delay
            this.time.delayedCall(1000, () => {
                this.nextProblem();
            });
        } else {
            if (this.currentProblem.hasReachedMaxAttempts()) {
                // Show correct answer and move on
                this.showFeedback(
                    DanishText.theAnswerIs(this.currentProblem.correctAnswer), 
                    0xff8800
                );
                
                this.time.delayedCall(2000, () => {
                    this.nextProblem();
                });
            } else {
                // Show try again feedback
                this.showFeedback(DanishText.tryAgain, 0xff0000);
            }
        }
    }
    
    private showFeedback(message: string, color: number): void {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
        this.feedbackText.setVisible(true);
        
        // Fade in effect
        this.feedbackText.setAlpha(0);
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 1,
            duration: 300,
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
