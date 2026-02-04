import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { TrafficSystem } from '../systems/TrafficSystem';
import { IncidentSystem } from '../systems/IncidentSystem';
import { EventBus } from '../core/EventBus';
import { BROWSER_CANVAS_WIDTH, BROWSER_CANVAS_HEIGHT, COLORS } from '../constants';

interface RequestLog {
  time: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  statusColor: number;
}

const DPR = Math.max(2, window.devicePixelRatio || 1);

const PAD_X = 4;
const PAD_TOP = 4;
const PAD_BOTTOM = 2;

// Browser window — fill full canvas panel
const BW = BROWSER_CANVAS_WIDTH - PAD_X * 2;
const BH = BROWSER_CANVAS_HEIGHT - PAD_TOP - PAD_BOTTOM;

// Layout (larger sizes for readability)
const TITLE_H = 22;
const URL_H = 22;
const CONTENT_TOP = TITLE_H + URL_H;
const GRAPH_H = 58;
const STATS_Y = CONTENT_TOP + 8;
const GRAPH_Y = STATS_Y + 32;
const LOG_TOP = GRAPH_Y + GRAPH_H + 8;
const LOG_LINE_H = 15;

// Font sizes (matching speech bubble scale ~13px)
const FONT_CHROME = 13;
const FONT_STATS = 13;
const FONT_LOG = 13;

// ── Palette (aligned with constants.ts) ──
const C = {
  // Chrome
  TITLE_BG:    0x161c28,
  TITLE_BORDER: 0x222838,
  URL_BG:      0x101620,
  URL_BORDER:  0x1a2030,
  URL_FIELD:   0x0b1018,
  PAGE_BG:     0x0c1018,
  BORDER:      0x243040,
  DIVIDER:     0x1c2838,
  SHADOW:      0x000000,
  // Traffic lights (standard macOS — keep unchanged)
  DOT_RED:     0xff5f56,
  DOT_YELLOW:  0xffbd2e,
  DOT_GREEN:   0x27c93f,
  // Text
  TAB_TEXT:    0xc0c8d8,
  URL_TEXT:    0xa0c0e8,
  STATS_TEXT:  0xc0c8d0,
  LOG_HEADER:  0xb0b8c8,
  LOG_LINE:    0xb0c0d8,
  // Graph
  GRAPH_BG:    0x080e18,
  GRAPH_GRID:  0x182030,
  // Status (from constants)
  OK:          COLORS.STATUS_OK,       // 0x61c777
  WARN:        COLORS.STATUS_WARN,     // 0xd9a840
  CRITICAL:    COLORS.STATUS_CRITICAL, // 0xe06468
  BLUE:        COLORS.SERVER_LIGHT,    // 0x72b3e8
};

export class VirtualBrowser {
  public readonly container: Container;
  private entityManager: EntityManager;
  private trafficSystem: TrafficSystem;
  private incidentSystem: IncidentSystem;

  private chrome: Graphics;
  private graphGfx: Graphics;

  private statusText: Text;
  private nodeStatsText: Text;
  private latencyText: Text;
  private rpsText: Text;
  private logHeader: Text;
  private logTexts: Text[] = [];

  private allTexts: Text[] = [];

  private logs: RequestLog[] = [];
  private latencyHistory: number[] = [];
  private updateTimer = 0;
  private requestTimer = 0;
  private requestInterval = 1.2;
  private gameTime = 0;

  private readonly PATHS = [
    '/api/users', '/api/orders', '/api/products',
    '/api/auth/login', '/api/payments', '/api/search',
    '/api/notifications', '/api/health',
    '/static/bundle.js', '/static/app.css',
  ];
  private readonly METHODS = ['GET', 'GET', 'GET', 'POST', 'GET', 'GET', 'GET', 'GET', 'GET', 'GET'];

