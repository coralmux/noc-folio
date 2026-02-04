import { CharacterState } from './CharacterState';
import { IdleState } from './IdleState';
import type { Character } from '../Character';
import { CELL_SIZE } from '../../constants';

export class WalkState implements CharacterState {
  readonly name = 'walk';
  private path: { col: number; row: number }[];
  private currentTarget = 0;
  private readonly speed = 80; // pixels per second
  private onArrive?: (character: Character) => void;

  constructor(path: { col: number; row: number }[], onArrive?: (character: Character) => void) {
    this.path = path;
    this.onArrive = onArrive;
  }

  enter(_character: Character): void {
    this.currentTarget = 0;
  }

  update(character: Character, delta: number): void {
    if (this.currentTarget >= this.path.length) {
      if (this.onArrive) {
        this.onArrive(character);
      } else {
        character.setState(new IdleState());
      }
      return;
    }

    const target = this.path[this.currentTarget];
    const targetX = target.col * CELL_SIZE + CELL_SIZE / 2;
    const targetY = target.row * CELL_SIZE + CELL_SIZE / 2;

    const dx = targetX - character.container.x;
    const dy = targetY - character.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      character.gridCol = target.col;
      character.gridRow = target.row;
      character.container.x = targetX;
      character.container.y = targetY;
      this.currentTarget++;
    } else {
      const step = Math.min(this.speed * delta, dist);
      character.container.x += (dx / dist) * step;
      character.container.y += (dy / dist) * step;

      // Update facing direction
      if (Math.abs(dx) > Math.abs(dy)) {
        character.facing = dx > 0 ? 'right' : 'left';
      } else {
        character.facing = dy > 0 ? 'down' : 'up';
      }
    }
  }

  exit(_character: Character): void {}
}
