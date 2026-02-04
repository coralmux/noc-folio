import { Graphics } from 'pixi.js';
import { COLORS } from '../../constants';

export interface PacketWaypoint {
  x: number;
  y: number;
}

export class Packet {
  public graphics: Graphics;
  public alive = true;
  private waypoints: PacketWaypoint[];
  private segmentLengths: number[];
  private totalLength: number;
  private progress = 0;
  private speed: number;

  constructor(waypoints: PacketWaypoint[], color: number = COLORS.PACKET_DATA) {
    // Filter out zero-length segments
    const filtered: PacketWaypoint[] = [waypoints[0]];
    for (let i = 1; i < waypoints.length; i++) {
      const prev = filtered[filtered.length - 1];
      const cur = waypoints[i];
      if (cur.x !== prev.x || cur.y !== prev.y) {
        filtered.push(cur);
      }
    }
    this.waypoints = filtered.length >= 2 ? filtered : waypoints;

    // Pre-compute segment lengths
    this.segmentLengths = [];
    this.totalLength = 0;
    for (let i = 1; i < this.waypoints.length; i++) {
      const dx = this.waypoints[i].x - this.waypoints[i - 1].x;
      const dy = this.waypoints[i].y - this.waypoints[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      this.segmentLengths.push(len);
      this.totalLength += len;
    }

    this.speed = 1.2 + Math.random() * 0.6;

    this.graphics = new Graphics();
    this.graphics.rect(-3, -3, 6, 6).fill(color);
    this.graphics.rect(-1, -1, 2, 2).fill(0xffffff);
    this.graphics.x = this.waypoints[0].x;
    this.graphics.y = this.waypoints[0].y;
  }

  update(delta: number): void {
    this.progress += delta * this.speed;
    if (this.progress >= 1) {
      this.alive = false;
      return;
    }

    // Map progress to position along the polyline
    const targetDist = this.progress * this.totalLength;
    let accumulated = 0;
    for (let i = 0; i < this.segmentLengths.length; i++) {
      const segLen = this.segmentLengths[i];
      if (accumulated + segLen >= targetDist) {
        const t = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
        const a = this.waypoints[i];
        const b = this.waypoints[i + 1];
        this.graphics.x = a.x + (b.x - a.x) * t;
        this.graphics.y = a.y + (b.y - a.y) * t;
        break;
      }
      accumulated += segLen;
    }

    this.graphics.alpha = this.progress < 0.1 ? this.progress * 10 :
      this.progress > 0.9 ? (1 - this.progress) * 10 : 1;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