  constructor(
    eventBus: EventBus,
    entityManager: EntityManager,
    trafficSystem: TrafficSystem,
    incidentSystem: IncidentSystem,
  ) {
    this.entityManager = entityManager;
    this.trafficSystem = trafficSystem;
    this.incidentSystem = incidentSystem;

    this.container = new Container();
    this.container.x = PAD_X;
    this.container.y = PAD_TOP;

    // ── Chrome ──
    this.chrome = new Graphics();
    this.drawChrome();
    this.container.addChild(this.chrome);

    // ── Tab label ──
    const tabText = this.makeText('a.b.com — Monitor', FONT_CHROME, C.TAB_TEXT);
    tabText.x = 38;
    tabText.y = (TITLE_H - FONT_CHROME) / 2;
    this.container.addChild(tabText);

    // ── URL bar text ──
    const urlText = this.makeText('https://a.b.com/monitor', FONT_CHROME, C.URL_TEXT);
    urlText.x = 22;
    urlText.y = TITLE_H + (URL_H - FONT_CHROME) / 2;
    this.container.addChild(urlText);

    // ── Status badge ──
    this.statusText = this.makeText('HEALTHY', FONT_CHROME, C.OK);
    this.statusText.x = BW - 6;
    this.statusText.y = TITLE_H + (URL_H - FONT_CHROME) / 2;
    this.statusText.anchor.set(1, 0);
    this.container.addChild(this.statusText);

    // ── Stats area ──
    this.nodeStatsText = this.makeText('', FONT_STATS, C.STATS_TEXT);
    this.nodeStatsText.x = 8;
    this.nodeStatsText.y = STATS_Y;
    this.container.addChild(this.nodeStatsText);

    this.latencyText = this.makeText('', FONT_STATS, C.BLUE);
    this.latencyText.x = 8;
    this.latencyText.y = STATS_Y + 16;
    this.container.addChild(this.latencyText);

    this.rpsText = this.makeText('', FONT_STATS, C.STATS_TEXT);
    this.rpsText.x = BW / 2;
    this.rpsText.y = STATS_Y + 16;
    this.container.addChild(this.rpsText);

    // ── Latency graph ──
    this.graphGfx = new Graphics();
    this.container.addChild(this.graphGfx);

    // ── Request log ──
    this.logHeader = this.makeText('REQUESTS', FONT_LOG, C.LOG_HEADER);
    this.logHeader.x = 8;
    this.logHeader.y = LOG_TOP;
    this.container.addChild(this.logHeader);

    const logAreaH = BH - LOG_TOP - 16;
    const maxLogLines = Math.floor(logAreaH / LOG_LINE_H);
    for (let i = 0; i < maxLogLines; i++) {
      const t = this.makeText('', FONT_LOG, C.LOG_LINE);
      t.x = 8;
      t.y = LOG_TOP + 16 + i * LOG_LINE_H;
      this.container.addChild(t);
      this.logTexts.push(t);
    }

    // ── Events ──
    eventBus.on('packet:send', () => {
      this.generateRequest();
    });

    for (let i = 0; i < 40; i++) {
      this.latencyHistory.push(12 + Math.random() * 8);
    }
  }

  private makeText(content: string, fontSize: number, color: number): Text {
    const t = new Text({
      text: content,
      style: new TextStyle({
        fontSize,
        fontFamily: 'Courier New, monospace',
        fill: color,
      }),
      resolution: DPR,
    });
    this.allTexts.push(t);
    return t;
  }

  /** 카메라 비균일 스케일 보정 — 텍스트만 uniform하게 유지 */
  setTextCounterScale(rawScaleX: number, rawScaleY: number): void {
    // 카메라가 (sx, sy)로 컨테이너를 늘림 → 텍스트에 역수 적용하면 원본 크기
    const cx = 1 / rawScaleX;
    const cy = 1 / rawScaleY;
    for (const t of this.allTexts) {
      t.scale.set(cx, cy);
    }
  }

