// Challenge category and type definitions
import { ChallengeCategory, ChallengeType } from '../types/ChallengeTypes';

// Available challenge types organized by category
export const CHALLENGE_TYPES: ChallengeType[] = [
    // Arithmetic Operations (Math Category)
    {
        id: 'addition',
        name: 'Addition',
        category: ChallengeCategory.Math,
        sceneName: 'MathChallenge',
        minDifficulty: 1,
        maxDifficulty: 4,
        enabled: true
    },
    {
        id: 'subtraction',
        name: 'Subtraktion',
        category: ChallengeCategory.Math,
        sceneName: 'MathChallenge',
        minDifficulty: 2,
        maxDifficulty: 4,
        enabled: true
    },
    {
        id: 'multiplication',
        name: 'Multiplikation',
        category: ChallengeCategory.Math,
        sceneName: 'MathChallenge',
        minDifficulty: 3,
        maxDifficulty: 4,
        enabled: true
    },
    {
        id: 'division',
        name: 'Division',
        category: ChallengeCategory.Math,
        sceneName: 'MathChallenge',
        minDifficulty: 4,
        maxDifficulty: 4,
        enabled: true
    },
    // Logic Puzzles (Logic Category)
    {
        id: 'halves-doubles',
        name: 'Halvdele og Dobbelte',
        category: ChallengeCategory.Logic,
        sceneName: 'LogicChallenge',
        minDifficulty: 1,
        maxDifficulty: 4,
        enabled: true
    }
];

// Category display names (Danish)
export const CATEGORY_NAMES = {
    [ChallengeCategory.Math]: 'Regnearter',
    [ChallengeCategory.Logic]: 'Logik Opgaver'
};

// Helper function to get challenge types for a category
export function getChallengeTypesByCategory(category: ChallengeCategory): ChallengeType[] {
    return CHALLENGE_TYPES.filter(type => type.category === category && type.enabled);
}

// Helper function to filter challenge types by difficulty
export function getChallengeTypesForDifficulty(category: ChallengeCategory, difficulty: number): ChallengeType[] {
    return CHALLENGE_TYPES.filter(
        type => type.category === category && 
                type.enabled && 
                difficulty >= type.minDifficulty && 
                difficulty <= type.maxDifficulty
    );
}
