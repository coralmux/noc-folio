import { EventBus } from '../core/EventBus';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { CHALLENGE_TEMPLATES, ChallengeTemplate, getRandomTemplate, getTemplateById } from '../data/challengeTemplates';
import { randomChance } from '../utils/random';

export interface ActiveChallenge {
  nodeId: string;
  template: ChallengeTemplate;
  currentStep: number;
  totalWrongCount: number;
  stepWrongCount: number;
  started: boolean;
  ticketId?: string;
}

export class ChallengeSystem {
  private eventBus: EventBus;
  private entityManager: EntityManager;
  private cooldownTimer = 0;
  private currentChallenge: ActiveChallenge | null = null;
  private blinkTimer = 0;

  private static readonly COOLDOWN = 45;
  private static readonly BLINK_DURATION = 10;
  private static readonly TRIGGER_CHANCE = 0.3;

  constructor(eventBus: EventBus, entityManager: EntityManager) {
    this.eventBus = eventBus;
    this.entityManager = entityManager;

    this.eventBus.on('incident:start', ({ type, targetNodeId }) => {
      this.onIncidentStart(type, targetNodeId);
    });

    this.eventBus.on('node:click', ({ nodeId }) => {
      this.onNodeClick(nodeId);
    });
  }

  private onIncidentStart(incidentType: string, targetNodeId: string): void {
    if (this.currentChallenge) return;
    if (this.cooldownTimer > 0) return;
    if (!randomChance(ChallengeSystem.TRIGGER_CHANCE)) return;

    const template = getRandomTemplate(incidentType);
    if (!template) return;

    const targetNode = this.entityManager.get(targetNodeId) as NetworkNode | undefined;
    if (!targetNode) return;

    targetNode.blinking = true;

    this.currentChallenge = {
      nodeId: targetNode.id,
      template,
      currentStep: 0,
      totalWrongCount: 0,
      stepWrongCount: 0,
      started: false,
    };

    this.blinkTimer = 0;

    this.eventBus.emit('challenge:blinking', {
      nodeId: targetNode.id,
      challengeType: incidentType,
    });
  }

  private onNodeClick(nodeId: string): void {
    if (!this.currentChallenge) return;
    if (this.currentChallenge.nodeId !== nodeId) return;
    if (this.currentChallenge.started) return;

    this.currentChallenge.started = true;

    // Stop blinking
    const node = this.entityManager.get(nodeId) as NetworkNode | undefined;
    if (node) node.blinking = false;

    this.eventBus.emit('challenge:start', {
      nodeId,
      challengeType: this.currentChallenge.template.incidentType,
    });
  }

  startTicketChallenge(templateId: string, ticketId: string): ActiveChallenge | null {
    if (this.currentChallenge) return null;

    const template = getTemplateById(templateId);
    if (!template) return null;

    this.currentChallenge = {
      nodeId: '',
      template,
      currentStep: 0,
      totalWrongCount: 0,
      stepWrongCount: 0,
      started: true,
      ticketId,
    };

    return this.currentChallenge;
  }

  submitAnswer(optionIndex: number): { correct: boolean; output: string; done: boolean; failed: boolean; autoHint: boolean } {
    if (!this.currentChallenge) {
      return { correct: false, output: '', done: true, failed: true, autoHint: false };
    }

    const challenge = this.currentChallenge;
    const step = challenge.template.steps[challenge.currentStep];
    const correct = optionIndex === step.correctIndex;

    if (correct) {
      const output = step.successOutput;
      challenge.currentStep++;
      challenge.stepWrongCount = 0;

      if (challenge.currentStep >= challenge.template.steps.length) {
        if (challenge.ticketId) {
          // Ticket-based challenge complete
          this.eventBus.emit('ticket:player:resolved', { ticketId: challenge.ticketId });
          this.eventBus.emit('challenge:success', { nodeId: challenge.nodeId });
        } else {
          // Node-based challenge complete - repair node
          const node = this.entityManager.get(challenge.nodeId) as NetworkNode | undefined;
          if (node) {
            node.repair(100);
            node.blinking = false;
          }
          this.eventBus.emit('node:repaired', { nodeId: challenge.nodeId });
          this.eventBus.emit('challenge:success', { nodeId: challenge.nodeId });
        }
        this.cooldownTimer = ChallengeSystem.COOLDOWN;
        this.currentChallenge = null;
        return { correct: true, output, done: true, failed: false, autoHint: false };
      }

      return { correct: true, output, done: false, failed: false, autoHint: false };
    } else {
      challenge.totalWrongCount++;
      challenge.stepWrongCount++;
      const output = step.failureOutput;

      if (challenge.totalWrongCount >= 3) {
        // Total failure
        if (!challenge.ticketId) {
          const node = this.entityManager.get(challenge.nodeId) as NetworkNode | undefined;
          if (node) node.blinking = false;
        }
        this.eventBus.emit('challenge:failed', { nodeId: challenge.nodeId });
        this.cooldownTimer = ChallengeSystem.COOLDOWN;
        this.currentChallenge = null;
        return { correct: false, output, done: true, failed: true, autoHint: false };
      }

      // Auto-hint after 2 wrong on same step
      const autoHint = challenge.stepWrongCount >= 2;

      return { correct: false, output, done: false, failed: false, autoHint };
    }
  }

  getCurrentChallenge(): ActiveChallenge | null {
    return this.currentChallenge;
  }

  update(delta: number): void {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= delta;
    }

    if (this.currentChallenge && !this.currentChallenge.started) {
      this.blinkTimer += delta;
      if (this.blinkTimer >= ChallengeSystem.BLINK_DURATION) {
        // Timeout - dismiss challenge
        const node = this.entityManager.get(this.currentChallenge.nodeId) as NetworkNode | undefined;
        if (node) node.blinking = false;
        const nodeId = this.currentChallenge.nodeId;
        this.currentChallenge = null;
        this.cooldownTimer = ChallengeSystem.COOLDOWN;
        this.eventBus.emit('challenge:failed', { nodeId });
      }
    }
  }
}
