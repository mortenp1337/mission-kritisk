// Math problem templates for each grade level
import { MathOperation } from '../entities/MathProblem';

export interface ProblemTemplate {
    operation: MathOperation;
    rangeA: [number, number];     // Min/max for first operand
    rangeB: [number, number];     // Min/max for second operand
    displayFormat: string;         // e.g., "{a} + {b} = ?"
}

// Grade-specific problem templates
// Grade 0: Simple addition 0-5
// Grade 1: Addition and subtraction 0-10
// Grade 2: Two-digit addition and simple multiplication
// Grade 3: Multi-digit and division
export const GRADE_TEMPLATES: Record<number, ProblemTemplate[]> = {
    0: [
        { 
            operation: 'add', 
            rangeA: [0, 5], 
            rangeB: [0, 5], 
            displayFormat: '{a} + {b} = ?' 
        }
    ],
    1: [
        { 
            operation: 'add', 
            rangeA: [0, 10], 
            rangeB: [0, 10], 
            displayFormat: '{a} + {b} = ?' 
        },
        { 
            operation: 'subtract', 
            rangeA: [0, 10], 
            rangeB: [0, 10], 
            displayFormat: '{a} - {b} = ?' 
        }
    ],
    2: [
        { 
            operation: 'add', 
            rangeA: [10, 50], 
            rangeB: [10, 50], 
            displayFormat: '{a} + {b} = ?' 
        },
        { 
            operation: 'subtract', 
            rangeA: [10, 50], 
            rangeB: [10, 50], 
            displayFormat: '{a} - {b} = ?' 
        },
        { 
            operation: 'multiply', 
            rangeA: [2, 10], 
            rangeB: [2, 10], 
            displayFormat: '{a} × {b} = ?' 
        }
    ],
    3: [
        { 
            operation: 'add', 
            rangeA: [50, 100], 
            rangeB: [10, 50], 
            displayFormat: '{a} + {b} = ?' 
        },
        { 
            operation: 'multiply', 
            rangeA: [5, 20], 
            rangeB: [2, 12], 
            displayFormat: '{a} × {b} = ?' 
        },
        { 
            operation: 'divide', 
            rangeA: [10, 100], 
            rangeB: [2, 10], 
            displayFormat: '{a} ÷ {b} = ?' 
        }
    ]
};

// Get templates for a specific grade with difficulty scaling
export function getGradeTemplates(grade: number, wave: number = 1): ProblemTemplate[] {
    if (grade < 0 || grade > 3) {
        throw new Error(`Invalid grade: ${grade}. Must be 0-3.`);
    }
    
    const templates = GRADE_TEMPLATES[grade];
    
    // Scale difficulty based on wave (1-5)
    // Wave 1: base templates
    // Wave 2-5: increase ranges by 20% per wave
    if (wave > 1) {
        const scaleFactor = 1 + ((wave - 1) * 0.2);
        return templates.map(template => ({
            ...template,
            rangeA: [
                Math.floor(template.rangeA[0] * scaleFactor),
                Math.floor(template.rangeA[1] * scaleFactor)
            ],
            rangeB: [
                Math.floor(template.rangeB[0] * scaleFactor),
                Math.floor(template.rangeB[1] * scaleFactor)
            ]
        }));
    }
    
    return templates;
}
