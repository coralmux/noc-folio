import { Application, Container, FederatedPointerEvent } from 'pixi.js';
import { EventBus } from './EventBus';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { CELL_SIZE } from '../constants';

export class InputManager {
  private eventBus: EventBus;
  private entityManager: EntityManager;
  private nodeIds: Set<string>;
  private gameContainer: Container;

  constructor(
    app: Application,
    eventBus: EventBus,
    entityManager: EntityManager,
    nodeIds: Set<string>,
    gameContainer: Container,
  ) {
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.nodeIds = nodeIds;
    this.gameContainer = gameContainer;

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerdown', this.onPointerDown.bind(this));
  }

  private onPointerDown(event: FederatedPointerEvent): void {
    // Convert screen coords to game-world coords (accounts for container scale)
    const local = this.gameContainer.toLocal(event.global);
    const col = Math.floor(local.x / CELL_SIZE);
    const row = Math.floor(local.y / CELL_SIZE);

    // Check only nodes belonging to this canvas
    const entities = this.entityManager.getAll();
    for (const entity of entities) {
      if (entity instanceof NetworkNode && this.nodeIds.has(entity.id)) {
        if (
          col >= entity.gridCol &&
          col < entity.gridCol + entity.gridWidth &&
          row >= entity.gridRow &&
          row < entity.gridRow + entity.gridHeight
        ) {
          console.log(`[NOC] Clicked node: ${entity.id} (${entity.label}) - Status: ${entity.status}`);
          this.eventBus.emit('node:click', { nodeId: entity.id });
          return;
        }
      }
    }
  }
}
