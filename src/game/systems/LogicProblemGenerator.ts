// LogicProblemGenerator - generates halves/doubles logic puzzles with deterministic validation
import { LogicProblem } from '../entities/LogicProblem';
import { MultipleChoiceOption } from '../entities/MultipleChoiceOption';
import { ProblemType, EmojiSet, RealWorldScenario } from '../types/LogicTypes';
import { getRandomEmojiSet, formatEmojiDisplay } from '../data/emojiSets';
import { DanishText } from '../data/danishText';

export class LogicProblemGenerator {
    private usedProblems: Set<string>;
    private lastEmojiUsed: string[];  // Track last 2 emoji characters
    private problemCounter: number;
    private problemIdCounter: number;  // Robust ID generation counter
    private realWorldScenarios: RealWorldScenario[];
    private readonly DISTRACTOR_COUNT_MIN = 2;
    private readonly DISTRACTOR_COUNT_MAX = 3;
    
    constructor() {
        this.usedProblems = new Set();
        this.lastEmojiUsed = [];
        this.problemCounter = 0;
        this.problemIdCounter = 0;
        this.initializeScenarios();
    }
    
    private initializeScenarios(): void {
        // Real-world scenario templates (Danish) - 6 templates as per FR-014
        this.realWorldScenarios = [
            { template: 'En ting koster {start} kr. Hvad er halvpris?', category: 'prices' },
            { template: 'Du har {start} kr. Hvad er det dobbelte?', category: 'money' },
            { template: 'En opskrift bruger {start} kopper mel. Hvad er halvdelen?', category: 'recipes' },
            { template: 'Du vil fordoble en opskrift med {start} æg. Hvor mange skal du bruge?', category: 'recipes' },
            { template: 'Der er {start} børn i en gruppe. Hvad er halvdelen?', category: 'groups' },
            { template: 'Du har {start} stykker slik. Hvad er det dobbelte?', category: 'candy' }
        ];
    }
    
    /**
     * Generate unique problem ID
     */
    private generateProblemId(): string {
        this.problemIdCounter++;
        return `logic_${this.problemIdCounter}_${Date.now()}`;
    }
    
    /**
     * Get distractor count (2-3 based on random selection)
     */
    private getDistractorCount(): number {
        return Math.random() > 0.5 ? this.DISTRACTOR_COUNT_MAX : this.DISTRACTOR_COUNT_MIN;
    }
    
    /**
     * Generate a logic problem for halves or doubles
     */
    generate(difficulty: number, problemType: ProblemType): LogicProblem {
        this.problemCounter++;
        
        // Enforce 30% real-world context: use modulo 10 for accurate percentage
        // This will give real-world context on problems 1, 4, 7, 10, 13, etc. (~30%)
        const useRealWorld = (this.problemCounter % 10 <= 2);
        
        let attempts = 0;
        let problem: LogicProblem | null = null;
        
        while (attempts < 100) {
            problem = useRealWorld 
                ? this.generateWithRealWorldContext(difficulty, problemType)
                : this.generateWithEmoji(difficulty, problemType);
            
            // Check uniqueness
            const key = `${problem.operation}_${problem.startValue}`;
            if (!this.usedProblems.has(key)) {
                this.usedProblems.add(key);
                return problem;
            }
            attempts++;
        }
        
        throw new Error('Failed to generate unique logic problem after 100 attempts');
    }
    
    /**
     * Generate problem with emoji representation
     */
    private generateWithEmoji(difficulty: number, problemType: ProblemType): LogicProblem {
        const startValue = this.generateStartValue(difficulty, problemType);
        const correctAnswer = problemType === 'halves' ? startValue / 2 : startValue * 2;
        
        // Get emoji set with variation
        const emojiSet = this.selectEmojiWithVariation();
        
        // Build question text
        const emojiDisplay = formatEmojiDisplay(emojiSet.emoji, startValue);
        const questionSuffix = problemType === 'halves' 
            ? DanishText.logicPuzzleQuestion.halves 
            : DanishText.logicPuzzleQuestion.doubles;
        const questionText = `${emojiDisplay} ${questionSuffix}`;
        
        // Generate options
        const options = this.generateOptions(correctAnswer, emojiSet, problemType);
        
        return new LogicProblem(this.generateProblemId(), questionText, problemType, startValue, correctAnswer, options, emojiSet);
    }
    
