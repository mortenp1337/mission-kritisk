// BaseChallengeScene - abstract base class for challenge scenes (Math, Logic)
// Provides common answer handling logic and UI management
import { Scene, GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { calculateWaveConfig } from '../data/waveConfig';
import { WAVE_PROGRESSION } from '../data/gameplayConfig';

export abstract class BaseChallengeScene extends Scene {
    protected session: GameSession;
    protected problemIndex: number;
    protected totalProblems: number;
    
    // UI elements (common across challenge types)
    protected background: GameObjects.Image;
    protected waveText: GameObjects.Text;
    protected problemCounterText: GameObjects.Text;
    protected questionText: GameObjects.Text;
    protected answerButtons: GameObjects.Container[];
    protected feedbackText: GameObjects.Text;
    protected coinText: GameObjects.Text;
    
    constructor(key: string) {
        super(key);
    }
    
    /**
     * Abstract method: Generate the next problem
     * Subclasses must implement this to create their specific problem type
     */
    protected abstract generateProblem(): void;
    
    /**
     * Abstract method: Get the correct answer for the current problem
     * Subclasses must implement this to return the correct answer value
     */
    protected abstract getCurrentCorrectAnswer(): number;
    
    /**
     * Abstract method: Check if max attempts reached for current problem
     * Subclasses must implement this to check attempt limits
     */
    protected abstract hasReachedMaxAttempts(): boolean;
    
    /**
     * Abstract method: Increment attempt counter for current problem
     * Subclasses must implement this to track attempts
     */
    protected abstract incrementAttempt(): void;
    
    /**
     * Common UI creation logic
     */
    protected createBaseUI(): void {
        // Background
        this.background = this.add.image(512, 384, 'background');
        
        // Wave counter
        this.waveText = this.add.text(512, 50, DanishText.waveCounter(this.session.currentWave, WAVE_PROGRESSION.TOTAL_WAVES), {
            fontFamily: 'Arial Black',
            fontSize: 28,
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Problem counter
        this.problemCounterText = this.add.text(512, 120, '', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        // Question text
        this.questionText = this.add.text(512, 200, '', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);
        
        // Feedback text
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
        
        // Answer buttons (will be populated by subclasses)
        this.answerButtons = [];
    }
    
    /**
     * Common answer handling logic
     * Handles correct/incorrect answers, coin rewards, and progression
     */
    protected handleAnswer(answer: number): void {
        this.incrementAttempt();
        const isCorrect = answer === this.getCurrentCorrectAnswer();
        
        if (isCorrect) {
            // Award coins - always 25 coins per correct answer
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
            // Wrong answer
            if (this.hasReachedMaxAttempts()) {
                // Show correct answer and move on
                this.showFeedback(
                    DanishText.theAnswerIs(this.getCurrentCorrectAnswer()), 
                    0xff8800
                );
                
                this.time.delayedCall(2000, () => {
                    this.nextProblem();
                });
            } else {
                // Show try again feedback (yellow)
                this.showFeedback(DanishText.tryAgain, 0xffff00);
            }
        }
    }
    
    /**
     * Progress to next problem or complete challenge
     */
    protected nextProblem(): void {
        if (this.problemIndex >= this.totalProblems) {
            // All problems solved - increment wave BEFORE going to tower placement
            this.session.incrementWave();
            this.scene.start('TowerPlacement');
            return;
        }
        
        this.problemIndex++;
        this.generateProblem();
        this.updateProblemCounter();
    }
    
    /**
     * Update the problem counter display
     */
    protected updateProblemCounter(): void {
        this.problemCounterText.setText(DanishText.problemCounter(this.problemIndex, this.totalProblems));
    }
    
    /**
     * Show feedback message with color
     */
    protected showFeedback(message: string, color: number): void {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
        this.feedbackText.setVisible(true);
        
        // Fade in effect (within 300ms)
        this.feedbackText.setAlpha(0);
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
    }
    
    /**
     * Update coin display with animation
     */
    protected updateCoinDisplay(): void {
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
