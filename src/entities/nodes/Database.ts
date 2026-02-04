import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class Database extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('database', label, col, row, 2, 2);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('database', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
