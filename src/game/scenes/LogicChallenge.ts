// LogicChallenge scene - presents logic puzzles with multiple choice answers
import { GameObjects } from 'phaser';
import { DanishText } from '../data/danishText';
import { GameSession } from '../systems/GameSession';
import { LogicProblemGenerator } from '../systems/LogicProblemGenerator';
import { LogicProblem } from '../entities/LogicProblem';
import { ProblemType } from '../types/LogicTypes';
import { BaseChallengeScene } from './BaseChallengeScene';
import { WAVE_PROGRESSION } from '../data/gameplayConfig';

export class LogicChallenge extends BaseChallengeScene {
    private generator: LogicProblemGenerator;
    private currentProblem: LogicProblem | null;
    
    constructor() {
        super('LogicChallenge');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.generator = new LogicProblemGenerator();
        this.currentProblem = null;
        this.problemIndex = 0;
        this.totalProblems = WAVE_PROGRESSION.PROBLEMS_PER_WAVE;  // Use config constant
        
        this.createBaseUI();
        this.nextProblem();
    }
    
    protected generateProblem(): void {
        // Generate halves or doubles problem randomly
        const problemType: ProblemType = Math.random() > 0.5 ? 'halves' : 'doubles';
        this.currentProblem = this.generator.generate(this.session.difficulty, problemType);
        
        this.questionText.setText(this.currentProblem.getFormattedQuestion());
        this.feedbackText.setVisible(false);
        this.createAnswerButtons();
    }
    
    protected getCurrentCorrectAnswer(): number {
        return this.currentProblem?.correctAnswer ?? 0;
    }
    
    protected hasReachedMaxAttempts(): boolean {
        return this.currentProblem ? !this.currentProblem.hasAttemptsRemaining() : true;
    }
    
    protected incrementAttempt(): void {
        // LogicProblem uses decrementAttempts instead
        // This method is called before checking correctness in base class
        // So we'll handle it differently in handleAnswer override
    }
    
    // Override handleAnswer to use LogicProblem's decrementAttempts pattern
    protected handleAnswer(answer: number): void {
        if (!this.currentProblem) return;
        
        const isCorrect = this.currentProblem.isCorrect(answer);
        
        if (!isCorrect) {
            this.currentProblem.decrementAttempts();
        }
        
        // Call base class implementation
        super.handleAnswer(answer);
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
            
            // Button interactions - use base class handleAnswer method
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
}
