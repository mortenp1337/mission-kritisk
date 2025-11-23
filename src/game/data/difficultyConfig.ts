// Difficulty level configuration with Danish labels
import { DifficultyConfig, DifficultyLevel } from '../types/ChallengeTypes';

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
    {
        level: 1 as DifficultyLevel,
        label: 'Niveau 1 - Begynder',
        grade: 0
    },
    {
        level: 2 as DifficultyLevel,
        label: 'Niveau 2 - Let Øvet',
        grade: 1
    },
    {
        level: 3 as DifficultyLevel,
        label: 'Niveau 3 - Øvet',
        grade: 2
    },
    {
        level: 4 as DifficultyLevel,
        label: 'Niveau 4 - Ekspert',
        grade: 3
    }
];

// Helper function to get difficulty config by level
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig | undefined {
    return DIFFICULTY_CONFIGS.find(config => config.level === level);
}

// Helper function to map difficulty to grade
export function difficultyToGrade(difficulty: DifficultyLevel): number {
    return difficulty - 1;
}
