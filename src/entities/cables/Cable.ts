import { Graphics } from 'pixi.js';
import { COLORS } from '../../constants';

let cableCounter = 0;

export class Cable {
  public readonly id: string;
  public readonly graphics: Graphics;
  public readonly fromNodeId: string;
  public readonly toNodeId: string;
  public damaged = false;

  constructor(
    fromNodeId: string,
    toNodeId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) {
    this.id = `cable_${cableCounter++}`;
    this.fromNodeId = fromNodeId;
    this.toNodeId = toNodeId;
    this.graphics = new Graphics();
    this.draw(fromX, fromY, toX, toY);
  }

  draw(fromX: number, fromY: number, toX: number, toY: number): void {
    this.graphics.clear();
    const color = this.damaged ? COLORS.CABLE_DAMAGED : COLORS.CABLE_NORMAL;
    const midX = (fromX + toX) / 2;

    // Orthogonal Z-shape routing: horizontal → vertical → horizontal
    this.graphics
      .moveTo(fromX, fromY)
      .lineTo(midX, fromY)
      .lineTo(midX, toY)
      .lineTo(toX, toY)
      .stroke({ width: 2, color, alpha: 0.6 });

    // Damage warning marker at midpoint
    if (this.damaged) {
      const cx = midX;
      const cy = (fromY + toY) / 2;
      // Warning triangle
      this.graphics
        .moveTo(cx - 4, cy + 3)
        .lineTo(cx, cy - 4)
        .lineTo(cx + 4, cy + 3)
        .closePath()
        .fill({ color: COLORS.CABLE_DAMAGED, alpha: 0.9 });
      // Exclamation mark line
      this.graphics
        .rect(cx - 0.5, cy - 2, 1, 3)
        .fill({ color: 0xffffff, alpha: 0.9 });
      // Exclamation mark dot
      this.graphics
        .circle(cx, cy + 2, 0.5)
        .fill({ color: 0xffffff, alpha: 0.9 });
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
