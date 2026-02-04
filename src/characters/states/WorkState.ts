import { CharacterState } from './CharacterState';
import { IdleState } from './IdleState';
import type { Character } from '../Character';

export class WorkState implements CharacterState {
  readonly name = 'work';
  private duration: number;
  private elapsed = 0;
  private onComplete?: (character: Character) => void;

  constructor(duration = 3.0, onComplete?: (character: Character) => void) {
    this.duration = duration;
    this.onComplete = onComplete;
  }

  enter(character: Character): void {
    this.elapsed = 0;
    // task가 세팅되어 있으면 그걸 유지, 아니면 기본 이모지
    if (!character.currentAction && character.currentCommands.length === 0) {
      character.setBubble('🔧');
    }
  }

  update(character: Character, delta: number): void {
    this.elapsed += delta;

    if (this.elapsed >= this.duration) {
      character.clearBubble();
      if (this.onComplete) {
        this.onComplete(character);
      } else {
        character.setState(new IdleState());
      }
    }
  }

  exit(character: Character): void {
    character.container.rotation = 0;
  }
}
