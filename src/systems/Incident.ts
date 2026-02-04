export interface Incident {
  id: string;
  type: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  targetNodeId: string;
  damage: number;
  resolved: boolean;
  startTime: number;
  resolvedTime?: number;
  emoji: string;
}
