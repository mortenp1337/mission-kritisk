// GridCell class - represents a single cell in the grid
import { CellType, GridPosition, ScreenPosition } from '../types/GameTypes';
import { gridToScreen } from '../data/levelLayout';

export class GridCell {
    type: CellType;
    position: GridPosition;
    tower: any | null;
    screenPosition: ScreenPosition;
    sprite?: Phaser.GameObjects.Rectangle;
    
    constructor(position: GridPosition, type: CellType = CellType.Empty) {
        this.position = position;
        this.type = type;
        this.tower = null;
        this.screenPosition = gridToScreen(position);
    }
    
    isEmpty(): boolean {
        return this.type === CellType.Empty && this.tower === null;
    }
    
    isOccupied(): boolean {
        return this.type === CellType.Occupied || this.tower !== null;
    }
    
    isPath(): boolean {
        return this.type === CellType.Path;
    }
    
    isBase(): boolean {
        return this.type === CellType.Base;
    }
    
    setTower(tower: any): void {
        if (this.isPath() || this.isBase()) {
            throw new Error(`Cannot place tower on ${this.type} cell`);
        }
        this.tower = tower;
        this.type = CellType.Occupied;
    }
    
    removeTower(): void {
        this.tower = null;
        this.type = CellType.Empty;
    }
    
    // Create visual sprite for the cell
    createSprite(scene: Phaser.Scene, cellSize: number): void {
        const color = this.getCellColor();
        const alpha = this.type === CellType.Path ? 0.3 : 0.1;
        
        this.sprite = scene.add.rectangle(
            this.screenPosition.x,
            this.screenPosition.y,
            cellSize - 2,
            cellSize - 2,
            color,
            alpha
        );
    }
    
    private getCellColor(): number {
        switch (this.type) {
            case CellType.Empty:
                return 0x00ff00;  // Green
            case CellType.Occupied:
                return 0xff0000;  // Red
            case CellType.Path:
                return 0xffff00;  // Yellow
            case CellType.Base:
                return 0x0000ff;  // Blue
            default:
                return 0xffffff;  // White
        }
    }
    
    highlight(color: number = 0x00ff00): void {
        if (this.sprite) {
            this.sprite.setStrokeStyle(2, color);
        }
    }
    
    unhighlight(): void {
        if (this.sprite) {
            this.sprite.setStrokeStyle(0);
        }
    }
}