    /**
     * Generate problem with real-world context
     */
    private generateWithRealWorldContext(difficulty: number, problemType: ProblemType): LogicProblem {
        const startValue = this.generateStartValue(difficulty, problemType);
        const correctAnswer = problemType === 'halves' ? startValue / 2 : startValue * 2;
        
        // Select appropriate scenario
        const scenarios = this.realWorldScenarios.filter(s => {
            if (problemType === 'halves') {
                return s.template.includes('halvdelen') || s.template.includes('halvpris');
            } else {
                return s.template.includes('dobbelte') || s.template.includes('fordoble');
            }
        });
        
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const questionText = scenario.template.replace('{start}', startValue.toString());
        
        // Use a generic emoji for context problems
        const emojiSet = getRandomEmojiSet();
        
        // Generate options without emoji (just numeric values for prices/quantities)
        const options = this.generateOptionsWithoutEmoji(correctAnswer, problemType);
        
        return new LogicProblem(this.generateProblemId(), questionText, problemType, startValue, correctAnswer, options, emojiSet, scenario.category);
    }
    
    /**
     * Generate starting value based on difficulty and problem type
     */
    private generateStartValue(difficulty: number, problemType: ProblemType): number {
        // Starting value limits per difficulty (from FR-027)
        const limits = {
            1: { min: 2, max: 9 },    // under 10
            2: { min: 2, max: 19 },   // under 20
            3: { min: 2, max: 34 },   // under 35
            4: { min: 2, max: 50 }    // up to 50
        };
        
        const limit = limits[difficulty as 1 | 2 | 3 | 4];
        let value = Math.floor(Math.random() * (limit.max - limit.min + 1)) + limit.min;
        
        // For halving, ensure even number for whole number results (FR-023)
        if (problemType === 'halves' && value % 2 !== 0) {
            value = value + 1;
            if (value > limit.max) value = value - 2;
        }
        
        // Validate result limits for halving
        if (problemType === 'halves') {
            const result = value / 2;
            const resultLimits = { 1: 10, 2: 20, 3: 35, 4: 50 };
            if (result >= resultLimits[difficulty as 1 | 2 | 3 | 4]) {
                // Adjust value down
                value = Math.floor(resultLimits[difficulty as 1 | 2 | 3 | 4] * 2) - 2;
                if (value % 2 !== 0) value = value - 1;
            }
        }
        
        // Validate result limits for doubling
        if (problemType === 'doubles') {
            const result = value * 2;
            const resultLimits = { 1: 20, 2: 40, 3: 70, 4: 100 };
            if (result >= resultLimits[difficulty as 1 | 2 | 3 | 4]) {
                // Adjust value down
                value = Math.floor(resultLimits[difficulty as 1 | 2 | 3 | 4] / 2) - 1;
            }
        }
        
        return value;
    }
    
    /**
     * Select emoji with variation (avoid same emoji 2+ consecutive times)
     */
    private selectEmojiWithVariation(): EmojiSet {
        let emojiSet = getRandomEmojiSet();
        let attempts = 0;
        
        // Avoid same emoji character used in last 2 problems
        while (this.lastEmojiUsed.includes(emojiSet.emoji) && attempts < 20) {
            emojiSet = getRandomEmojiSet();
            attempts++;
        }
        
        // Track last 2 emoji
        this.lastEmojiUsed.push(emojiSet.emoji);
        if (this.lastEmojiUsed.length > 2) {
            this.lastEmojiUsed.shift();
        }
        
        return emojiSet;
    }
    
