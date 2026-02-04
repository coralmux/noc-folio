import { TicketSystem } from '../systems/TicketSystem';
import { Ticket } from '../systems/Ticket';

export class TicketBoard {
  private panel: HTMLDivElement;
  private ticketSystem: TicketSystem;
  private chartSection: HTMLDivElement;
  private listSection: HTMLDivElement;
  private onTicketClick?: (ticketId: string) => void;

  constructor(container: HTMLElement, ticketSystem: TicketSystem, onTicketClick?: (ticketId: string) => void) {
    this.ticketSystem = ticketSystem;
    this.onTicketClick = onTicketClick;

    this.panel = document.createElement('div');
    this.panel.id = 'ticket-board';
    this.panel.style.cssText = `
      padding: 12px;
      color: #d6dbe0;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `;

    this.chartSection = document.createElement('div');
    this.listSection = document.createElement('div');
    this.listSection.style.cssText = 'flex: 1; overflow-y: auto; min-height: 0;';

    this.panel.appendChild(this.chartSection);
    this.panel.appendChild(this.listSection);
    container.appendChild(this.panel);
  }

  update(): void {
    const stats = this.ticketSystem.getStats();
    const total = stats.open + stats.inProgress + stats.resolved || 1;
    const openPct = Math.round((stats.open / total) * 100);
    const wipPct = Math.round((stats.inProgress / total) * 100);
    const donePct = Math.round((stats.resolved / total) * 100);

    // Severity distribution
    const all = this.ticketSystem.getAllTickets();
    const sev = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const t of all) {
      if (t.status !== 'resolved') sev[t.severity]++;
    }
    const sevTotal = sev.critical + sev.high + sev.medium + sev.low || 1;

    // Chart section (innerHTML — no interaction needed)
    this.chartSection.innerHTML = `
      <div style="flex-shrink: 0; margin-bottom: 12px; border-bottom: 1px solid #181e2c; padding-bottom: 12px;">
        <div style="color: #72b3e8; font-size: 10px; margin-bottom: 10px; letter-spacing: 1px;">TICKET STATUS</div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 18px; font-weight: bold; color: #d9a840;">${stats.open}</div>
            <div style="font-size: 9px; color: #959da5;">OPEN</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 18px; font-weight: bold; color: #72b3e8;">${stats.inProgress}</div>
            <div style="font-size: 9px; color: #959da5;">WIP</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 18px; font-weight: bold; color: #61c777;">${stats.resolved}</div>
            <div style="font-size: 9px; color: #959da5;">DONE</div>
          </div>
        </div>

        <div style="display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: #181e2c;">
          ${total > 1
            ? `<div style="width: ${openPct}%; background: #d9a840;"></div>
               <div style="width: ${wipPct}%; background: #72b3e8;"></div>
               <div style="width: ${donePct}%; background: #61c777;"></div>`
            : '<div style="width: 100%; background: #61c777; opacity: 0.3;"></div>'
          }
        </div>
      </div>

      <div style="flex-shrink: 0; margin-bottom: 12px; border-bottom: 1px solid #181e2c; padding-bottom: 12px;">
        <div style="color: #72b3e8; font-size: 10px; margin-bottom: 8px; letter-spacing: 1px;">SEVERITY</div>
        ${this.sevBar('CRT', sev.critical, sevTotal, '#e06468')}
        ${this.sevBar('HIG', sev.high, sevTotal, '#d9a840')}
        ${this.sevBar('MED', sev.medium, sevTotal, '#c8b840')}
        ${this.sevBar('LOW', sev.low, sevTotal, '#61c777')}
      </div>
    `;

    // Ticket list section (createElement — click handlers needed)
    this.listSection.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'color: #72b3e8; font-size: 10px; margin-bottom: 6px; letter-spacing: 1px;';
    header.textContent = 'RECENT';
    this.listSection.appendChild(header);

    const tickets = all.slice(0, 8);

    if (tickets.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #61c777; font-size: 10px;';
      empty.textContent = 'All clear';
      this.listSection.appendChild(empty);
      return;
    }

    for (const t of tickets) {
      const row = this.createTicketRow(t);
      this.listSection.appendChild(row);
    }
  }

  private createTicketRow(t: Ticket): HTMLDivElement {
    const row = document.createElement('div');
    row.style.cssText = `
      padding: 3px 4px;
      font-size: 10px;
      border-bottom: 1px solid #141820;
      display: flex;
      gap: 4px;
      align-items: center;
      transition: background 0.15s;
    `;

    // Status-specific styles
    if (t.status === 'resolved') {
      row.style.opacity = '0.4';
      row.style.textDecoration = 'line-through';
    } else if (t.status === 'in_progress') {
      row.style.borderLeft = '2px solid #72b3e8';
      row.style.paddingLeft = '6px';
    }

    // Severity dot
    const dot = document.createElement('span');
    dot.style.color = this.getSeverityColor(t.severity);
    dot.innerHTML = '&#9679;';
    row.appendChild(dot);

    // Title
    const title = document.createElement('span');
    title.style.cssText = 'color: #b0b8c4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;';
    title.textContent = t.title;
    row.appendChild(title);

    // Assignee emoji
    if (t.assigneeEmoji) {
      const emoji = document.createElement('span');
      emoji.style.cssText = 'font-size: 10px; flex-shrink: 0;';
      emoji.textContent = t.assigneeEmoji;
      row.appendChild(emoji);
    }

    // Clickable only if open + has a challengeTemplateId
    const isClickable = t.status === 'open' && !!t.challengeTemplateId;

    if (isClickable) {
      row.style.cursor = 'pointer';
      row.addEventListener('mouseenter', () => {
        row.style.background = '#1a2a2a';
      });
      row.addEventListener('mouseleave', () => {
        row.style.background = '';
      });
      row.addEventListener('click', () => {
        if (this.onTicketClick) {
          this.onTicketClick(t.id);
        }
      });
    }

    return row;
  }

  private sevBar(label: string, count: number, total: number, color: string): string {
    const pct = Math.round((count / total) * 100);
    return `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="width: 24px; font-size: 9px; color: #959da5;">${label}</span>
        <div style="flex: 1; height: 4px; border-radius: 2px; background: #181e2c;">
          <div style="width: ${pct}%; height: 100%; border-radius: 2px; background: ${color};"></div>
        </div>
        <span style="width: 14px; font-size: 9px; color: #959da5; text-align: right;">${count}</span>
      </div>
    `;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#e06468';
      case 'high': return '#d9a840';
      case 'medium': return '#c8b840';
      case 'low': return '#61c777';
      default: return '#d6dbe0';
    }
  }
}
