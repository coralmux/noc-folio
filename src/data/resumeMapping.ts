/**
 * Maps node labels to resume entry keys.
 */
export const RESUME_MAPPING: Record<string, string> = {
  // Logical layer
  'LB-MAIN': 'firewall',
  'WEB-01': 'bigdata',
  'API-01': 'ai',
  'MYSQL-M': 'database',
  'K8S-MASTER': 'cloud',
  'GRAFANA': 'monitor',

  // Physical layer
  'SRV-001': 'database',
  'CORE-RTR': 'router',
  'FW-01': 'firewall',
};