  private drawChrome(): void {
    const g = this.chrome;

    // Shadow
    g.rect(-1, -1, BW + 2, BH + 2).fill({ color: C.SHADOW, alpha: 0.25 });

    // Title bar
    g.rect(0, 0, BW, TITLE_H).fill(C.TITLE_BG);
    g.moveTo(0, TITLE_H).lineTo(BW, TITLE_H).stroke({ width: 1, color: C.TITLE_BORDER });

    // Traffic light dots
    const dots: [number, number][] = [[C.DOT_RED, 8], [C.DOT_YELLOW, 20], [C.DOT_GREEN, 32]];
    for (const [color, x] of dots) {
      g.circle(x, TITLE_H / 2, 3).fill(color);
    }

    // URL bar
    g.rect(0, TITLE_H, BW, URL_H).fill(C.URL_BG);
    g.moveTo(0, TITLE_H + URL_H).lineTo(BW, TITLE_H + URL_H).stroke({ width: 1, color: C.URL_BORDER });

    // Lock icon
    g.circle(10, TITLE_H + URL_H / 2, 3).fill({ color: C.OK, alpha: 0.7 });

    // URL field bg
    g.roundRect(20, TITLE_H + 3, Math.min(BW * 0.4, 300), URL_H - 6, 3).fill({ color: C.URL_FIELD, alpha: 0.6 });

    // Page body
    g.rect(0, CONTENT_TOP, BW, BH - CONTENT_TOP).fill({ color: C.PAGE_BG, alpha: 0.9 });

    // Divider above log
    g.moveTo(6, LOG_TOP - 3).lineTo(BW - 6, LOG_TOP - 3)
      .stroke({ width: 1, color: C.DIVIDER, alpha: 0.4 });

    // Outer border
    g.rect(0, 0, BW, BH).stroke({ width: 1, color: C.BORDER, alpha: 0.5 });
  }

