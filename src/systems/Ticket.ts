export interface Ticket {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incidentId?: string;
  incidentType?: string;
  challengeTemplateId?: string;
  assigneeId?: string;
  assigneeEmoji?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: number;
  resolvedAt?: number;
}
