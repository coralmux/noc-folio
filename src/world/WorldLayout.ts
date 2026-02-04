import { NodeType, GRID_COLS, LOGICAL_ROWS, PHYSICAL_ROWS } from '../constants';

export type ServiceIcon = 'nginx' | 'spring' | 'nodejs' | 'mysql' | 'postgresql' |
  'redis' | 'k8s' | 'docker' | 'prometheus' | 'grafana' | 'jenkins' |
  'internet' | 'loadbalancer' | 'cdn';

export type OSIcon = 'linux' | 'ubuntu' | 'centos' | 'windows';

export interface NodePlacement {
  type: NodeType;
  label: string;
  col: number;
  row: number;
  variant?: string;
  /** 논리 레이어 서비스 아이콘 */
  serviceIcon?: ServiceIcon;
  /** 물리 레이어 OS 아이콘 */
  osIcon?: OSIcon;
  gridWidth?: number;
  gridHeight?: number;
}

export interface CableConnection {
  from: string;
  to: string;
}

export type GroundType = 'serverFloor' | 'grass' | 'wood' | 'asphalt' | 'carpet';

export interface ZoneDef {
  name: string;
  col: number;
  row: number;
  width: number;
  height: number;
  color: number;
  label?: string;
  groundType?: GroundType;
}

// ─── Proportional config types ───

interface ZoneConfig {
  name: string;
  label?: string;
  color: number;
  x: number;  // canvas proportion 0~1
  y: number;
  w: number;
  h: number;
  groundType?: GroundType;
}

interface NodeConfig {
  type: NodeType;
  label: string;
  zone: string;       // ZoneConfig.name reference
  slotX: number;      // 0~1 within zone
  slotY: number;      // 0~1 within zone
  variant?: string;
  serviceIcon?: ServiceIcon;
  osIcon?: OSIcon;
}

// ─── Zone definitions (proportional) ───

const LOGICAL_ZONES: ZoneConfig[] = [
  { name: 'Browser', color: 0x0a1018, x: 0, y: 0, w: 0.28, h: 1 },
  { name: 'Service', label: 'SERVICE LAYER', color: 0x0e1a2e, x: 0.28, y: 0, w: 0.72, h: 1 },
];

// Topology-only zones — Service fills entire canvas width
const TOPOLOGY_ZONES: ZoneConfig[] = [
  { name: 'Service', color: 0x0e1a2e, x: 0, y: 0, w: 1, h: 1 },
];

const PHYSICAL_ZONES: ZoneConfig[] = [
  { name: 'ServerRoom', label: 'SERVER ROOM',  color: 0x0e1420, x: 0,    y: 0,     w: 1,    h: 0.5,   groundType: 'serverFloor' },
  { name: 'Meeting',    label: 'MEETING',       color: 0x1a1a2e, x: 0,    y: 0.5,   w: 0.25, h: 0.125, groundType: 'carpet' },
  { name: 'Pub',        label: 'PUB',           color: 0x1e1410, x: 0,    y: 0.625, w: 0.35, h: 0.375, groundType: 'wood' },
  { name: 'Parking',    label: 'PARKING',        color: 0x18181c, x: 0.7,  y: 0.5,   w: 0.3,  h: 0.2,  groundType: 'asphalt' },
  { name: 'Garden',     label: 'GARDEN',         color: 0x101a10, x: 0.55, y: 0.7,   w: 0.45, h: 0.3,  groundType: 'grass' },
];

// ─── Node definitions (proportional) ───

const LOGICAL_NODES: NodeConfig[] = [
  { type: 'loadbalancer', label: 'LB-MAIN',    zone: 'Service', slotX: 0.5,  slotY: 0.1, serviceIcon: 'loadbalancer' },
  { type: 'server',       label: 'WEB-01',     zone: 'Service', slotX: 0.2,  slotY: 0.45, variant: 'web', serviceIcon: 'nginx' },
  { type: 'server',       label: 'API-01',     zone: 'Service', slotX: 0.5,  slotY: 0.45, variant: 'app', serviceIcon: 'spring' },
  { type: 'database',     label: 'MYSQL-M',    zone: 'Service', slotX: 0.8,  slotY: 0.45, serviceIcon: 'mysql' },
  { type: 'server',       label: 'K8S-MASTER', zone: 'Service', slotX: 0.2,  slotY: 0.8, variant: 'cloud', serviceIcon: 'k8s' },
  { type: 'monitorwall',  label: 'GRAFANA',    zone: 'Service', slotX: 0.8,  slotY: 0.8, serviceIcon: 'grafana' },
];

