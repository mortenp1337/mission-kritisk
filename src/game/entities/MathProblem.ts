// MathProblem entity - represents a math question with answers
export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide';

export interface MathProblem {
    id: string;
    question: string;              // e.g., "5 + 3 = ?"
    correctAnswer: number;
    distractors: number[];         // 3 incorrect answers
    allAnswers: number[];          // All 4 answers shuffled
    grade: number;                 // 0-3
    difficulty: number;            // 1-3 (within grade)
    operation: MathOperation;
    attempts: number;              // Tracking user attempts
}

export class MathProblemEntity implements MathProblem {
    id: string;
    question: string;
    correctAnswer: number;
    distractors: number[];
    allAnswers: number[];
    grade: number;
    difficulty: number;
    operation: MathOperation;
    attempts: number;
    
    constructor(
        question: string,
        correctAnswer: number,
        distractors: number[],
        grade: number,
        difficulty: number,
        operation: MathOperation
    ) {
        this.id = `prob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.distractors = distractors;
        this.grade = grade;
        this.difficulty = difficulty;
        this.operation = operation;
        this.attempts = 0;
        
        // Shuffle correct answer with distractors
        this.allAnswers = this.shuffleAnswers([correctAnswer, ...distractors]);
    }
    
    private shuffleAnswers(answers: number[]): number[] {
        const shuffled = [...answers];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    incrementAttempt(): void {
        this.attempts++;
    }
    
    isCorrect(answer: number): boolean {
        return answer === this.correctAnswer;
    }
    
    hasReachedMaxAttempts(): boolean {
        return this.attempts >= 3;
    }
}
