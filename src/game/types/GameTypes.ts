// Game session and state types

export interface GameSession {
    grade: number;                    // Selected grade level (0-3) - DEPRECATED: Use difficulty instead
    difficulty: number;               // Selected difficulty level (1-4)
    category: string;                 // Selected challenge category ('math' | 'logic')
    challengeType: string;            // Selected challenge type identifier
    coins: number;                    // Current coin balance
    currentWave: number;              // Wave number (1-5)
    baseHealth: number;               // Base health points (starts at 10)
    placedTowers: PlacedTowerData[];  // Array of tower placements
    problemsSolved: number;           // Count of correctly answered problems this wave
    totalScore: number;               // Accumulated score across all waves
    gameSpeed: number;                // Current game speed multiplier (0.5x to 5.0x)
}

export interface PlacedTowerData {
    type: TowerType;
    position: GridPosition;
    level: number;
}

export interface GridPosition {
    row: number;
    col: number;
}

export interface ScreenPosition {
    x: number;
    y: number;
}

export enum TowerType {
    Basic = 'basic',
    Rapid = 'rapid',
    Area = 'area'
}

export enum CellType {
    Empty = 'empty',
    Occupied = 'occupied',
    Path = 'path',
    Base = 'base'
}

export interface CoinBalance {
    amount: number;
    lastUpdated: number;
}
