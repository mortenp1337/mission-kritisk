// Tower-related types
import { GridPosition } from './GameTypes';

export interface TowerStats {
    cost: number;
    attackDamage: number;
    attackRange: number;      // pixels
    fireRate: number;         // milliseconds
    upgradeCost: number;
    special: string;          // Description of special ability
}

export interface TowerConfig {
    [key: string]: TowerStats[];  // Index by tower type, array for levels
}

export interface ITower {
    readonly id: string;
    readonly type: string;
    readonly position: GridPosition;
    level: number;
    
    update(time: number, zombies: any[]): void;
    upgrade(): number;
    canUpgrade(): boolean;
    getStats(): TowerStats;
    destroy(): void;
}
