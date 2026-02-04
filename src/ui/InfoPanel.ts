import { NetworkNode } from '../entities/nodes/NetworkNode';

export class InfoPanel {
  private panel: HTMLDivElement;
  private visible = false;

  constructor(overlay: HTMLElement) {
    this.panel = document.createElement('div');
    this.panel.id = 'info-panel';
    this.panel.style.cssText = `
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 300px;
      max-height: 80vh;
      background: rgba(13, 17, 23, 0.95);
      border: 1px solid #283040;
      border-radius: 8px;
      padding: 20px;
      color: #d6dbe0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      display: none;
      overflow-y: auto;
      pointer-events: auto;
      z-index: 100;
    `;

    this.panel.addEventListener('click', (e) => e.stopPropagation());
    overlay.addEventListener('click', () => this.hide());
    overlay.appendChild(this.panel);
  }

  showForNode(node: NetworkNode): void {
    const statusColor = this.getStatusColor(node.status);
    const healthBar = this.renderHealthBar(node.health);

    this.panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="color: #61c777; font-size: 11px;">📡 ${node.label}</span>
        <button id="info-close" style="background:none; border:none; color:#959da5; cursor:pointer; font-size:18px;">&times;</button>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #959da5;">Type:</span> <span style="color: #b0b8c4;">${node.nodeType.toUpperCase()}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #959da5;">Status:</span>
        <span style="color: ${statusColor}; font-weight: bold;">${node.status.toUpperCase()}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #959da5;">Health:</span>
        ${healthBar}
      </div>
      <div style="margin-bottom: 12px;">
        <span style="color: #959da5;">Connections:</span>
        <span style="color: #b0b8c4;">${node.connectedTo.length} links</span>
      </div>
    `;

    this.panel.querySelector('#info-close')?.addEventListener('click', () => this.hide());
    this.show();
  }

  private renderHealthBar(health: number): string {
    const filled = Math.round(health / 5);
    const empty = 20 - filled;
    const color = health > 70 ? '#61c777' : health > 30 ? '#d9a840' : '#e06468';
    return `
      <div style="display: inline-block; margin-left: 8px;">
        <span style="color: ${color};">${'█'.repeat(filled)}</span><span style="color: #252a3a;">${'█'.repeat(empty)}</span>
        <span style="color: ${color}; margin-left: 4px;">${health}%</span>
      </div>
    `;
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'online': return '#61c777';
      case 'warning': return '#d9a840';
      case 'critical': return '#e06468';
      case 'offline': return '#959da5';
      default: return '#d6dbe0';
    }
  }

  private show(): void {
    this.panel.style.display = 'block';
    this.visible = true;
  }

  hide(): void {
    this.panel.style.display = 'none';
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
