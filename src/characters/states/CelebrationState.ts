import { CharacterState } from './CharacterState';
import { IdleState } from './IdleState';
import type { Character } from '../Character';

export class CelebrationState implements CharacterState {
  readonly name = 'celebration';
  private elapsed = 0;
  private readonly duration = 2.0;
  private baseY = 0;

  enter(character: Character): void {
    this.elapsed = 0;
    this.baseY = character.container.y;
    character.setBubble('🎉');
  }

  update(character: Character, delta: number): void {
    this.elapsed += delta;

    // Jump animation
    const jumpPhase = Math.sin(this.elapsed * 6) * 4;
    character.container.y = this.baseY - Math.max(0, jumpPhase);

    if (this.elapsed >= this.duration) {
      character.container.y = this.baseY;
      character.clearBubble();
      character.setState(new IdleState());
    }
  }

  exit(character: Character): void {
    character.container.y = this.baseY;
    character.clearBubble();
  }
}
