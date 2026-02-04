import { NetworkNode } from './NetworkNode';
import { PixelSprites } from '../../rendering/PixelSprites';

export class Server extends NetworkNode {
  public variant: string;

  constructor(label: string, col: number, row: number, variant = 'generic') {
    super('server', label, col, row, 2, 2);
    this.variant = variant;
    this.buildSprite();
  }

  buildSprite(): void {
    const sprite = PixelSprites.createNode('server', this.gridWidth, this.gridHeight);
    this.container.addChild(sprite);
  }
}
