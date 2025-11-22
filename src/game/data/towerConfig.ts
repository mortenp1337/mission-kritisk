// Tower configuration data
import { TowerStats } from '../types/TowerTypes';

export interface TowerConfigData {
    [key: string]: TowerStats[];
}

// Tower statistics for each type and level
export const TOWER_CONFIG: TowerConfigData = {
    basic: [
        // Level 1
        {
            cost: 50,
            attackDamage: 2,
            attackRange: 150,
            fireRate: 1000,
            upgradeCost: 30,
            special: 'None'
        },
        // Level 2
        {
            cost: 80,
            attackDamage: 3,
            attackRange: 180,
            fireRate: 1000,
            upgradeCost: 0,
            special: 'None'
        }
    ],
    rapid: [
        // Level 1
        {
            cost: 100,
            attackDamage: 1,
            attackRange: 120,
            fireRate: 500,
            upgradeCost: 50,
            special: 'High fire rate'
        },
        // Level 2
        {
            cost: 150,
            attackDamage: 2,
            attackRange: 140,
            fireRate: 500,
            upgradeCost: 0,
            special: 'High fire rate'
        }
    ],
    area: [
        // Level 1
        {
            cost: 150,
            attackDamage: 3,
            attackRange: 180,
            fireRate: 1500,
            upgradeCost: 75,
            special: 'Area damage (128px radius)'
        },
        // Level 2
        {
            cost: 225,
            attackDamage: 4,
            attackRange: 200,
            fireRate: 1500,
            upgradeCost: 0,
            special: 'Area damage (150px radius)'
        }
    ]
};

// Helper function to get tower stats
export function getTowerStats(type: string, level: number = 1): TowerStats {
    const config = TOWER_CONFIG[type];
    if (!config) {
        throw new Error(`Unknown tower type: ${type}`);
    }
    
    const levelIndex = level - 1;
    if (levelIndex < 0 || levelIndex >= config.length) {
        throw new Error(`Invalid level ${level} for tower type ${type}`);
    }
    
    return config[levelIndex];
}

// Get tower cost
export function getTowerCost(type: string, level: number = 1): number {
    return getTowerStats(type, level).cost;
}
