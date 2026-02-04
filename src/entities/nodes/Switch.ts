import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class Switch extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('switch', label, col, row, 2, 1);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('switch', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
