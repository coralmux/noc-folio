import { IncidentSystem } from '../systems/IncidentSystem';
import { TrafficSystem } from '../systems/TrafficSystem';
import { CharacterManager } from '../characters/CharacterManager';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
export class StatsBar {
  private bar: HTMLDivElement;
  private incidentSystem: IncidentSystem;
  private trafficSystem: TrafficSystem;
  private characterManager: CharacterManager;
  private entityManager: EntityManager;
  private startTime: number;

  constructor(
    container: HTMLElement,
    incidentSystem: IncidentSystem,
    trafficSystem: TrafficSystem,
    characterManager: CharacterManager,
    entityManager: EntityManager,
  ) {
    this.incidentSystem = incidentSystem;
    this.trafficSystem = trafficSystem;
    this.characterManager = characterManager;
    this.entityManager = entityManager;
    this.startTime = Date.now();

    this.bar = document.createElement('div');
    this.bar.id = 'stats-bar';
    this.bar.style.cssText = `
      height: 36px;
      background: rgba(12, 16, 24, 0.95);
      border-bottom: 1px solid #283040;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      color: #d6dbe0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    `;
    container.appendChild(this.bar);
  }

  update(): void {
    const uptime = this.formatUptime(Date.now() - this.startTime);
    const activeIncidents = this.incidentSystem.getActiveIncidents().length;
    const pps = this.trafficSystem.packetsPerSecond;
    const totalPackets = this.trafficSystem.totalPackets;
    const characters = this.characterManager.getAll().length;

    const nodes = this.entityManager.getAll().filter(
      (e): e is NetworkNode => e instanceof NetworkNode,
    );
    const onlineNodes = nodes.filter(n => n.status === 'online').length;

    const incidentColor = activeIncidents > 0 ? '#e06468' : '#61c777';

    this.bar.innerHTML = `
      <span>${uptime}</span>
      <span style="color: #61c777;">${onlineNodes}/${nodes.length} nodes</span>
      <span>${pps}pps (${this.formatNumber(totalPackets)})</span>
      <span style="color: ${incidentColor};">${activeIncidents} incidents</span>
      <span>${characters} staff</span>
    `;
  }

  private formatUptime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  private formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
}
