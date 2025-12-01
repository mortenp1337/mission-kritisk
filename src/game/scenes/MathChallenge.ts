// MathChallenge scene - presents math problems and awards coins
import { GameObjects } from 'phaser';
import { GameSession } from '../systems/GameSession';
import { MathProblemGenerator } from '../systems/MathProblemGenerator';
import { MathProblem } from '../entities/MathProblem';
import { BaseChallengeScene } from './BaseChallengeScene';
import { DanishText } from '../data/danishText';
import { WAVE_PROGRESSION } from '../data/gameplayConfig';

export class MathChallenge extends BaseChallengeScene {
    private generator: MathProblemGenerator;
    private currentProblem: MathProblem | null;
    
    constructor() {
        super('MathChallenge');
    }
    
    create() {
        this.session = GameSession.getInstance();
        this.generator = new MathProblemGenerator();
        this.currentProblem = null;
        this.problemIndex = 0;
        this.totalProblems = WAVE_PROGRESSION.PROBLEMS_PER_WAVE;
        
        this.createBaseUI();
        this.nextProblem();
    }
    
    protected generateProblem(): void {
        // Use difficulty from session (maps to grade via difficulty - 1)
        const grade = this.session.difficulty - 1;
        this.currentProblem = this.generator.generate(grade, this.session.currentWave);
        
        this.questionText.setText(this.currentProblem.question);
        this.feedbackText.setVisible(false);
        this.createAnswerButtons();
    }
    
    protected getCurrentCorrectAnswer(): number {
        return this.currentProblem?.correctAnswer ?? 0;
    }
    
    protected hasReachedMaxAttempts(): boolean {
        return this.currentProblem?.hasReachedMaxAttempts() ?? true;
    }
    
    protected incrementAttempt(): void {
        this.currentProblem?.incrementAttempt();
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
            
            // Button interactions - use base class handleAnswer method
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
}
