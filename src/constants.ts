export const GRID_COLS = 24;
export const GRID_ROWS = 30;
export const CELL_SIZE = 32;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;  // 768
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 960

// Split canvas dimensions
export const LOGICAL_ROWS = 10;
export const PHYSICAL_ROWS = 16;

// Browser panel (VirtualBrowser only — full width, same aspect as topology)
export const BROWSER_CANVAS_WIDTH = GRID_COLS * CELL_SIZE;        // 768
export const BROWSER_CANVAS_HEIGHT = LOGICAL_ROWS * CELL_SIZE;    // 320

// Topology panel (Service layer — full width)
export const LOGICAL_CANVAS_WIDTH = GRID_COLS * CELL_SIZE;   // 768
export const LOGICAL_CANVAS_HEIGHT = LOGICAL_ROWS * CELL_SIZE; // 320

// Physical panel (Infrastructure)
export const PHYSICAL_CANVAS_WIDTH = GRID_COLS * CELL_SIZE;  // 768
export const PHYSICAL_CANVAS_HEIGHT = PHYSICAL_ROWS * CELL_SIZE; // 512

export const TICK_RATE = 60;

export const COLORS = {
  // Background — unified cool navy base (~220° hue)
  BG_DARK: 0x0b1018,
  BG_FLOOR: 0x181e2c,
  BG_FLOOR_ALT: 0x141a26,
  GRID_LINE: 0x222838,

  // Nodes — body colors desaturated, lights WCAG-verified (≥5.5:1 on #0b1018)
  SERVER_BODY: 0x283858,
  SERVER_LIGHT: 0x72b3e8,    // hsl(210,65%,68%) ~8.5:1
  ROUTER_BODY: 0x344838,
  ROUTER_LIGHT: 0x61c777,    // hsl(130,50%,58%) ~6.5:1
  FIREWALL_BODY: 0x582830,
  FIREWALL_LIGHT: 0xe06468,  // hsl(358,65%,64%) ~5.7:1
  SWITCH_BODY: 0x383858,
  SWITCH_LIGHT: 0xb48de6,    // hsl(268,60%,73%) ~6.5:1
  DATABASE_BODY: 0x483828,
  DATABASE_LIGHT: 0xd9a840,  // hsl(40,65%,55%)  ~7.0:1
  LOADBALANCER_BODY: 0x284848,
  LOADBALANCER_LIGHT: 0x56c4d9, // hsl(190,60%,59%) ~7.5:1
  MONITOR_BODY: 0x182838,
  MONITOR_SCREEN: 0x0a382a,

  // Cables
  CABLE_NORMAL: 0x4aaa66,
  CABLE_ACTIVE: 0x61c777,
  CABLE_DAMAGED: 0xe06468,

  // Characters — WCAG-verified accent tones
  ENGINEER_COLOR: 0x72b3e8,
  HACKER_COLOR: 0xe06468,
  JANITOR_COLOR: 0xd9a840,
  NEWBIE_COLOR: 0x61c777,
  MANAGER_COLOR: 0xb48de6,

  // Packets
  PACKET_DATA: 0x61c777,
  PACKET_ALERT: 0xe06468,
  PACKET_REQUEST: 0xd9a840,

  // UI — WCAG-verified text contrast
  TEXT_PRIMARY: 0xd6dbe0,    // ~14:1
  TEXT_DIM: 0x959da5,        // ~6.2:1
  PANEL_BG: 0x0c1018,
  PANEL_BORDER: 0x283040,

  // Status — WCAG AA+ verified
  STATUS_OK: 0x61c777,       // ~6.5:1
  STATUS_WARN: 0xd9a840,     // ~7.0:1
  STATUS_CRITICAL: 0xe06468,  // ~5.7:1
  STATUS_OFFLINE: 0x959da5,   // ~6.2:1

  // Ground tile palettes (5 variations each)
  GROUND_SERVER: [0x282832, 0x2c2c38, 0x30303c, 0x262630, 0x2a2a36] as const,
  GROUND_GRASS: [0x387838, 0x3c7e3e, 0x408444, 0x347634, 0x488848] as const,
  GROUND_WOOD: [0x584828, 0x5e4c2e, 0x534626, 0x685838, 0x5c4a2c] as const,
  GROUND_ASPHALT: [0x38383c, 0x3c3c40, 0x404044, 0x36363a, 0x3e3e42] as const,
  GROUND_CARPET: [0x383446, 0x3c384a, 0x403c4e, 0x363244, 0x3e384c] as const,
  GROUND_PATH: [0x887858, 0x8c7c5c, 0x908060, 0x867656, 0x8e7c5e] as const,
  GROUND_OUTDOOR: [0x285828, 0x2c5c2c, 0x306030, 0x265626, 0x325c32] as const,
} as const;

export const NODE_TYPES = [
  'server', 'router', 'firewall', 'switch',
  'database', 'loadbalancer', 'monitorwall',
] as const;
export type NodeType = typeof NODE_TYPES[number];

export const CHARACTER_TYPES = [
  'engineer', 'hacker', 'janitor', 'newbie', 'manager',
] as const;
export type CharacterType = typeof CHARACTER_TYPES[number];

export const NODE_STATUS = ['online', 'warning', 'critical', 'offline'] as const;
export type NodeStatus = typeof NODE_STATUS[number];
