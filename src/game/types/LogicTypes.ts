// Logic puzzle type definitions

export type ProblemType = 'halves' | 'doubles';

export interface LogicProblem {
    id: string;
    questionText: string;  // Danish question text
    operation: ProblemType;
    startValue: number;
    correctAnswer: number;
    options: MultipleChoiceOption[];
    emojiSet: EmojiSet;
    context?: string;  // Optional real-world scenario context (Danish)
    attemptsRemaining: number;
}

export interface MultipleChoiceOption {
    displayText: string;  // Text or emoji representation
    emojiRepresentation: string;  // Emoji display
    value: number;
    isCorrect: boolean;
}

export interface EmojiSet {
    category: string;  // 'food', 'animals', 'shapes'
    emoji: string;  // Single emoji character
    displayName: string;  // Danish name
}

export interface RealWorldScenario {
    template: string;  // Danish template with placeholders
    category: string;  // 'prices', 'recipes', 'groups', 'candy', 'money', 'toys'
}
