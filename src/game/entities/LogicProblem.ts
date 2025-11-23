// LogicProblem entity - represents a logic puzzle problem
import { LogicProblem as ILogicProblem, MultipleChoiceOption, ProblemType, EmojiSet } from '../types/LogicTypes';

export class LogicProblem implements ILogicProblem {
    id: string;
    questionText: string;
    operation: ProblemType;
    startValue: number;
    correctAnswer: number;
    options: MultipleChoiceOption[];
    emojiSet: EmojiSet;
    context?: string;
    attemptsRemaining: number;
    
    constructor(
        id: string,
        questionText: string,
        operation: ProblemType,
        startValue: number,
        correctAnswer: number,
        options: MultipleChoiceOption[],
        emojiSet: EmojiSet,
        context?: string
    ) {
        this.id = id;
        this.questionText = questionText;
        this.operation = operation;
        this.startValue = startValue;
        this.correctAnswer = correctAnswer;
        this.options = options;
        this.emojiSet = emojiSet;
        this.context = context;
        this.attemptsRemaining = 2;  // Allow 2 attempts per problem
    }
    
    /**
     * Check if the provided answer is correct
     */
    isCorrect(answer: number): boolean {
        return answer === this.correctAnswer;
    }
    
    /**
     * Decrement attempts remaining
     */
    decrementAttempts(): void {
        this.attemptsRemaining = Math.max(0, this.attemptsRemaining - 1);
    }
    
    /**
     * Check if attempts are exhausted
     */
    hasAttemptsRemaining(): boolean {
        return this.attemptsRemaining > 0;
    }
    
    /**
     * Get formatted question with emoji representation
     */
    getFormattedQuestion(): string {
        return this.questionText;
    }
}
