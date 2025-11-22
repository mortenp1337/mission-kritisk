// Wave configuration and scaling
import { WaveConfig } from '../types/EnemyTypes';

/**
 * Calculate wave configuration based on wave number
 * Wave scaling formula:
 * - Zombie count: floor(5 * 1.2^(n-1))
 * - Zombie health: 5 + (n-1)
 * - Zombie speed: n >= 4 ? 50 * (1 + (n-3) * 0.1) : 50
 * - Coin per problem: 10 + (n-1) * 5
 * - Bonus coins: 25 (constant)
 */
export function calculateWaveConfig(waveNumber: number): WaveConfig {
    if (waveNumber < 1 || waveNumber > 5) {
        throw new Error(`Invalid wave number: ${waveNumber}. Must be 1-5.`);
    }
    
    const baseZombies = 5;
    const baseHealth = 5;
    const baseSpeed = 50;
    const baseCoinReward = 10;
    const bonusCoins = 25;
    const spawnInterval = 2000; // 2 seconds
    
    // Calculate scaled values
    const zombieCount = Math.floor(baseZombies * Math.pow(1.2, waveNumber - 1));
    const health = baseHealth + (waveNumber - 1);
    const speed = waveNumber >= 4 
        ? baseSpeed * (1 + (waveNumber - 3) * 0.1)
        : baseSpeed;
    const coinPerProblem = baseCoinReward + (waveNumber - 1) * 5;
    
    return {
        waveNumber,
        zombieCount,
        zombieStats: {
            health,
            speed
        },
        spawnInterval,
        rewards: {
            coinPerProblem,
            bonusCoins
        }
    };
}

// Pre-calculated wave configurations for reference
export const WAVE_CONFIGS: WaveConfig[] = [
    calculateWaveConfig(1),
    calculateWaveConfig(2),
    calculateWaveConfig(3),
    calculateWaveConfig(4),
    calculateWaveConfig(5)
];