    /**
     * Generate multiple choice options with emoji representation
     */
    private generateOptions(correctAnswer: number, emojiSet: EmojiSet, problemType: ProblemType): MultipleChoiceOption[] {
        const options: MultipleChoiceOption[] = [];
        const usedValues = new Set<number>();
        
        // Add correct option
        const correctEmoji = formatEmojiDisplay(emojiSet.emoji, correctAnswer);
        options.push(new MultipleChoiceOption(
            correctAnswer.toString(),
            correctEmoji,
            correctAnswer,
            true
        ));
        usedValues.add(correctAnswer);
        
        // Generate 2-3 distractors (FR-017)
        const distractorCount = this.getDistractorCount();
        let distractorsAdded = 0;
        
        while (distractorsAdded < distractorCount && options.length < 4) {
            const distractor = this.generateDistractor(correctAnswer, problemType, usedValues);
            if (distractor > 0 && !usedValues.has(distractor)) {
                const distractorEmoji = formatEmojiDisplay(emojiSet.emoji, distractor);
                options.push(new MultipleChoiceOption(
                    distractor.toString(),
                    distractorEmoji,
                    distractor,
                    false
                ));
                usedValues.add(distractor);
                distractorsAdded++;
            }
        }
        
        // Shuffle options
        return this.shuffleArray(options);
    }
    
    /**
     * Generate multiple choice options without emoji (for real-world contexts)
     */
    private generateOptionsWithoutEmoji(correctAnswer: number, problemType: ProblemType): MultipleChoiceOption[] {
        const options: MultipleChoiceOption[] = [];
        const usedValues = new Set<number>();
        
        // Add correct option
        options.push(new MultipleChoiceOption(
            correctAnswer.toString(),
            correctAnswer.toString(),
            correctAnswer,
            true
        ));
        usedValues.add(correctAnswer);
        
        // Generate 2-3 distractors
        const distractorCount = this.getDistractorCount();
        let distractorsAdded = 0;
        
        while (distractorsAdded < distractorCount && options.length < 4) {
            const distractor = this.generateDistractor(correctAnswer, problemType, usedValues);
            if (distractor > 0 && !usedValues.has(distractor)) {
                options.push(new MultipleChoiceOption(
                    distractor.toString(),
                    distractor.toString(),
                    distractor,
                    false
                ));
                usedValues.add(distractor);
                distractorsAdded++;
            }
        }
        
        // Shuffle options
        return this.shuffleArray(options);
    }
    
    /**
     * Generate distractor answer (FR-017: off-by-1, reversed operation, adjacent value)
     */
    private generateDistractor(correctAnswer: number, problemType: ProblemType, usedValues: Set<number>): number {
        const distractorTypes = [
            // Off-by-1 (±1 from correct)
            () => correctAnswer + 1,
            () => correctAnswer - 1,
            // Reversed operation
            () => problemType === 'halves' ? correctAnswer * 4 : Math.floor(correctAnswer / 4),
            // Adjacent value (nearby plausible number)
            () => correctAnswer + Math.floor(Math.random() * 5) - 2
        ];
        
        // Randomly select distractor type
        const typeIndex = Math.floor(Math.random() * distractorTypes.length);
        let distractor = distractorTypes[typeIndex]();
        
        // Ensure positive and not already used
        if (distractor <= 0 || usedValues.has(distractor)) {
            // Try another type
            distractor = distractorTypes[(typeIndex + 1) % distractorTypes.length]();
        }
        
        return Math.max(1, distractor);
    }
    
    /**
     * Shuffle array (Fisher-Yates algorithm)
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * Validate that halving produces whole numbers
     */
    validateHalvingProblem(startValue: number, difficulty: number): boolean {
        // Must be even for whole number result
        if (startValue % 2 !== 0) return false;
        
        const result = startValue / 2;
        const limits = { 1: 10, 2: 20, 3: 35, 4: 50 };
        return result < limits[difficulty as 1 | 2 | 3 | 4];
    }
    
    /**
     * Validate that doubling stays within limits
     */
    validateDoublingProblem(startValue: number, difficulty: number): boolean {
        const result = startValue * 2;
        const limits = { 1: 20, 2: 40, 3: 70, 4: 100 };
        return result < limits[difficulty as 1 | 2 | 3 | 4];
    }
    
    /**
     * Validate options have exactly one correct answer
     */
    validateOptions(options: MultipleChoiceOption[], correctAnswer: number): boolean {
        const correctCount = options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) return false;
        
        const correctOption = options.find(o => o.isCorrect);
        if (!correctOption || correctOption.value !== correctAnswer) return false;
        
        // All values must be unique
        const values = options.map(o => o.value);
        const uniqueValues = new Set(values);
        return values.length === uniqueValues.size;
    }
}
