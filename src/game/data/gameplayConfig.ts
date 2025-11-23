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
 * Calculate zombie movement speed with multiplier applied
 * @param baseSpeed - Base speed from wave configuration (pixels per second)
 * @returns Adjusted speed = baseSpeed * zombieSpeedMultiplier
 */
export function getAdjustedSpeed(baseSpeed: number): number {
    return baseSpeed * GAMEPLAY_CONFIG.zombieSpeedMultiplier;
}
