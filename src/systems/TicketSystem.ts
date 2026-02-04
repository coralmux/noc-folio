import { Ticket } from './Ticket';
import { EventBus } from '../core/EventBus';
import { CharacterManager } from '../characters/CharacterManager';
import { RespondState } from '../characters/states/RespondState';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { getRandomTemplate } from '../data/challengeTemplates';
import { randomFloat } from '../utils/random';

let ticketCounter = 0;

interface PendingResolution {
  ticketId: string;
  engineerId: string;
  resolveAt: number;
}

/**
 * TicketSystem 고도화:
 * 1. severity 기반 대응 속도 차등화 (critical=즉시, high=5초, medium=15초, low=25초)
 * 2. 에스컬레이션 — 장기 미해결 critical 티켓에 추가 엔지니어 투입
 * 3. incident 유형/damage 정보를 RespondState에 전달
 * 4. 복수 엔지니어 동시 대응 지원
 */
export class TicketSystem {
  private tickets: Ticket[] = [];
  private eventBus: EventBus;
  private characterManager: CharacterManager;
  private entityManager: EntityManager;
  private gameTime = 0;

  private autoPickupTimer = 0;
  private nextAutoPickup = 5;  // 초기 체크 간격 (기존 20→5초로 단축)
  private escalationTimer = 0;
  private pendingResolutions: PendingResolution[] = [];

  constructor(eventBus: EventBus, characterManager: CharacterManager, entityManager: EntityManager) {
    this.eventBus = eventBus;
    this.characterManager = characterManager;
    this.entityManager = entityManager;

    // Auto-create ticket when incident starts
    this.eventBus.on('incident:start', ({ incidentId, type, targetNodeId }) => {
      const template = getRandomTemplate(type);
      const severity = this.getSeverityForType(type);
      const ticket = this.createTicket(
        `[${type.toUpperCase()}] 장애 대응`,
        severity,
        incidentId,
        type,
        template?.id,
      );

      // critical/high → 즉시 엔지니어 배정 시도
      if (severity === 'critical' || severity === 'high') {
        this.immediatePickup(ticket);
      }
    });

    // Resolve ticket when incident resolves
    this.eventBus.on('incident:resolved', ({ incidentId }) => {
      const ticket = this.tickets.find(t => t.incidentId === incidentId && t.status !== 'resolved');
      if (ticket) {
        ticket.status = 'resolved';
        ticket.resolvedAt = this.gameTime;
        this.eventBus.emit('ticket:resolved', { ticketId: ticket.id });
      }
    });

    // Player resolves a ticket via challenge
    this.eventBus.on('ticket:player:resolved', ({ ticketId }) => {
      const ticket = this.tickets.find(t => t.id === ticketId);
      if (ticket && ticket.status !== 'resolved') {
        ticket.status = 'resolved';
        ticket.resolvedAt = this.gameTime;
        ticket.assigneeEmoji = '🧑‍💻';
        this.eventBus.emit('ticket:resolved', { ticketId: ticket.id });
        if (ticket.incidentId) {
          this.eventBus.emit('incident:resolved', { incidentId: ticket.incidentId });
        }
      }
    });
  }

  private getSeverityForType(type: string): Ticket['severity'] {
    if (['ddos', 'rm_rf', 'ransomware'].includes(type)) return 'critical';
    if (['cable_cut', 'power_outage'].includes(type)) return 'high';
    if (['overload', 'memory_leak'].includes(type)) return 'medium';
    return 'low';
  }

  private getDamageForType(type: string): number {
    const damageMap: Record<string, number> = {
      ddos: 40, rm_rf: 60, ransomware: 45,
      cable_cut: 30, power_outage: 50,
      overload: 20, memory_leak: 15,
      misconfiguration: 10, hacker: 30,
    };
    return damageMap[type] ?? 20;
  }

  createTicket(title: string, severity: Ticket['severity'], incidentId?: string, incidentType?: string, challengeTemplateId?: string): Ticket {
    const ticket: Ticket = {
      id: `ticket_${ticketCounter++}`,
      title,
      severity,
      incidentId,
      incidentType,
      challengeTemplateId,
      status: 'open',
      createdAt: this.gameTime,
    };
    this.tickets.push(ticket);
    this.eventBus.emit('ticket:created', { ticketId: ticket.id });

    return ticket;
  }

  /** critical/high 장애 즉시 배정 */
  private immediatePickup(ticket: Ticket): void {
    const engineer = this.characterManager.getAvailableEngineer();
    if (!engineer) return;  // 가용 엔지니어 없으면 다음 타이머에서 재시도

    this.assignTicket(ticket, engineer.id);
  }

  /** 주기적 티켓 배정 */
  private engineerAutoPickup(): void {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const openTickets = this.tickets
      .filter(t => t.status === 'open' && !t.assigneeId)
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    if (openTickets.length === 0) return;

    const engineer = this.characterManager.getAvailableEngineer();
    if (!engineer) return;

    this.assignTicket(openTickets[0], engineer.id);
  }

