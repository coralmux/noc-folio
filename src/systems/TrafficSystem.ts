import { EventBus } from '../core/EventBus';
import { CableManager } from '../entities/cables/CableManager';
import { PacketManager } from '../entities/effects/PacketManager';
import { randomPick, randomChance } from '../utils/random';

export class TrafficSystem {
  private eventBus: EventBus;
  private cableManager: CableManager;
  private packetManager: PacketManager;
  private elapsed = 0;
  private packetInterval = 0.8; // send a packet every N seconds
  public totalPackets = 0;
  public packetsPerSecond = 0;
  private recentPackets: number[] = [];

  constructor(eventBus: EventBus, cableManager: CableManager, packetManager: PacketManager) {
    this.eventBus = eventBus;
    this.cableManager = cableManager;
    this.packetManager = packetManager;
  }

  update(delta: number): void {
    this.elapsed += delta;

    // Track packets per second
    const now = performance.now();
    this.recentPackets = this.recentPackets.filter(t => now - t < 1000);
    this.packetsPerSecond = this.recentPackets.length;

    if (this.elapsed >= this.packetInterval) {
      this.elapsed = 0;

      const cables = this.cableManager.getCables();
      if (cables.length === 0) return;

      // Send 1-3 packets along random cables
      const count = randomChance(0.3) ? 3 : randomChance(0.5) ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const cable = randomPick(cables);
        if (!cable.damaged) {
          const reverse = randomChance(0.5);
          const from = reverse ? cable.toNodeId : cable.fromNodeId;
          const to = reverse ? cable.fromNodeId : cable.toNodeId;
          this.packetManager.sendPacket(from, to);
          this.eventBus.emit('packet:send', { from, to });
          this.totalPackets++;
          this.recentPackets.push(now);
        }
      }
    }
  }
}
