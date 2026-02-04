import { Container } from 'pixi.js';
import { Packet, PacketWaypoint } from './Packet';
import { EntityManager } from '../EntityManager';
import { NetworkNode } from '../nodes/NetworkNode';
import { COLORS } from '../../constants';

export class PacketManager {
  public readonly container: Container;
  private packets: Packet[] = [];
  private entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.container = new Container();
    this.entityManager = entityManager;
  }

  sendPacket(fromId: string, toId: string): void {
    const fromNode = this.entityManager.get(fromId) as NetworkNode | undefined;
    const toNode = this.entityManager.get(toId) as NetworkNode | undefined;
    if (!fromNode || !toNode) return;

    // Pick color based on node status
    let color: number = COLORS.PACKET_DATA;
    if (fromNode.status === 'critical' || toNode.status === 'critical') {
      color = COLORS.PACKET_ALERT;
    } else if (fromNode.status === 'warning' || toNode.status === 'warning') {
      color = COLORS.PACKET_REQUEST;
    }

    const fromX = fromNode.worldCenterX;
    const fromY = fromNode.worldCenterY;
    const toX = toNode.worldCenterX;
    const toY = toNode.worldCenterY;

    // Z-shape waypoints matching Cable.draw() routing
    const midX = (fromX + toX) / 2;
    const waypoints: PacketWaypoint[] = [
      { x: fromX, y: fromY },
      { x: midX, y: fromY },
      { x: midX, y: toY },
      { x: toX, y: toY },
    ];

    const packet = new Packet(waypoints, color);
    this.packets.push(packet);
    this.container.addChild(packet.graphics);
  }

  update(delta: number): void {
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const packet = this.packets[i];
      packet.update(delta);
      if (!packet.alive) {
        this.container.removeChild(packet.graphics);
        packet.destroy();
        this.packets.splice(i, 1);
      }
    }
  }
}