  private getServiceHealth(): { online: number; total: number; avgHealth: number } {
    const nodes = this.entityManager.getAll().filter(
      (e): e is NetworkNode => e instanceof NetworkNode,
    );
    const online = nodes.filter(n => n.status === 'online').length;
    const avgHealth = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.health, 0) / nodes.length
      : 100;
    return { online, total: nodes.length, avgHealth };
  }

  private computeLatency(): number {
    const { avgHealth } = this.getServiceHealth();
    const activeIncidents = this.incidentSystem.getActiveIncidents().length;
    let latency = 12 + (100 - avgHealth) * 0.8 + activeIncidents * 30;
    latency += (Math.random() - 0.5) * 10;
    return Math.max(5, Math.round(latency));
  }

  private generateRequest(): void {
    const { avgHealth } = this.getServiceHealth();
    const activeIncidents = this.incidentSystem.getActiveIncidents().length;
    const idx = Math.floor(Math.random() * this.PATHS.length);
    const path = this.PATHS[idx];
    const method = this.METHODS[idx];
    const latency = this.computeLatency();

    let status: number;
    let statusColor: number;
    const roll = Math.random();

    if (activeIncidents > 0 && roll < 0.3) {
      status = roll < 0.15 ? 503 : 502;
      statusColor = C.CRITICAL;
    } else if (avgHealth < 50 && roll < 0.2) {
      status = 504;
      statusColor = C.CRITICAL;
    } else if (avgHealth < 70 && roll < 0.1) {
      status = 500;
      statusColor = C.CRITICAL;
    } else if (roll < 0.03) {
      status = 429;
      statusColor = C.WARN;
    } else {
      status = 200;
      statusColor = C.OK;
    }

    const secs = Math.floor(this.gameTime);
    const time = `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

    this.logs.unshift({ time, method, path, status, latency, statusColor });
    if (this.logs.length > 30) this.logs.length = 30;
  }

  private drawLatencyGraph(): void {
    const g = this.graphGfx;
    g.clear();

    const data = this.latencyHistory;
    if (data.length < 2) return;

    const gx = 8;
    const gy = GRAPH_Y;
    const gw = BW - 16;
    const gh = GRAPH_H;

    // Graph bg
    g.rect(gx, gy, gw, gh).fill({ color: C.GRAPH_BG, alpha: 0.5 });

    // Grid lines
    for (let y = gy; y <= gy + gh; y += 10) {
      g.moveTo(gx, y).lineTo(gx + gw, y)
        .stroke({ width: 0.5, color: C.GRAPH_GRID, alpha: 0.4 });
    }

    const maxLatency = Math.max(...data, 50);
    const stepX = gw / (data.length - 1);
    const lastLatency = data[data.length - 1];
    const lineColor = lastLatency > 80 ? C.CRITICAL : lastLatency > 40 ? C.WARN : C.BLUE;

    // Fill
    g.moveTo(gx, gy + gh);
    for (let i = 0; i < data.length; i++) {
      const x = gx + i * stepX;
      const y = gy + gh - (data[i] / maxLatency) * (gh - 2);
      g.lineTo(x, y);
    }
    g.lineTo(gx + (data.length - 1) * stepX, gy + gh);
    g.closePath();
    g.fill({ color: lineColor, alpha: 0.1 });

    // Line
    for (let i = 0; i < data.length; i++) {
      const x = gx + i * stepX;
      const y = gy + gh - (data[i] / maxLatency) * (gh - 2);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke({ width: 1.5, color: lineColor, alpha: 0.8 });

    // Value label
    const prev = this.container.getChildByLabel('latVal');
    if (prev) this.container.removeChild(prev);
    const valText = this.makeText(`${Math.round(lastLatency)}ms`, FONT_LOG, lineColor);
    valText.x = gx + gw - 2;
    valText.y = gy + 2;
    valText.anchor.set(1, 0);
    valText.label = 'latVal';
    this.container.addChild(valText);
  }

  private renderLogs(): void {
    for (let i = 0; i < this.logTexts.length; i++) {
      const t = this.logTexts[i];
      if (i < this.logs.length) {
        const log = this.logs[i];
        t.text = `${log.time} ${log.method.padEnd(4)} ${log.status} ${log.path}`;
        (t.style as TextStyle).fill = log.status >= 400 ? log.statusColor : C.LOG_LINE;
        t.visible = true;
      } else {
        t.visible = false;
      }
    }
  }

  update(delta: number): void {
    this.gameTime += delta;

    this.requestTimer += delta;
    if (this.requestTimer >= this.requestInterval) {
      this.requestTimer = 0;
      this.requestInterval = 0.8 + Math.random() * 1.5;
      this.generateRequest();
    }

    this.updateTimer += delta;
    if (this.updateTimer >= 0.5) {
      this.updateTimer = 0;

      const latency = this.computeLatency();
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 40) this.latencyHistory.shift();

      const { online, total } = this.getServiceHealth();
      const activeIncidents = this.incidentSystem.getActiveIncidents().length;
      const pps = this.trafficSystem.packetsPerSecond;

      // Status badge
      if (activeIncidents > 0) {
        this.statusText.text = `INCIDENT(${activeIncidents})`;
        (this.statusText.style as TextStyle).fill = C.CRITICAL;
      } else if (latency > 60) {
        this.statusText.text = 'DEGRADED';
        (this.statusText.style as TextStyle).fill = C.WARN;
      } else {
        this.statusText.text = 'HEALTHY';
        (this.statusText.style as TextStyle).fill = C.OK;
      }

      // Stats
      this.nodeStatsText.text = `Nodes ${online}/${total}`;
      (this.nodeStatsText.style as TextStyle).fill = online < total ? C.WARN : C.STATS_TEXT;

      this.latencyText.text = `Lat ${latency}ms`;
      (this.latencyText.style as TextStyle).fill = latency > 80 ? C.CRITICAL : latency > 40 ? C.WARN : C.BLUE;

      this.rpsText.text = `RPS ${pps}`;

      this.drawLatencyGraph();
      this.renderLogs();
    }
  }
}
