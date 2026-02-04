import { Entity } from './Entity';

export class EntityManager {
  private entities = new Map<string, Entity>();

  add(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  remove(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      entity.destroy();
      this.entities.delete(id);
    }
  }

  get(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  getAll(): Entity[] {
    return Array.from(this.entities.values());
  }

  getByType<T extends Entity>(type: new (...args: unknown[]) => T): T[] {
    return this.getAll().filter((e): e is T => e instanceof type);
  }

  update(delta: number): void {
    for (const entity of this.entities.values()) {
      entity.update(delta);
    }
  }
}
