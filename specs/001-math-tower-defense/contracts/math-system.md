# Math System Contract

**Purpose**: Define interfaces for math problem generation and validation  
**Created**: 2025-11-22

## Interfaces

### IMathProblemGenerator

**Responsibility**: Generate grade-appropriate math problems with correct answers and distractors.

```typescript
interface IMathProblemGenerator {
  /**
   * Generate a math problem for the specified grade and wave
   * @param grade - Grade level (0-3)
   * @param wave - Current wave number (1-5) for difficulty scaling
   * @returns Generated math problem
   */
  generate(grade: number, wave: number): MathProblem;
  
  /**
   * Generate multiple problems at once
   * @param grade - Grade level (0-3)
   * @param wave - Current wave number (1-5)
   * @param count - Number of problems to generate
   * @returns Array of math problems
   */
  generateBatch(grade: number, wave: number, count: number): MathProblem[];
  
  /**
   * Validate if an answer is correct
   * @param problem - The math problem
   * @param answer - User's selected answer
   * @returns True if answer is correct
   */
  validateAnswer(problem: MathProblem, answer: number): boolean;
}
```

### MathProblem

```typescript
interface MathProblem {
  id: string;
  question: string;              // e.g., "5 + 3 = ?"
  correctAnswer: number;
  distractors: number[];         // 3 incorrect answers
  grade: number;                 // 0-3
  difficulty: number;            // 1-3 (within grade)
  operation: MathOperation;
  attempts: number;              // Tracking user attempts
}

type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide';
```

### ProblemTemplate

```typescript
interface ProblemTemplate {
  operation: MathOperation;
  rangeA: [number, number];     // Min/max for first operand
  rangeB: [number, number];     // Min/max for second operand
  displayFormat: string;         // e.g., "{a} + {b} = ?"
}
```

## Grade Configuration

```typescript
const GRADE_TEMPLATES: Record<number, ProblemTemplate[]> = {
  0: [
    { operation: 'add', rangeA: [0, 5], rangeB: [0, 5], displayFormat: '{a} + {b} = ?' }
  ],
  1: [
    { operation: 'add', rangeA: [0, 10], rangeB: [0, 10], displayFormat: '{a} + {b} = ?' },
    { operation: 'subtract', rangeA: [0, 10], rangeB: [0, 10], displayFormat: '{a} - {b} = ?' }
  ],
  2: [
    { operation: 'add', rangeA: [10, 50], rangeB: [10, 50], displayFormat: '{a} + {b} = ?' },
    { operation: 'multiply', rangeA: [2, 10], rangeB: [2, 10], displayFormat: '{a} × {b} = ?' }
  ],
  3: [
    { operation: 'multiply', rangeA: [5, 20], rangeB: [2, 12], displayFormat: '{a} × {b} = ?' },
    { operation: 'divide', rangeA: [10, 100], rangeB: [2, 10], displayFormat: '{a} ÷ {b} = ?' }
  ]
};
```

## Behavior Specifications

### Problem Generation

1. **Template Selection**: Randomly select template for grade level
2. **Operand Generation**: Generate random numbers within template ranges
3. **Answer Calculation**: Compute correct answer based on operation
4. **Distractor Generation**: Create 3 plausible incorrect answers
5. **Answer Shuffling**: Randomize order of correct answer + distractors

### Distractor Algorithm

```
For correct answer C:
- Generate 3 unique distractors within range [C-5, C+5]
- Exclude C itself
- Ensure all distractors are non-negative
- If operation is divide, ensure distractors are integers
```

### Difficulty Scaling

Wave 1: Use base templates  
Wave 2: Increase ranges by 20%  
Wave 3: Increase ranges by 40%  
Wave 4: Increase ranges by 60%  
Wave 5: Increase ranges by 80%

### Validation Rules

- Subtraction: Ensure result is non-negative (a >= b)
- Division: Ensure clean division (a % b === 0)
- All answers: Must be unique integers
- Question format: Must replace {a} and {b} with actual numbers

## Example Usage

```typescript
const generator: IMathProblemGenerator = new MathProblemGenerator();

// Generate problem for Grade 1, Wave 2
const problem = generator.generate(1, 2);
// Possible output:
// {
//   id: "prob-001",
//   question: "7 + 9 = ?",
//   correctAnswer: 16,
//   distractors: [14, 17, 19],
//   grade: 1,
//   difficulty: 2,
//   operation: "add",
//   attempts: 0
// }

// Validate user's answer
const isCorrect = generator.validateAnswer(problem, 16); // true
```

## Error Handling

- Invalid grade (not 0-3): Throw error
- Invalid wave (not 1-5): Throw error
- Failed to generate valid problem after 100 attempts: Throw error
- Empty template array for grade: Throw error