  /** 티켓을 엔지니어에게 배정 */
  private assignTicket(ticket: Ticket, engineerId: string): void {
    const engineer = this.characterManager.getById(engineerId);
    if (!engineer) return;

    ticket.assigneeId = engineerId;
    ticket.assigneeEmoji = engineer.currentEmoji || '🔧';
    ticket.status = 'in_progress';
    engineer.busy = true;
    this.eventBus.emit('ticket:assigned', { ticketId: ticket.id, assigneeId: engineerId });

    // 장애 노드 찾아서 대응
    if (ticket.incidentId) {
      const nodes = this.entityManager.getAll().filter(
        (e): e is NetworkNode => e instanceof NetworkNode && e.status !== 'online',
      );
      if (nodes.length > 0) {
        const targetNode = nodes[0];
        const destCol = targetNode.gridCol + targetNode.gridWidth;
        const destRow = targetNode.gridRow + Math.floor(targetNode.gridHeight / 2);

        // 장애 유형 + damage 정보를 RespondState에 전달
        const incidentType = ticket.incidentType ?? 'generic';
        const damage = this.getDamageForType(incidentType);
        engineer.setState(new RespondState(destCol, destRow, targetNode.id, incidentType, damage));
      }
    }

    // severity 비례 자동 해결 시간
    const autoResolveTime = this.getAutoResolveTime(ticket.severity);
    this.pendingResolutions.push({
      ticketId: ticket.id,
      engineerId,
      resolveAt: this.gameTime + autoResolveTime,
    });
  }

  /** severity별 자동 해결 시간 */
  private getAutoResolveTime(severity: Ticket['severity']): number {
    switch (severity) {
      case 'critical': return randomFloat(15, 25);
      case 'high': return randomFloat(12, 20);
      case 'medium': return randomFloat(8, 15);
      case 'low': return randomFloat(6, 12);
    }
  }

  /** 에스컬레이션 — 장기 미해결 critical 티켓에 추가 인력 투입 */
  private checkEscalation(): void {
    const ESCALATION_THRESHOLD = 20; // 20초 이상 미해결 시

    const criticalInProgress = this.tickets.filter(
      t => t.status === 'in_progress' && t.severity === 'critical'
        && (this.gameTime - t.createdAt) > ESCALATION_THRESHOLD,
    );

    for (const ticket of criticalInProgress) {
      // 이미 에스컬레이션된 티켓은 스킵 (같은 incident에 2명 이상 배정 여부)
      const assignedCount = this.pendingResolutions.filter(
        p => p.ticketId === ticket.id,
      ).length;
      if (assignedCount >= 2) continue;

      // 추가 엔지니어 찾기
      const engineer = this.characterManager.getAvailableEngineer();
      if (!engineer || engineer.id === ticket.assigneeId) continue;

      // 추가 인력 투입
      engineer.busy = true;
      this.eventBus.emit('ticket:escalated', { ticketId: ticket.id, assigneeId: engineer.id });

      if (ticket.incidentId) {
        const nodes = this.entityManager.getAll().filter(
          (e): e is NetworkNode => e instanceof NetworkNode && e.status !== 'online',
        );
        if (nodes.length > 0) {
          const targetNode = nodes[0];
          const destCol = targetNode.gridCol + targetNode.gridWidth;
          const destRow = targetNode.gridRow + Math.floor(targetNode.gridHeight / 2);
          const incidentType = ticket.incidentType ?? 'generic';
          const damage = this.getDamageForType(incidentType);
          engineer.setState(new RespondState(destCol, destRow, targetNode.id, incidentType, damage));
        }
      }

      this.pendingResolutions.push({
        ticketId: ticket.id,
        engineerId: engineer.id,
        resolveAt: this.gameTime + randomFloat(8, 15),
      });
    }
  }

  private processPendingResolutions(): void {
    const resolved: string[] = [];

    for (const pending of this.pendingResolutions) {
      if (this.gameTime >= pending.resolveAt) {
        const ticket = this.tickets.find(t => t.id === pending.ticketId);
        if (ticket && ticket.status === 'in_progress') {
          ticket.status = 'resolved';
          ticket.resolvedAt = this.gameTime;
          this.eventBus.emit('ticket:resolved', { ticketId: ticket.id });
          if (ticket.incidentId) {
            this.eventBus.emit('incident:resolved', { incidentId: ticket.incidentId });
          }
        }

        // Free the engineer
        const engineer = this.characterManager.getById(pending.engineerId);
        if (engineer) {
          engineer.busy = false;
        }

        resolved.push(pending.ticketId);
      }
    }

    if (resolved.length > 0) {
      this.pendingResolutions = this.pendingResolutions.filter(p => !resolved.includes(p.ticketId));
    }
  }

  private cleanupResolvedTickets(): void {
    this.tickets = this.tickets.filter(t => {
      if (t.status === 'resolved' && t.resolvedAt) {
        return (this.gameTime - t.resolvedAt) < 5;
      }
      return true;
    });
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  update(delta: number): void {
    this.gameTime += delta;

    // severity 기반 차등 체크 간격
    this.autoPickupTimer += delta;
    if (this.autoPickupTimer >= this.nextAutoPickup) {
      this.autoPickupTimer = 0;

      // 미해결 티켓이 있으면 더 빈번하게 체크
      const hasOpenCritical = this.tickets.some(t => t.status === 'open' && (t.severity === 'critical' || t.severity === 'high'));
      this.nextAutoPickup = hasOpenCritical ? randomFloat(2, 5) : randomFloat(10, 20);

      this.engineerAutoPickup();
    }

    // 에스컬레이션 체크 (10초마다)
    this.escalationTimer += delta;
    if (this.escalationTimer >= 10) {
      this.escalationTimer = 0;
      this.checkEscalation();
    }

    // Process pending auto-resolutions
    this.processPendingResolutions();

    // Cleanup resolved tickets after 5 seconds
    this.cleanupResolvedTickets();
  }

  getOpenTickets(): Ticket[] {
    return this.tickets.filter(t => t.status !== 'resolved');
  }

  getAllTickets(): Ticket[] {
    return this.tickets;
  }

  getStats(): { open: number; inProgress: number; resolved: number } {
    return {
      open: this.tickets.filter(t => t.status === 'open').length,
      inProgress: this.tickets.filter(t => t.status === 'in_progress').length,
      resolved: this.tickets.filter(t => t.status === 'resolved').length,
    };
  }
}
