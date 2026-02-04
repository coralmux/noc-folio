import { Graphics } from 'pixi.js';
import { COLORS, NodeStatus } from '../../constants';

export class StatusIndicator {
  public graphics: Graphics;
  private timer = 0;
  private blinkRate = 1.0;

  constructor() {
    this.graphics = new Graphics();
  }

  update(delta: number, status: NodeStatus): void {
    this.timer += delta;
    this.graphics.clear();

    const color = this.getColor(status);
    let alpha = 1;

    switch (status) {
      case 'online':
        alpha = 0.8;
        this.blinkRate = 2.0;
        break;
      case 'warning':
        alpha = Math.sin(this.timer * this.blinkRate * Math.PI) > 0 ? 1 : 0.3;
        this.blinkRate = 3.0;
        break;
      case 'critical':
        alpha = Math.sin(this.timer * this.blinkRate * Math.PI) > 0 ? 1 : 0;
        this.blinkRate = 6.0;
        break;
      case 'offline':
        alpha = 0.2;
        break;
    }

    this.graphics.circle(0, 0, 3).fill({ color, alpha });
    // Glow
    if (status !== 'offline') {
      this.graphics.circle(0, 0, 6).fill({ color, alpha: alpha * 0.2 });
    }
  }

  private getColor(status: NodeStatus): number {
    switch (status) {
      case 'online': return COLORS.STATUS_OK;
      case 'warning': return COLORS.STATUS_WARN;
      case 'critical': return COLORS.STATUS_CRITICAL;
      case 'offline': return COLORS.STATUS_OFFLINE;
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
