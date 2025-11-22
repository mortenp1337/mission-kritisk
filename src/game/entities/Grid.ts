// Grid system - manages the 2D grid for tower placement
import { CellType, GridPosition } from '../types/GameTypes';
import { GridCell } from './GridCell';
import {
    GRID_ROWS,
    GRID_COLS,
    CELL_SIZE,
    PATH,
    SPAWN_POINT,
    BASE_POINT,
    isOnPath,
    gridToScreen,
    screenToGrid
} from '../data/levelLayout';

export class Grid {
    rows: number;
    cols: number;
    cellSize: number;
    cells: GridCell[][];
    path: GridPosition[];
    spawnPoint: GridPosition;
    basePoint: GridPosition;
    
    constructor() {
        this.rows = GRID_ROWS;
        this.cols = GRID_COLS;
        this.cellSize = CELL_SIZE;
        this.path = PATH;
        this.spawnPoint = SPAWN_POINT;
        this.basePoint = BASE_POINT;
        this.cells = [];
        
        this.initializeCells();
    }
    
    private initializeCells(): void {
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const position = { row, col };
                let cellType = CellType.Empty;
                
                // Determine cell type
                if (row === this.basePoint.row && col === this.basePoint.col) {
                    cellType = CellType.Base;
                } else if (isOnPath(position)) {
                    cellType = CellType.Path;
                }
                
                this.cells[row][col] = new GridCell(position, cellType);
            }
        }
    }
    
    getCell(row: number, col: number): GridCell | null {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.cells[row][col];
        }
        return null;
    }
    
    getCellAt(position: GridPosition): GridCell | null {
        return this.getCell(position.row, position.col);
    }
    
    isValidPlacement(row: number, col: number): boolean {
        const cell = this.getCell(row, col);
        if (!cell) {
            return false;
        }
        return cell.isEmpty();
    }
    
    getTowerAt(row: number, col: number): any | null {
        const cell = this.getCell(row, col);
        return cell ? cell.tower : null;
    }
    
    placeTower(row: number, col: number, tower: any): boolean {
        if (!this.isValidPlacement(row, col)) {
            return false;
        }
        
        const cell = this.getCell(row, col);
        if (cell) {
            cell.setTower(tower);
            return true;
        }
        return false;
    }
    
    removeTower(row: number, col: number): void {
        const cell = this.getCell(row, col);
        if (cell) {
            cell.removeTower();
        }
    }
    
    screenToGrid(x: number, y: number): GridPosition | null {
        return screenToGrid(x, y);
    }
    
    gridToScreen(row: number, col: number): { x: number; y: number } {
        return gridToScreen({ row, col });
    }
    
    // Create visual representation of the grid
    createVisuals(scene: Phaser.Scene): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col].createSprite(scene, this.cellSize);
            }
        }
    }
    
    // Get all empty cells suitable for tower placement
    getEmptyCells(): GridCell[] {
        const emptyCells: GridCell[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.isEmpty()) {
                    emptyCells.push(cell);
                }
            }
        }
        return emptyCells;
    }
    
    // Get all path cells in order
    getPathCells(): GridCell[] {
        return this.path.map(pos => this.getCellAt(pos)).filter(cell => cell !== null) as GridCell[];
    }
}
