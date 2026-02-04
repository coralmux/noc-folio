import { CharacterState } from './CharacterState';
import { WalkState } from './WalkState';
import type { Character } from '../Character';
import { randomInt, randomFloat, randomChance } from '../../utils/random';
import { GRID_COLS, PHYSICAL_ROWS } from '../../constants';
import { EntityManager } from '../../entities/EntityManager';
import { getPubZoneBounds } from '../../world/WorldLayout';
import { engineerIdleBehavior } from '../types/Engineer';
import { hackerIdleBehavior } from '../types/Hacker';
import { janitorIdleBehavior } from '../types/Janitor';
import { newbieIdleBehavior } from '../types/Newbie';
import { managerIdleBehavior } from '../types/Manager';

export class IdleState implements CharacterState {
  readonly name = 'idle';
  private waitTime = 0;
  private elapsed = 0;
  private entityManager?: EntityManager;

  constructor(entityManager?: EntityManager) {
    this.entityManager = entityManager;
  }

  enter(_character: Character): void {
    this.waitTime = randomFloat(1.5, 5.0);
    this.elapsed = 0;
  }

  update(character: Character, delta: number): void {
    this.elapsed += delta;
    if (this.elapsed < this.waitTime) return;

    // Try type-specific behavior if entityManager available
    if (this.entityManager) {
      switch (character.type) {
        case 'engineer':
          engineerIdleBehavior(character, this.entityManager);
          return;
        case 'hacker':
          hackerIdleBehavior(character, this.entityManager);
          return;
        case 'janitor':
          janitorIdleBehavior(character, this.entityManager);
          return;
        case 'newbie':
          newbieIdleBehavior(character, this.entityManager);
          return;
        case 'manager':
          managerIdleBehavior(character, this.entityManager);
          return;
      }
    }

    // Fallback: 70% chance to walk toward Pub zone, 30% random walk
    let targetCol: number;
    let targetRow: number;

    if (randomChance(0.7)) {
      const pub = getPubZoneBounds();
      targetCol = randomInt(pub.col + 1, pub.col + pub.width - 2);
      targetRow = randomInt(pub.row + 1, pub.row + pub.height - 2);
    } else {
      targetCol = randomInt(3, GRID_COLS - 4);
      targetRow = randomInt(3, PHYSICAL_ROWS - 4);
    }

    const path = character.pathfinder.findPath(
      character.gridCol, character.gridRow,
      targetCol, targetRow,
    );
    if (path && path.length > 0) {
      character.setState(new WalkState(path));
    } else {
      this.elapsed = this.waitTime - 0.5;
    }
  }

  exit(_character: Character): void {}
}
