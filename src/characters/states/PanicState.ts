import { CharacterState } from './CharacterState';
import { IdleState } from './IdleState';
import type { Character } from '../Character';

export class PanicState implements CharacterState {
  readonly name = 'panic';
  private duration: number;
  private elapsed = 0;
  private shakeDir = 1;

  constructor(duration = 2.5) {
    this.duration = duration;
  }

  enter(character: Character): void {
    this.elapsed = 0;
    character.setBubble('😱');
  }

  update(character: Character, delta: number): void {
    this.elapsed += delta;

    if (this.elapsed >= this.duration) {
      character.clearBubble();
      character.setState(new IdleState());
    }
  }

  exit(character: Character): void {
    character.clearBubble();
  }
}
