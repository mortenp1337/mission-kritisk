// Level layout configuration for math tower defense
import { GridPosition } from '../types/GameTypes';

// Grid dimensions
export const GRID_ROWS = 10;
export const GRID_COLS = 15;
export const CELL_SIZE = 64;

// Calculate grid offset to center it in 1024x768 screen
// Grid width: 15 * 64 = 960px
// Grid height: 10 * 64 = 640px
// Offset X: (1024 - 960) / 2 = 32px
// Offset Y: (768 - 640) / 2 = 64px
export const GRID_OFFSET_X = 32;
export const GRID_OFFSET_Y = 64;

// Path definition: straight line from left to right through the middle
// Row 5 is the middle row (0-indexed, so rows 0-9, middle is 5)
export const PATH: GridPosition[] = [
    { row: 5, col: 0 },   // Spawn point (left edge)
    { row: 5, col: 1 },
    { row: 5, col: 2 },
    { row: 5, col: 3 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
    { row: 5, col: 6 },
    { row: 5, col: 7 },
    { row: 5, col: 8 },
    { row: 5, col: 9 },
    { row: 5, col: 10 },
    { row: 5, col: 11 },
    { row: 5, col: 12 },
    { row: 5, col: 13 },
    { row: 5, col: 14 },  // Base point (right edge)
];

export const SPAWN_POINT: GridPosition = { row: 5, col: 0 };
export const BASE_POINT: GridPosition = { row: 5, col: 14 };

// Helper function to check if a position is on the path
export function isOnPath(position: GridPosition): boolean {
    return PATH.some(p => p.row === position.row && p.col === position.col);
}

// Helper function to convert grid position to screen position
export function gridToScreen(gridPos: GridPosition): { x: number; y: number } {
    return {
        x: GRID_OFFSET_X + gridPos.col * CELL_SIZE + CELL_SIZE / 2,
        y: GRID_OFFSET_Y + gridPos.row * CELL_SIZE + CELL_SIZE / 2
    };
}

// Helper function to convert screen position to grid position
export function screenToGrid(screenX: number, screenY: number): GridPosition | null {
    const col = Math.floor((screenX - GRID_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((screenY - GRID_OFFSET_Y) / CELL_SIZE);
    
    // Check if position is within grid bounds
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        return { row, col };
    }
    
    return null;
}