const PHYSICAL_NODES: NodeConfig[] = [
  { type: 'server',   label: 'SRV-001',  zone: 'ServerRoom', slotX: 0.2,  slotY: 0.3, osIcon: 'ubuntu' },
  { type: 'router',   label: 'CORE-RTR', zone: 'ServerRoom', slotX: 0.5,  slotY: 0.3 },
  { type: 'firewall', label: 'FW-01',    zone: 'ServerRoom', slotX: 0.8,  slotY: 0.3 },
];

// ─── Cable definitions ───

const LOGICAL_CABLES: CableConnection[] = [
  { from: 'LB-MAIN', to: 'WEB-01' },
  { from: 'WEB-01',  to: 'API-01' },
  { from: 'API-01',  to: 'MYSQL-M' },
  { from: 'GRAFANA', to: 'K8S-MASTER' },
  { from: 'GRAFANA', to: 'API-01' },
];

const PHYSICAL_CABLES: CableConnection[] = [
  { from: 'CORE-RTR', to: 'FW-01' },
  { from: 'CORE-RTR', to: 'SRV-001' },
];

// ─── Resolve helpers ───

const NODE_WIDTH = 2;  // grid cells a node occupies
const NODE_HEIGHT = 2;
const ZONE_MARGIN = 1; // margin inside zone boundary
const ZONE_BOTTOM_EXTRA = 1; // 노드 라벨(~12px)이 캔버스 밖으로 나가지 않도록 추가 하단 여유

function resolveZones(configs: ZoneConfig[], gridCols: number, gridRows: number): ZoneDef[] {
  return configs.map(z => ({
    name: z.name,
    label: z.label,
    color: z.color,
    col: Math.round(z.x * gridCols),
    row: Math.round(z.y * gridRows),
    width: Math.round(z.w * gridCols),
    height: Math.round(z.h * gridRows),
    groundType: z.groundType,
  }));
}

function resolveNodes(
  nodeConfigs: NodeConfig[],
  zoneConfigs: ZoneConfig[],
  gridCols: number,
  gridRows: number,
): NodePlacement[] {
  // Pre-compute zone bounds
  const zoneBounds = new Map<string, { col: number; row: number; width: number; height: number }>();
  for (const z of zoneConfigs) {
    zoneBounds.set(z.name, {
      col: Math.round(z.x * gridCols),
      row: Math.round(z.y * gridRows),
      width: Math.round(z.w * gridCols),
      height: Math.round(z.h * gridRows),
    });
  }

  return nodeConfigs.map(n => {
    const zb = zoneBounds.get(n.zone);
    if (!zb) throw new Error(`Unknown zone "${n.zone}" for node "${n.label}"`);

    const usableLeft = zb.col + ZONE_MARGIN;
    const usableTop = zb.row + ZONE_MARGIN;
    const usableWidth = Math.max(0, zb.width - 2 * ZONE_MARGIN - NODE_WIDTH);
    const usableHeight = Math.max(0, zb.height - ZONE_MARGIN - ZONE_BOTTOM_EXTRA - NODE_HEIGHT);

    const col = usableLeft + Math.round(n.slotX * usableWidth);
    const row = usableTop + Math.round(n.slotY * usableHeight);

    const placement: NodePlacement = {
      type: n.type,
      label: n.label,
      col,
      row,
    };
    if (n.variant) placement.variant = n.variant;
    if (n.serviceIcon) placement.serviceIcon = n.serviceIcon;
    if (n.osIcon) placement.osIcon = n.osIcon;
    return placement;
  });
}

