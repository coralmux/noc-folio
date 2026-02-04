import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class Firewall extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('firewall', label, col, row, 2, 2);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('firewall', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
