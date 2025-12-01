// Gameplay configuration - centralized speed and timing parameters
// All speed-related gameplay elements reference this configuration

export interface GameplayConfig {
    speedMultiplier: number;        // Master multiplier (reserved for future use)
    zombieSpeedMultiplier: number;
    towerFireRateMultiplier: number;
}

export const GAMEPLAY_CONFIG: GameplayConfig = {
    speedMultiplier: 1.5,           // Master multiplier (50% faster) - not currently used
    zombieSpeedMultiplier: 1.5,     // Zombie movement speed multiplier
    towerFireRateMultiplier: 1.5,   // Tower firing rate multiplier
};

/**
 * Wave progression configuration
 * Central source of truth for game progression
 */
export const WAVE_PROGRESSION = {
    TOTAL_WAVES: 5,             // Total number of waves in the game
    PROBLEMS_PER_WAVE: 5,       // Number of problems per challenge phase
    BASE_HEALTH: 10,            // Base starting health
    STARTING_COINS: 0           // Initial player coins
} as const;

/**
 * Calculate zombie movement speed with multiplier applied
 * @param baseSpeed - Base speed from wave configuration (pixels per second)
 * @returns Adjusted speed = baseSpeed * zombieSpeedMultiplier
 */
export function getAdjustedSpeed(baseSpeed: number): number {
    return baseSpeed * GAMEPLAY_CONFIG.zombieSpeedMultiplier;
}

/**
 * Check if the player has completed all waves
 */
export function isLastWave(waveNumber: number): boolean {
    return waveNumber >= WAVE_PROGRESSION.TOTAL_WAVES;
}

/**
 * Check if a wave number is valid
 */
export function isValidWave(waveNumber: number): boolean {
    return waveNumber >= 1 && waveNumber <= WAVE_PROGRESSION.TOTAL_WAVES;
}

/**
 * Get the next wave number (returns current if already at max)
 */
export function getNextWaveNumber(currentWave: number): number {
    if (currentWave >= WAVE_PROGRESSION.TOTAL_WAVES) {
        return WAVE_PROGRESSION.TOTAL_WAVES;
    }
    return currentWave + 1;
}
