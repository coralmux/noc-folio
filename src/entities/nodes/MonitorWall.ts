import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class MonitorWall extends NetworkNode {
  constructor(label: string, col: number, row: number) {
    super('monitorwall', label, col, row, 3, 2);
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('monitorwall', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
