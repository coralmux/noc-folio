import { CharacterState } from './CharacterState';
import { PanicState } from './PanicState';
import type { Character } from '../Character';

export class AttackState implements CharacterState {
  readonly name = 'attack';
  private elapsed = 0;
  private readonly duration = 3.0;
  private nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  enter(character: Character): void {
    this.elapsed = 0;
    character.setBubble('💀');
    if (character.eventBus) {
      character.eventBus.emit('node:damaged', { nodeId: this.nodeId, reason: 'hacker' });
    }
  }

  update(character: Character, delta: number): void {
    this.elapsed += delta;

    if (this.elapsed >= this.duration) {
      character.clearBubble();
      // Hacker panics and tries to escape
      character.setState(new PanicState(1.5));
    }
  }

  exit(character: Character): void {
    character.container.rotation = 0;
  }
}
