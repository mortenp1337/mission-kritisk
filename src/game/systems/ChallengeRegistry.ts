// Challenge Registry - maps categories to challenge types and scenes
import { ChallengeCategory, ChallengeType, DifficultyLevel } from '../types/ChallengeTypes';
import { CHALLENGE_TYPES, getChallengeTypesForDifficulty } from '../data/challengeCategories';

export class ChallengeRegistry {
    private static instance: ChallengeRegistry;
    
    private constructor() {}
    
    static getInstance(): ChallengeRegistry {
        if (!ChallengeRegistry.instance) {
            ChallengeRegistry.instance = new ChallengeRegistry();
        }
        return ChallengeRegistry.instance;
    }
    
    /**
     * Get all challenge types for a category at a specific difficulty level
     */
    getChallengeTypes(category: ChallengeCategory, difficulty: DifficultyLevel): ChallengeType[] {
        return getChallengeTypesForDifficulty(category, difficulty);
    }
    
    /**
     * Get the scene name for a specific challenge type
     */
    getSceneName(challengeTypeId: string): string | undefined {
        const challengeType = CHALLENGE_TYPES.find(type => type.id === challengeTypeId);
        return challengeType?.sceneName;
    }
    
    /**
     * Check if a challenge type is available at a specific difficulty
     */
    isAvailable(challengeTypeId: string, difficulty: DifficultyLevel): boolean {
        const challengeType = CHALLENGE_TYPES.find(type => type.id === challengeTypeId);
        if (!challengeType || !challengeType.enabled) {
            return false;
        }
        return difficulty >= challengeType.minDifficulty && difficulty <= challengeType.maxDifficulty;
    }
    
    /**
     * Get challenge type by ID
     */
    getChallengeType(challengeTypeId: string): ChallengeType | undefined {
        return CHALLENGE_TYPES.find(type => type.id === challengeTypeId);
    }
}
