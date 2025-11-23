// Gameplay configuration - centralized speed and timing parameters
// All speed-related gameplay elements reference this configuration

export interface GameplayConfig {
    speedMultiplier: number;
    zombieSpeedMultiplier: number;
    towerFireRateMultiplier: number;
}

export const GAMEPLAY_CONFIG: GameplayConfig = {
    speedMultiplier: 1.5,           // Master multiplier (50% faster)
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

/**
 * Calculate tower firing rate with multiplier applied
 * @param baseFireRate - Base fire rate from tower configuration (shots per second)
 * @returns Adjusted fire rate = baseFireRate * towerFireRateMultiplier
 */
export function getAdjustedFireRate(baseFireRate: number): number {
    return baseFireRate * GAMEPLAY_CONFIG.towerFireRateMultiplier;
}
