import { Container } from 'pixi.js';

export class Camera {
  public x = 0;
  public y = 0;
  public zoom = 1;

  /** resizeToFit()에서 설정하는 축별 기본 스케일 */
  public baseScaleX = 1;
  public baseScaleY = 1;

  private target: Container;

  constructor(target: Container) {
    this.target = target;
  }

  update(): void {
    const sx = this.baseScaleX * this.zoom;
    const sy = this.baseScaleY * this.zoom;
    this.target.x = -this.x * sx;
    this.target.y = -this.y * sy;
    this.target.scale.set(sx, sy);
  }
}
