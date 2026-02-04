import { EventBus } from '../core/EventBus';
import { TrafficSystem } from '../systems/TrafficSystem';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';

interface LogEntry {
  time: string;
  message: string;
  color: string;
}

const SPARKLINE_SIZE = 40;

export class MiniLog {
  private panel: HTMLDivElement;
  private logs: LogEntry[] = [];
  private maxLogs = 30;
  private ppsHistory: number[] = new Array(SPARKLINE_SIZE).fill(0);
  private trafficSystem: TrafficSystem;
  private entityManager: EntityManager;

  constructor(
    container: HTMLElement,
    eventBus: EventBus,
    trafficSystem?: TrafficSystem,
    entityManager?: EntityManager,
  ) {
    this.trafficSystem = trafficSystem!;
    this.entityManager = entityManager!;

    this.panel = document.createElement('div');
    this.panel.id = 'mini-log';
    this.panel.style.cssText = `
      padding: 8px 12px;
      color: #d6dbe0;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `;
    container.appendChild(this.panel);

    // Subscribe to events
    eventBus.on('incident:start', ({ incidentId, type }) => {
      this.addLog(`[ALERT] ${incidentId}: ${type}`, '#e06468');
    });
    eventBus.on('incident:resolved', ({ incidentId }) => {
      this.addLog(`[OK] ${incidentId} resolved`, '#61c777');
    });
    eventBus.on('ticket:created', ({ ticketId }) => {
      this.addLog(`[TICKET] ${ticketId}`, '#d9a840');
    });
    eventBus.on('ticket:assigned', ({ ticketId, assigneeId }) => {
      this.addLog(`[ASSIGN] ${ticketId} -> ${assigneeId}`, '#72b3e8');
    });
    eventBus.on('ticket:resolved', ({ ticketId }) => {
      this.addLog(`[DONE] ${ticketId}`, '#61c777');
    });
    eventBus.on('node:damaged', ({ nodeId, reason }) => {
      this.addLog(`[DMG] ${nodeId}: ${reason}`, '#e06468');
    });
    eventBus.on('node:repaired', ({ nodeId }) => {
      this.addLog(`[FIX] ${nodeId}`, '#61c777');
    });
    eventBus.on('cable:cut', ({ cableId }) => {
      this.addLog(`[CABLE] ${cableId} cut`, '#d9a840');
    });
    eventBus.on('character:spawn', ({ characterId, type }) => {
      this.addLog(`[+] ${type}: ${characterId}`, '#b48de6');
    });
    eventBus.on('challenge:blinking', ({ nodeId }) => {
      this.addLog(`[!!] Challenge on ${nodeId}`, '#d07048');
    });
    eventBus.on('challenge:start', ({ nodeId }) => {
      this.addLog(`[>] Challenge started ${nodeId}`, '#72b3e8');
    });
    eventBus.on('challenge:success', ({ nodeId }) => {
      this.addLog(`[WIN] ${nodeId} fixed`, '#61c777');
    });
    eventBus.on('challenge:failed', ({ nodeId }) => {
      this.addLog(`[FAIL] ${nodeId} failed`, '#e06468');
    });
  }

  private addLog(message: string, color: string): void {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.logs.push({ time, message, color });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  update(): void {
    // Record PPS history
    if (this.trafficSystem) {
      this.ppsHistory.push(this.trafficSystem.packetsPerSecond);
      if (this.ppsHistory.length > SPARKLINE_SIZE) this.ppsHistory.shift();
    }

    // Node health
    let onlineCount = 0;
    let totalCount = 0;
    if (this.entityManager) {
      const nodes = this.entityManager.getAll().filter(
        (e): e is NetworkNode => e instanceof NetworkNode,
      );
      totalCount = nodes.length;
      onlineCount = nodes.filter(n => n.status === 'online').length;
    }
    const healthPct = totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 100;
    const healthColor = healthPct === 100 ? '#61c777' : healthPct >= 70 ? '#d9a840' : '#e06468';

    // Sparkline
    const max = Math.max(1, ...this.ppsHistory);
    const sparkBars = this.ppsHistory.map(v => {
      const h = Math.max(1, Math.round((v / max) * 28));
      return `<div style="flex:1; display:flex; align-items:flex-end;">
        <div style="width:100%; height:${h}px; background:#72b3e8; border-radius:1px 1px 0 0; opacity:${0.4 + (v / max) * 0.6};"></div>
      </div>`;
    }).join('');

    const currentPps = this.trafficSystem ? this.trafficSystem.packetsPerSecond : 0;

    this.panel.innerHTML = `
      <!-- Traffic sparkline -->
      <div style="flex-shrink: 0; margin-bottom: 12px; border-bottom: 1px solid #181e2c; padding-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="color: #72b3e8; font-size: 10px; letter-spacing: 1px;">TRAFFIC</span>
          <span style="color: #d6dbe0; font-size: 12px; font-weight: bold;">${currentPps} <span style="font-size: 9px; color: #959da5;">pps</span></span>
        </div>
        <div style="display: flex; gap: 1px; height: 30px; align-items: flex-end;">
          ${sparkBars}
        </div>
      </div>

      <!-- Node health -->
      <div style="flex-shrink: 0; margin-bottom: 12px; border-bottom: 1px solid #181e2c; padding-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="color: #72b3e8; font-size: 10px; letter-spacing: 1px;">NODE HEALTH</span>
          <span style="color: ${healthColor}; font-size: 12px; font-weight: bold;">${healthPct}%</span>
        </div>
        <div style="height: 6px; border-radius: 3px; background: #181e2c;">
          <div style="width: ${healthPct}%; height: 100%; border-radius: 3px; background: ${healthColor}; transition: width 0.3s;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 9px; color: #959da5;">${onlineCount}/${totalCount} online</span>
        </div>
      </div>

      <!-- Event log -->
      <div style="flex: 1; overflow-y: auto; min-height: 0;">
        <div style="color: #72b3e8; font-size: 10px; margin-bottom: 4px; letter-spacing: 1px;">EVENT LOG</div>
        ${this.logs.slice(-10).reverse().map(l => `
          <div style="padding: 1px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span style="color: #959da5;">${l.time}</span>
            <span style="color: ${l.color};">${l.message}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}
