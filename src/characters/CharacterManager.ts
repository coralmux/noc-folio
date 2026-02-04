import { Container } from 'pixi.js';
import { Character } from './Character';
import { CharacterType } from '../constants';
import { Pathfinder } from './pathfinding/Pathfinder';
import { Grid } from '../world/Grid';
import { EventBus } from '../core/EventBus';
import { EntityManager } from '../entities/EntityManager';
import { IdleState } from './states/IdleState';

export class CharacterManager {
  public readonly container: Container;
  private characters: Character[] = [];
  private pathfinder: Pathfinder;
  private eventBus: EventBus;
  private entityManager: EntityManager;
  private spriteCounterX = 1;
  private spriteCounterY = 1;
  private rawScaleX = 1;
  private rawScaleY = 1;

  constructor(grid: Grid, eventBus: EventBus, entityManager: EntityManager) {
    this.container = new Container();
    this.pathfinder = new Pathfinder(grid);
    this.eventBus = eventBus;
    this.entityManager = entityManager;
  }

  spawn(type: CharacterType, col: number, row: number): Character {
    const character = new Character(type, col, row, this.pathfinder, this.eventBus);
    character.spriteCounterX = this.spriteCounterX;
    character.spriteCounterY = this.spriteCounterY;
    character.rawScaleX = this.rawScaleX;
    character.rawScaleY = this.rawScaleY;
    // Re-initialize with type-aware idle state
    character.setState(new IdleState(this.entityManager));
    this.characters.push(character);
    this.container.addChild(character.container);
    this.eventBus.emit('character:spawn', { characterId: character.id, type });
    return character;
  }

  /** 비균일 스케일 보정값을 모든 캐릭터에 전파 */
  setSpriteScale(counterX: number, counterY: number, rawScaleX?: number, rawScaleY?: number): void {
    this.spriteCounterX = counterX;
    this.spriteCounterY = counterY;
    if (rawScaleX !== undefined) this.rawScaleX = rawScaleX;
    if (rawScaleY !== undefined) this.rawScaleY = rawScaleY;
    for (const character of this.characters) {
      character.spriteCounterX = counterX;
      character.spriteCounterY = counterY;
      character.rawScaleX = this.rawScaleX;
      character.rawScaleY = this.rawScaleY;
    }
  }

  despawn(id: string): void {
    const idx = this.characters.findIndex(c => c.id === id);
    if (idx >= 0) {
      const character = this.characters[idx];
      this.container.removeChild(character.container);
      character.destroy();
      this.characters.splice(idx, 1);
      this.eventBus.emit('character:despawn', { characterId: id });
    }
  }

  getAll(): Character[] {
    return this.characters;
  }

  getById(id: string): Character | undefined {
    return this.characters.find(c => c.id === id);
  }

  getByType(type: CharacterType): Character[] {
    return this.characters.filter(c => c.type === type);
  }

  getAvailableEngineer(): Character | undefined {
    return this.characters.find(
      c => c.type === 'engineer' && !c.busy && (c.currentStateName === 'idle' || c.currentStateName === 'walk'),
    );
  }

  update(delta: number): void {
    for (const character of this.characters) {
      character.update(delta);
    }
  }
}
