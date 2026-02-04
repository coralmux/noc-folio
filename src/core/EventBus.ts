export interface GameEvents {
  'node:click': { nodeId: string };
  'node:statusChange': { nodeId: string; status: string };
  'node:damaged': { nodeId: string; reason: string };
  'node:repaired': { nodeId: string };
  'cable:cut': { cableId: string };
  'cable:repaired': { cableId: string };
  'character:spawn': { characterId: string; type: string };
  'character:despawn': { characterId: string };
  'character:stateChange': { characterId: string; from: string; to: string };
  'incident:start': { incidentId: string; type: string; targetNodeId: string };
  'incident:resolved': { incidentId: string };
  'ticket:created': { ticketId: string };
  'ticket:assigned': { ticketId: string; assigneeId: string };
  'ticket:escalated': { ticketId: string; assigneeId: string };
  'ticket:resolved': { ticketId: string };
  'ticket:player:resolved': { ticketId: string };
  'packet:send': { from: string; to: string };
  'system:tick': { delta: number };
  'challenge:blinking': { nodeId: string; challengeType: string };
  'challenge:start': { nodeId: string; challengeType: string };
  'challenge:success': { nodeId: string };
  'challenge:failed': { nodeId: string };
}

type EventHandler<T> = (data: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();

  on<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);
  }

  off<K extends keyof GameEvents>(event: K, handler: EventHandler<GameEvents[K]>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }
}
