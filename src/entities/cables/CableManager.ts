import { Container } from 'pixi.js';
import { Cable } from './Cable';
import { NetworkNode } from '../nodes/NetworkNode';
import { EntityManager } from '../EntityManager';

export class CableManager {
  public readonly container: Container;
  private cables: Cable[] = [];

  constructor() {
    this.container = new Container();
  }

  connect(fromNode: NetworkNode, toNode: NetworkNode): Cable {
    const cable = new Cable(
      fromNode.id,
      toNode.id,
      fromNode.worldCenterX,
      fromNode.worldCenterY,
      toNode.worldCenterX,
      toNode.worldCenterY,
    );
    this.cables.push(cable);
    this.container.addChild(cable.graphics);

    fromNode.connectedTo.push(toNode.id);
    toNode.connectedTo.push(fromNode.id);

    return cable;
  }

  connectByIds(fromId: string, toId: string, entityManager: EntityManager): Cable | null {
    const fromNode = entityManager.get(fromId) as NetworkNode | undefined;
    const toNode = entityManager.get(toId) as NetworkNode | undefined;
    if (!fromNode || !toNode) return null;
    return this.connect(fromNode, toNode);
  }

  getCables(): Cable[] {
    return this.cables;
  }

  getCableById(id: string): Cable | undefined {
    return this.cables.find(c => c.id === id);
  }

  getCablesForNode(nodeId: string): Cable[] {
    return this.cables.filter(c => c.fromNodeId === nodeId || c.toNodeId === nodeId);
  }

  removeCable(id: string): void {
    const idx = this.cables.findIndex(c => c.id === id);
    if (idx >= 0) {
      const cable = this.cables[idx];
      this.container.removeChild(cable.graphics);
      cable.destroy();
      this.cables.splice(idx, 1);
    }
  }
}
