import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class Router extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('router', label, col, row, 2, 2);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('router', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
