import { GRID_COLS, GRID_ROWS, CELL_SIZE } from '../constants';
import { GridCell } from './GridCell';

export class Grid {
  public readonly cells: GridCell[][] = [];
  public readonly cols: number;
  public readonly rows: number;

  constructor(cols = GRID_COLS, rows = GRID_ROWS) {
    this.cols = cols;
    this.rows = rows;
    for (let row = 0; row < rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < cols; col++) {
        this.cells[row][col] = new GridCell(col, row);
      }
    }
  }

  getCell(col: number, row: number): GridCell | null {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return this.cells[row][col];
  }

  isWalkable(col: number, row: number): boolean {
    const cell = this.getCell(col, row);
    return cell !== null && cell.walkable && !cell.occupied;
  }

  cellToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: col * CELL_SIZE + CELL_SIZE / 2,
      y: row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  worldToCell(x: number, y: number): { col: number; row: number } {
    return {
      col: Math.floor(x / CELL_SIZE),
      row: Math.floor(y / CELL_SIZE),
    };
  }

  occupyCells(col: number, row: number, width: number, height: number, entityId: string): void {
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        const cell = this.getCell(c, r);
        if (cell) {
          cell.walkable = false;
          cell.entityId = entityId;
        }
      }
    }
  }

  freeCells(col: number, row: number, width: number, height: number): void {
    for (let r = row; r < row + height; r++) {
      for (let c = col; c < col + width; c++) {
        const cell = this.getCell(c, r);
        if (cell) {
          cell.walkable = true;
          cell.entityId = null;
        }
      }
    }
  }

  getNeighbors(col: number, row: number): GridCell[] {
    const neighbors: GridCell[] = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dc, dr] of dirs) {
      const cell = this.getCell(col + dc, row + dr);
      if (cell) neighbors.push(cell);
    }
    return neighbors;
  }
}
