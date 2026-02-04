import { Incident } from './Incident';
import { INCIDENT_TEMPLATES } from '../data/incidentTemplates';
import { EventBus } from '../core/EventBus';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { randomPick, randomChance } from '../utils/random';

let incidentCounter = 0;

export class IncidentSystem {
  private incidents: Incident[] = [];
  private eventBus: EventBus;
  private entityManager: EntityManager;
  private targetNodeIds: Set<string> | null;
  private elapsed = 0;
  private spawnInterval = 8; // seconds between incident checks
  private gameTime = 0;

  constructor(eventBus: EventBus, entityManager: EntityManager, targetNodeIds?: Set<string>) {
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.targetNodeIds = targetNodeIds ?? null;

    // Listen for repairs
    this.eventBus.on('node:repaired', ({ nodeId }) => {
      const incident = this.incidents.find(i => i.targetNodeId === nodeId && !i.resolved);
      if (incident) {
        incident.resolved = true;
        incident.resolvedTime = this.gameTime;
        this.eventBus.emit('incident:resolved', { incidentId: incident.id });

        // Repair the node
        const node = this.entityManager.get(nodeId) as NetworkNode | undefined;
        if (node) node.repair(incident.damage);
      }
    });

    // Listen for node damage events (from hackers, newbies, etc.)
    this.eventBus.on('node:damaged', ({ nodeId, reason }) => {
      const node = this.entityManager.get(nodeId) as NetworkNode | undefined;
      if (!node) return;
      const template = INCIDENT_TEMPLATES.find(t => t.type === reason) ?? randomPick(INCIDENT_TEMPLATES);
      this.createIncident(template.type, template.name, template.severity, nodeId, template.damage, template.emoji);
    });
  }

  private createIncident(
    type: string, name: string, severity: Incident['severity'],
    targetNodeId: string, damage: number, emoji: string,
  ): Incident {
    const incident: Incident = {
      id: `incident_${incidentCounter++}`,
      type, name, severity, targetNodeId, damage,
      resolved: false,
      startTime: this.gameTime,
      emoji,
    };
    this.incidents.push(incident);

    // Apply damage
    const node = this.entityManager.get(targetNodeId) as NetworkNode | undefined;
    if (node) node.takeDamage(damage);

    this.eventBus.emit('incident:start', { incidentId: incident.id, type, targetNodeId });
    return incident;
  }

  update(delta: number): void {
    this.gameTime += delta;
    this.elapsed += delta;

    if (this.elapsed >= this.spawnInterval) {
      this.elapsed = 0;

      // 60% chance of a random incident each interval
      if (randomChance(0.6)) {
        const nodes = this.entityManager.getAll().filter(
          (e): e is NetworkNode => e instanceof NetworkNode && e.status === 'online'
            && (!this.targetNodeIds || this.targetNodeIds.has(e.id)),
        );
        if (nodes.length > 0) {
          const template = randomPick(INCIDENT_TEMPLATES);
          const target = randomPick(nodes);
          this.createIncident(
            template.type, template.name, template.severity,
            target.id, template.damage, template.emoji,
          );
        }
      }
    }
  }

  getActiveIncidents(): Incident[] {
    return this.incidents.filter(i => !i.resolved);
  }

  getAllIncidents(): Incident[] {
    return this.incidents;
  }

  getRecentResolved(count = 5): Incident[] {
    return this.incidents
      .filter(i => i.resolved)
      .slice(-count);
  }
}
