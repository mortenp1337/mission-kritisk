// Enemy and wave types
import { ScreenPosition } from './GameTypes';

export interface ZombieStats {
    health: number;
    speed: number;  // pixels per second
}

export interface Zombie {
    id: string;
    health: number;
    maxHealth: number;
    speed: number;
    pathProgress: number;       // 0-1 where 1 = reached base
    position: ScreenPosition;
    damageToBase: number;       // Always 1
    sprite?: Phaser.GameObjects.Sprite;
    healthBar?: Phaser.GameObjects.Graphics;
}

export interface WaveConfig {
    waveNumber: number;
    zombieCount: number;
    zombieStats: ZombieStats;
    spawnInterval: number;      // milliseconds between spawns
    rewards: {
        coinPerProblem: number;
        bonusCoins: number;     // awarded on wave completion
    };
}

export interface ZombieSpawnData {
    id: string;
    health: number;
    speed: number;
    spawnTime: number;          // When to spawn (ms from wave start)
    position: ScreenPosition;
}
