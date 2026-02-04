import { Grid } from '../../world/Grid';

interface PathNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class Pathfinder {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  findPath(
    startCol: number, startRow: number,
    endCol: number, endRow: number,
  ): { col: number; row: number }[] | null {
    // If destination is not walkable, find nearest walkable neighbor
    if (!this.grid.isWalkable(endCol, endRow)) {
      const alt = this.findNearestWalkable(endCol, endRow);
      if (!alt) return null;
      endCol = alt.col;
      endRow = alt.row;
    }

    if (startCol === endCol && startRow === endRow) return [];

    const open: PathNode[] = [];
    const closed = new Set<string>();

    const startNode: PathNode = {
      col: startCol, row: startRow,
      g: 0, h: this.heuristic(startCol, startRow, endCol, endRow),
      f: 0, parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    open.push(startNode);

    let iterations = 0;
    const maxIterations = 2000;

    while (open.length > 0 && iterations < maxIterations) {
      iterations++;

      // Find lowest f
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const current = open[bestIdx];
      open.splice(bestIdx, 1);

      if (current.col === endCol && current.row === endRow) {
        return this.reconstructPath(current);
      }

      const key = `${current.col},${current.row}`;
      if (closed.has(key)) continue;
      closed.add(key);

      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dc, dr] of dirs) {
        const nc = current.col + dc;
        const nr = current.row + dr;
        const nKey = `${nc},${nr}`;

        if (closed.has(nKey)) continue;
        if (!this.grid.isWalkable(nc, nr) && !(nc === endCol && nr === endRow)) continue;

        const g = current.g + 1;
        const h = this.heuristic(nc, nr, endCol, endRow);
        const neighbor: PathNode = {
          col: nc, row: nr,
          g, h, f: g + h,
          parent: current,
        };

        const existing = open.find(n => n.col === nc && n.row === nr);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = g + existing.h;
            existing.parent = current;
          }
        } else {
          open.push(neighbor);
        }
      }
    }

    return null; // No path found
  }

  private heuristic(col1: number, row1: number, col2: number, row2: number): number {
    return Math.abs(col2 - col1) + Math.abs(row2 - row1);
  }

  private reconstructPath(node: PathNode): { col: number; row: number }[] {
    const path: { col: number; row: number }[] = [];
    let current: PathNode | null = node;
    while (current) {
      path.unshift({ col: current.col, row: current.row });
      current = current.parent;
    }
    // Remove start position
    if (path.length > 0) path.shift();
    return path;
  }

  private findNearestWalkable(col: number, row: number): { col: number; row: number } | null {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
    for (const [dc, dr] of dirs) {
      if (this.grid.isWalkable(col + dc, row + dr)) {
        return { col: col + dc, row: row + dr };
      }
    }
    return null;
  }
}
