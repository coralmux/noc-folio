import type { Character } from '../Character';

export interface CharacterState {
  readonly name: string;
  enter(character: Character): void;
  update(character: Character, delta: number): void;
  exit(character: Character): void;
}
