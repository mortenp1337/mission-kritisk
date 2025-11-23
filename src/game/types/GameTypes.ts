// Game session and state types

export interface GameSession {
    grade: number;                    // Selected grade level (0-3)
    coins: number;                    // Current coin balance
    currentWave: number;              // Wave number (1-5)
    baseHealth: number;               // Base health points (starts at 10)
    placedTowers: PlacedTowerData[];  // Array of tower placements
    problemsSolved: number;           // Count of correctly answered problems this wave
    totalScore: number;               // Accumulated score across all waves
    gameSpeed: number;                // Current game speed multiplier (0.5x to 2.0x)
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

export interface SpeedControlConfig {
    minSpeed: number;           // Minimum speed multiplier (e.g., 0.5x)
    maxSpeed: number;           // Maximum speed multiplier (e.g., 2.0x)
    speedStep: number;          // Speed increment/decrement per button press (e.g., 0.5x)
    debounceDelay: number;      // Minimum milliseconds between button presses (e.g., 100ms)
}
