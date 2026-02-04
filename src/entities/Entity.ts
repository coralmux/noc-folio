import { Container } from 'pixi.js';

let entityCounter = 0;

export abstract class Entity {
  public readonly id: string;
  public readonly container: Container;
  public gridCol: number;
  public gridRow: number;
  public gridWidth: number;
  public gridHeight: number;

  constructor(
    type: string,
    col: number,
    row: number,
    gridWidth = 1,
    gridHeight = 1,
  ) {
    this.id = `${type}_${entityCounter++}`;
    this.container = new Container();
    this.gridCol = col;
    this.gridRow = row;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  abstract buildSprite(): void;

  update(_delta: number): void {
    // Override in subclasses
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
