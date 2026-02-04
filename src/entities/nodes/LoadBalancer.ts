import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class LoadBalancer extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('loadbalancer', label, col, row, 2, 2);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('loadbalancer', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
