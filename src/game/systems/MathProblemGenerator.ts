// MathProblemGenerator system - generates grade-appropriate math problems
import { MathProblem, MathProblemEntity, MathOperation } from '../entities/MathProblem';
import { getGradeTemplates, ProblemTemplate } from '../data/mathProblems';

export class MathProblemGenerator {
    private usedProblems: Set<string>;
    
    constructor() {
        this.usedProblems = new Set();
    }
    
    /**
     * Generate a single math problem for the specified grade and wave
     */
    generate(grade: number, wave: number = 1): MathProblem {
        const templates = getGradeTemplates(grade, wave);
        const template = this.selectRandomTemplate(templates);
        
        let attempts = 0;
        let problem: MathProblem | null = null;
        
        // Try to generate a unique problem (max 100 attempts)
        while (attempts < 100) {
            problem = this.generateFromTemplate(template, grade, wave);
            const key = `${problem.question}`;
            
            if (!this.usedProblems.has(key)) {
                this.usedProblems.add(key);
                return problem;
            }
            attempts++;
        }
        
        // If we couldn't generate a unique problem, just return the last one
        if (!problem) {
            throw new Error('Failed to generate math problem');
        }
        return problem;
    }
    
    /**
     * Generate multiple problems at once
     */
    generateBatch(grade: number, wave: number, count: number): MathProblem[] {
        const problems: MathProblem[] = [];
        for (let i = 0; i < count; i++) {
            problems.push(this.generate(grade, wave));
        }
        return problems;
    }
    
    /**
     * Validate if an answer is correct
     */
    validateAnswer(problem: MathProblem, answer: number): boolean {
        return problem.correctAnswer === answer;
    }
    
    /**
     * Reset the used problems set
     */
    reset(): void {
        this.usedProblems.clear();
    }
    
    private selectRandomTemplate(templates: ProblemTemplate[]): ProblemTemplate {
        const index = Math.floor(Math.random() * templates.length);
        return templates[index];
    }
    
    private generateFromTemplate(template: ProblemTemplate, grade: number, wave: number): MathProblem {
        const a = this.randomInRange(template.rangeA[0], template.rangeA[1]);
        const b = this.randomInRange(template.rangeB[0], template.rangeB[1]);
        
        // Calculate correct answer based on operation
        let correctAnswer: number;
        let operandA = a;
        let operandB = b;
        
        switch (template.operation) {
            case 'add':
                correctAnswer = a + b;
                break;
            case 'subtract':
                // Ensure non-negative result
                operandA = Math.max(a, b);
                operandB = Math.min(a, b);
                correctAnswer = operandA - operandB;
                break;
            case 'multiply':
                correctAnswer = a * b;
                break;
            case 'divide':
                // Ensure clean division
                operandB = b === 0 ? 2 : b;
                operandA = a * operandB;
                correctAnswer = a;
                break;
            default:
                throw new Error(`Unknown operation: ${template.operation}`);
        }
        
        // Generate question string
        const question = template.displayFormat
            .replace('{a}', operandA.toString())
            .replace('{b}', operandB.toString());
        
        // Generate distractors
        const distractors = this.generateDistractors(correctAnswer, template.operation);
        
        // Calculate difficulty (1-3 based on wave)
        const difficulty = Math.min(3, Math.floor(wave / 2) + 1);
        
        return new MathProblemEntity(
            question,
            correctAnswer,
            distractors,
            grade,
            difficulty,
            template.operation
        );
    }
    
    private generateDistractors(correctAnswer: number, operation: MathOperation): number[] {
        const distractors: Set<number> = new Set();
        const maxOffset = 5;
        let attempts = 0;
        
        while (distractors.size < 3 && attempts < 100) {
            const offset = this.randomInRange(-maxOffset, maxOffset);
            const distractor = correctAnswer + offset;
            
            // Ensure distractor is different from correct answer and non-negative
            if (distractor !== correctAnswer && distractor >= 0) {
                // For division, ensure distractor is an integer
                if (operation === 'divide') {
                    distractors.add(Math.floor(distractor));
                } else {
                    distractors.add(distractor);
                }
            }
            attempts++;
        }
        
        // If we couldn't generate enough distractors, add some simple ones
        while (distractors.size < 3) {
            const simple = correctAnswer + (distractors.size + 1);
            if (simple !== correctAnswer && simple >= 0) {
                distractors.add(simple);
            }
        }
        
        return Array.from(distractors).slice(0, 3);
    }
    
    private randomInRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
