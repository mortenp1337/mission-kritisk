// Grid system types
import { CellType, GridPosition, ScreenPosition } from './GameTypes';

export interface GridCell {
    type: CellType;
    position: GridPosition;
    tower: any | null;  // Tower reference
    screenPosition: ScreenPosition;
    sprite?: Phaser.GameObjects.Rectangle;
}

export interface Grid {
    rows: number;
    cols: number;
    cellSize: number;
    cells: GridCell[][];
    path: GridPosition[];
    spawnPoint: GridPosition;
    basePoint: GridPosition;
}

export { CellType, GridPosition, ScreenPosition };