function resolveSpawnPoints(
  zoneConfigs: ZoneConfig[],
  gridCols: number,
  gridRows: number,
): { col: number; row: number }[] {
  // Spawn points now inside Pub zone
  const pub = zoneConfigs.find(z => z.name === 'Pub');
  if (!pub) return [];

  const zCol = Math.round(pub.x * gridCols);
  const zRow = Math.round(pub.y * gridRows);
  const zW = Math.round(pub.w * gridCols);
  const zH = Math.round(pub.h * gridRows);

  const points: { col: number; row: number }[] = [];
  const slots = [
    { sx: 0.3, sy: 0.4 },
    { sx: 0.6, sy: 0.4 },
    { sx: 0.3, sy: 0.7 },
    { sx: 0.6, sy: 0.7 },
    { sx: 0.5, sy: 0.55 },
  ];
  for (const s of slots) {
    points.push({
      col: zCol + ZONE_MARGIN + Math.round(s.sx * (zW - 2 * ZONE_MARGIN)),
      row: zRow + ZONE_MARGIN + Math.round(s.sy * (zH - 2 * ZONE_MARGIN)),
    });
  }
  return points;
}

// ─── Public API (backward compatible) ───

export interface WorldLayoutConfig {
  nodes: NodePlacement[];
  cables: CableConnection[];
  zones: ZoneDef[];
  characterSpawnPoints: { col: number; row: number }[];
}

/** Logical layer layout (legacy — Browser + Service combined) */
export function getLogicalLayout(): WorldLayoutConfig {
  return {
    nodes: resolveNodes(LOGICAL_NODES, LOGICAL_ZONES, GRID_COLS, LOGICAL_ROWS),
    cables: LOGICAL_CABLES,
    zones: resolveZones(LOGICAL_ZONES, GRID_COLS, LOGICAL_ROWS),
    characterSpawnPoints: [],
  };
}

/** Topology layout — Service zone fills full canvas width */
export function getTopologyLayout(): WorldLayoutConfig {
  return {
    nodes: resolveNodes(LOGICAL_NODES, TOPOLOGY_ZONES, GRID_COLS, LOGICAL_ROWS),
    cables: LOGICAL_CABLES,
    zones: resolveZones(TOPOLOGY_ZONES, GRID_COLS, LOGICAL_ROWS),
    characterSpawnPoints: [],
  };
}

/** Physical layer layout */
export function getPhysicalLayout(): WorldLayoutConfig {
  return {
    nodes: resolveNodes(PHYSICAL_NODES, PHYSICAL_ZONES, GRID_COLS, PHYSICAL_ROWS),
    cables: PHYSICAL_CABLES,
    zones: resolveZones(PHYSICAL_ZONES, GRID_COLS, PHYSICAL_ROWS),
    characterSpawnPoints: resolveSpawnPoints(PHYSICAL_ZONES, GRID_COLS, PHYSICAL_ROWS),
  };
}

// ─── Zone bounds helpers ───

function getZoneBounds(zoneName: string, gridCols: number, gridRows: number): { col: number; row: number; width: number; height: number } {
  const zone = PHYSICAL_ZONES.find(z => z.name === zoneName);
  if (!zone) throw new Error(`Unknown zone "${zoneName}"`);
  return {
    col: Math.round(zone.x * gridCols),
    row: Math.round(zone.y * gridRows),
    width: Math.round(zone.w * gridCols),
    height: Math.round(zone.h * gridRows),
  };
}

export function getPubZoneBounds(): { col: number; row: number; width: number; height: number } {
  return getZoneBounds('Pub', GRID_COLS, PHYSICAL_ROWS);
}

export function getServerRoomBounds(): { col: number; row: number; width: number; height: number } {
  return getZoneBounds('ServerRoom', GRID_COLS, PHYSICAL_ROWS);
}

export function getParkingBounds(): { col: number; row: number; width: number; height: number } {
  return getZoneBounds('Parking', GRID_COLS, PHYSICAL_ROWS);
}

export function getGardenBounds(): { col: number; row: number; width: number; height: number } {
  return getZoneBounds('Garden', GRID_COLS, PHYSICAL_ROWS);
}

export function getMeetingBounds(): { col: number; row: number; width: number; height: number } {
  return getZoneBounds('Meeting', GRID_COLS, PHYSICAL_ROWS);
}
