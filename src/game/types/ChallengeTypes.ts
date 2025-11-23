// Challenge type system definitions

export type DifficultyLevel = 1 | 2 | 3 | 4;

export enum ChallengeCategory {
    Math = 'math',
    Logic = 'logic'
}

export interface ChallengeType {
    id: string;
    name: string;  // Danish display name
    category: ChallengeCategory;
    sceneName: string;
    minDifficulty: DifficultyLevel;
    maxDifficulty: DifficultyLevel;
    enabled: boolean;
}

export interface DifficultyConfig {
    level: DifficultyLevel;
    label: string;  // Danish label with subtitle (e.g., "Niveau 1 - Begynder")
    grade: number;  // Maps to existing grade system (0-3)
}
