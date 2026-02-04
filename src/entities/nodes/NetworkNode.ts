import { Entity } from '../Entity';
import { NodeType, NodeStatus, CELL_SIZE } from '../../constants';

export abstract class NetworkNode extends Entity {
  public readonly nodeType: NodeType;
  public status: NodeStatus = 'online';
  public label: string;
  public health = 100;
  public connectedTo: string[] = [];

  private ledTimer = 0;
  public ledOn = true;
  public blinking = false;
  private blinkTimer = 0;

  constructor(
    nodeType: NodeType,
    label: string,
    col: number,
    row: number,
    gridWidth = 2,
    gridHeight = 2,
  ) {
    super(nodeType, col, row, gridWidth, gridHeight);
    this.nodeType = nodeType;
    this.label = label;

    this.container.x = col * CELL_SIZE;
    this.container.y = row * CELL_SIZE;
  }

  override update(delta: number): void {
    this.ledTimer += delta;
    if (this.ledTimer > 0.5 + Math.random() * 0.5) {
      this.ledTimer = 0;
      this.ledOn = !this.ledOn;
    }

    if (this.blinking) {
      this.blinkTimer += delta;
      this.container.alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(this.blinkTimer * 8));
    } else {
      this.blinkTimer = 0;
      this.container.alpha = 1;
    }
  }

  get worldCenterX(): number {
    return this.gridCol * CELL_SIZE + (this.gridWidth * CELL_SIZE) / 2;
  }

  get worldCenterY(): number {
    return this.gridRow * CELL_SIZE + (this.gridHeight * CELL_SIZE) / 2;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.status = 'offline';
    } else if (this.health < 30) {
      this.status = 'critical';
    } else if (this.health < 70) {
      this.status = 'warning';
    }
  }

  repair(amount: number): void {
    this.health = Math.min(100, this.health + amount);
    if (this.health >= 70) {
      this.status = 'online';
    } else if (this.health >= 30) {
      this.status = 'warning';
    }
  }
}
