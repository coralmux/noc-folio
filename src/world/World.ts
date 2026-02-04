import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Grid } from './Grid';
import { WorldLayoutConfig, NodePlacement, ZoneDef, getServerRoomBounds, getPubZoneBounds, getGardenBounds, getParkingBounds, getMeetingBounds } from './WorldLayout';
import { EntityManager } from '../entities/EntityManager';
import { CableManager } from '../entities/cables/CableManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { Server } from '../entities/nodes/Server';
import { Router } from '../entities/nodes/Router';
import { Firewall } from '../entities/nodes/Firewall';
import { Switch } from '../entities/nodes/Switch';
import { Database } from '../entities/nodes/Database';
import { LoadBalancer } from '../entities/nodes/LoadBalancer';
import { MonitorWall } from '../entities/nodes/MonitorWall';
import { PixelSprites } from '../rendering/PixelSprites';
import type { TileType, AmbientType } from '../rendering/PixelSprites';
import { CELL_SIZE, COLORS, GRID_COLS, PHYSICAL_ROWS } from '../constants';

export class World {
  public readonly container: Container;
  public readonly grid: Grid;
  public readonly entityManager: EntityManager;
  public readonly cableManager: CableManager;
  public readonly isPhysical: boolean;

  private layout: WorldLayoutConfig;
  private canvasWidth: number;
  private canvasHeight: number;
  private nodesByLabel = new Map<string, NetworkNode>();
  private floorLayer: Container;
  private nodeLayer: Container;
  private labelLayer: Container;
  private decoLayer: Container;

  constructor(
    layout: WorldLayoutConfig,
    cols: number,
    rows: number,
    entityManager?: EntityManager,
    isPhysical = false,
  ) {
    this.layout = layout;
    this.canvasWidth = cols * CELL_SIZE;
    this.canvasHeight = rows * CELL_SIZE;
    this.isPhysical = isPhysical;

    this.container = new Container();
    this.grid = new Grid(cols, rows);
    this.entityManager = entityManager ?? new EntityManager();
    this.cableManager = new CableManager();

    this.floorLayer = new Container();
    this.nodeLayer = new Container();
    this.labelLayer = new Container();
    this.decoLayer = new Container();

    this.container.addChild(this.floorLayer);
    this.container.addChild(this.cableManager.container);
    this.container.addChild(this.decoLayer);
    this.container.addChild(this.nodeLayer);
    this.container.addChild(this.labelLayer);
  }

  build(): void {
    if (this.isPhysical) {
      this.drawPhysicalGround();
      this.drawPaths();
      this.drawFences();
      this.drawServerRoomBoundary();
      this.drawDecorations();
      this.drawAmbientDetails();
    } else {
      this.drawFloor();
      this.drawZones();
    }

    this.drawBoundary();
    this.placeNodes();
    this.connectCables();
    this.markWalls();

    if (this.isPhysical) {
      this.markServerRoomWalls();
    }
  }

  private drawFloor(): void {
    const floor = new Graphics();
    floor.rect(0, 0, this.canvasWidth, this.canvasHeight).fill(COLORS.BG_DARK);

    // Grid lines (subtle)
    for (let col = 0; col <= this.canvasWidth; col += CELL_SIZE) {
      floor.moveTo(col, 0).lineTo(col, this.canvasHeight)
        .stroke({ width: 1, color: COLORS.GRID_LINE, alpha: 0.12 });
    }
    for (let row = 0; row <= this.canvasHeight; row += CELL_SIZE) {
      floor.moveTo(0, row).lineTo(this.canvasWidth, row)
        .stroke({ width: 1, color: COLORS.GRID_LINE, alpha: 0.12 });
    }
    this.floorLayer.addChild(floor);
  }

  private drawZones(): void {
    for (const zone of this.layout.zones) {
      const g = new Graphics();
      const x = zone.col * CELL_SIZE;
      const y = zone.row * CELL_SIZE;
      const w = zone.width * CELL_SIZE;
      const h = zone.height * CELL_SIZE;

      g.rect(x, y, w, h).fill({ color: zone.color, alpha: 0.5 });
      g.rect(x, y, w, h).stroke({ width: 1, color: 0x283040, alpha: 0.3 });

      this.floorLayer.addChild(g);

      // Zone label (그룹으로 묶어 labelLayer에 → counter-scale 일괄 적용)
      if (zone.label) {
        const lx = x + 6;
        const ly = y + 4;
        const group = new Container();
        group.x = lx;
        group.y = ly;

        const bg = new Graphics();
        bg.rect(-2, -1, zone.label.length * 7 + 6, 14)
          .fill({ color: 0x000000, alpha: 0.8 });
        group.addChild(bg);

        const label = new Text({
          text: zone.label,
          style: new TextStyle({
            fontSize: 11,
            fontFamily: 'Courier New, monospace',
            fill: 0xd6dbe0,
            fontWeight: 'bold',
            letterSpacing: 1,
          }),
          resolution: Math.max(2, window.devicePixelRatio || 1),
        });
        group.addChild(label);
        this.labelLayer.addChild(group);
      }
    }
  }

  // ─── 물리세계 전용 바닥/장식 ───

  /** 셀 단위 바닥 타일 — 24×16 전체를 존별 타일로 채운다 */
  private drawPhysicalGround(): void {
    const g = new Graphics();
    const cols = GRID_COLS;
    const rows = PHYSICAL_ROWS;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const zone = this.getZoneAt(col, row);
        const tileType: TileType = zone?.groundType ?? 'outdoor';
        const variation = (col * 7 + row * 13) % 5;
        PixelSprites.drawGroundTile(g, col * CELL_SIZE, row * CELL_SIZE, tileType, variation);
      }
    }

    this.floorLayer.addChild(g);

    // Zone labels — 그룹(배경+텍스트) → labelLayer (counter-scale 일괄 적용)
    for (const zone of this.layout.zones) {
      if (zone.label) {
        const lx = zone.col * CELL_SIZE + 4;
        // row 0 존은 HTML canvas-label과 겹치므로 더 아래로
        const ly = zone.row * CELL_SIZE + (zone.row === 0 ? 22 : 4);

        const group = new Container();
        group.x = lx;
        group.y = ly;

        const bg = new Graphics();
        bg.rect(-2, -1, zone.label.length * 7 + 8, 14)
          .fill({ color: 0x000000, alpha: 0.8 });
        bg.rect(-2, -1, zone.label.length * 7 + 8, 14)
          .stroke({ width: 1, color: 0x384050, alpha: 0.5 });
        group.addChild(bg);

        const label = new Text({
          text: zone.label,
          style: new TextStyle({
            fontSize: 11,
            fontFamily: 'Courier New, monospace',
            fill: 0xd6dbe0,
            fontWeight: 'bold',
            letterSpacing: 1,
          }),
          resolution: Math.max(2, window.devicePixelRatio || 1),
        });
        group.addChild(label);
        this.labelLayer.addChild(group);
      }
    }
  }

  /** 존 간 연결 돌길 */
  private drawPaths(): void {
    const g = new Graphics();
    const sr = getServerRoomBounds();

    // 서버실 왼쪽 입구 (col 6-7) → 아래로 Pub 방향 (row 8→12)
    for (let row = sr.row + sr.height; row <= 12; row++) {
      for (let col = 6; col <= 7; col++) {
        const variation = (col * 7 + row * 13) % 5;
        PixelSprites.drawGroundTile(g, col * CELL_SIZE, row * CELL_SIZE, 'path', variation);
      }
    }

    // 서버실 오른쪽 입구 (col 16-17) → 아래로 Parking/Garden 방향
    for (let row = sr.row + sr.height; row <= 11; row++) {
      for (let col = 16; col <= 17; col++) {
        const variation = (col * 7 + row * 13) % 5;
        PixelSprites.drawGroundTile(g, col * CELL_SIZE, row * CELL_SIZE, 'path', variation);
      }
    }

    // Pub 앞 → Meeting 연결 (가로 돌길 row 9-10, col 4→6)
    for (let col = 4; col <= 6; col++) {
      for (let row = 9; row <= 10; row++) {
        const variation = (col * 7 + row * 13) % 5;
        PixelSprites.drawGroundTile(g, col * CELL_SIZE, row * CELL_SIZE, 'path', variation);
      }
    }

    this.floorLayer.addChild(g);
  }

  /** 존 경계 울타리/생울타리 */
  private drawFences(): void {
    const g = new Graphics();
    const garden = getGardenBounds();
    const parking = getParkingBounds();

    // Garden: 왼쪽+상단에 초록 생울타리
    const gx = garden.col * CELL_SIZE;
    const gy = garden.row * CELL_SIZE;
    const gw = garden.width * CELL_SIZE;
    const gh = garden.height * CELL_SIZE;

    // 상단 생울타리
    for (let i = 0; i < gw; i += 6) {
      const shade = (i % 12 === 0) ? 0x2a6a2a : 0x3a8a3a;
      g.rect(gx + i, gy - 3, 5, 5).fill(shade);
    }
    // 왼쪽 생울타리
    for (let i = 0; i < gh; i += 6) {
      const shade = (i % 12 === 0) ? 0x2a6a2a : 0x3a8a3a;
      g.rect(gx - 3, gy + i, 5, 5).fill(shade);
    }

    // Parking: 흰색 주차선 경계
    const px = parking.col * CELL_SIZE;
    const py = parking.row * CELL_SIZE;
    const pw = parking.width * CELL_SIZE;
    const ph = parking.height * CELL_SIZE;

    // 주차선 (세로 칸 구분)
    for (let i = 0; i <= pw; i += CELL_SIZE * 2) {
      g.rect(px + i, py + 4, 2, ph - 8).fill({ color: 0xffffff, alpha: 0.4 });
    }
    // 상단 가로선
    g.rect(px, py + 2, pw, 2).fill({ color: 0xffffff, alpha: 0.35 });
    // 하단 가로선
    g.rect(px, py + ph - 4, pw, 2).fill({ color: 0xffffff, alpha: 0.35 });

    this.floorLayer.addChild(g);
  }

  /** 소형 랜덤 장식 (풀, 꽃, 돌 등) */
  private drawAmbientDetails(): void {
    const g = new Graphics();
    const cols = GRID_COLS;
    const rows = PHYSICAL_ROWS;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hash = (col * 31 + row * 17 + col * row * 7) % 100;
        const zone = this.getZoneAt(col, row);
        const zoneName = zone?.name;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        const seed = (col * 13 + row * 23) % 97;

        // 셀 내 랜덤 오프셋
        const ox = (seed * 3) % (CELL_SIZE - 12);
        const oy = (seed * 7) % (CELL_SIZE - 12);

        let ambientType: AmbientType | null = null;

        switch (zoneName) {
          case 'Garden':
            if (hash < 18) ambientType = 'grassTuft';
            else if (hash < 30) ambientType = 'flower';
            else if (hash < 40) ambientType = 'smallStone';
            break;
          case 'Pub':
            if (hash < 12) ambientType = 'weed';
            else if (hash < 25) ambientType = 'grassTuft';
            break;
          case 'Parking':
            if (hash < 8) ambientType = 'oilStain';
            else if (hash < 15) ambientType = 'crack';
            break;
          case 'ServerRoom':
            if (hash < 10) ambientType = 'vent';
            break;
          case 'Meeting':
            break;
          default:
            // 야외 (무소속)
            if (hash < 15) ambientType = 'grassTuft';
            else if (hash < 22) ambientType = 'smallStone';
            else if (hash < 30) ambientType = 'weed';
            break;
        }

        if (ambientType) {
          PixelSprites.drawAmbientSprite(g, x + ox, y + oy, ambientType, seed);
        }
      }
    }

    this.decoLayer.addChild(g);
  }

  /** 셀이 어느 존에 속하는지 판별 */
  private getZoneAt(col: number, row: number): ZoneDef | undefined {
    for (const zone of this.layout.zones) {
      if (
        col >= zone.col && col < zone.col + zone.width &&
        row >= zone.row && row < zone.row + zone.height
      ) {
        return zone;
      }
    }
    return undefined;
  }

  private placeNodes(): void {
    for (const placement of this.layout.nodes) {
      const node = this.createNode(placement);
      this.entityManager.add(node);
      this.nodesByLabel.set(placement.label, node);
      this.nodeLayer.addChild(node.container);
      this.grid.occupyCells(
        node.gridCol, node.gridRow,
        node.gridWidth, node.gridHeight,
        node.id,
      );

      // 서비스 아이콘 오버레이
      if (placement.serviceIcon) {
        const w = node.gridWidth * CELL_SIZE;
        const h = node.gridHeight * CELL_SIZE;
        const icon = PixelSprites.createServiceIcon(placement.serviceIcon, w, h);
        node.container.addChild(icon);
      }

      // OS 아이콘 오버레이
      if (placement.osIcon) {
        const w = node.gridWidth * CELL_SIZE;
        const h = node.gridHeight * CELL_SIZE;
        const icon = PixelSprites.createOSIcon(placement.osIcon, w, h);
        node.container.addChild(icon);
      }

      // 노드 라벨 — 그룹(배경+텍스트) → labelLayer (counter-scale 일괄 적용)
      const nlx = node.gridCol * CELL_SIZE;
      const nly = (node.gridRow + node.gridHeight) * CELL_SIZE + 1;

      const nlGroup = new Container();
      nlGroup.x = nlx;
      nlGroup.y = nly;

      const nlBg = new Graphics();
      nlBg.rect(-1, -1, placement.label.length * 7 + 6, 14)
        .fill({ color: 0x000000, alpha: 0.8 });
      nlGroup.addChild(nlBg);

      const label = new Text({
        text: placement.label,
        style: new TextStyle({
          fontSize: 11,
          fontFamily: 'Courier New, monospace',
          fill: 0xd6dbe0,
          fontWeight: 'bold',
          letterSpacing: 1,
        }),
        resolution: Math.max(2, window.devicePixelRatio || 1),
      });
      nlGroup.addChild(label);
      this.labelLayer.addChild(nlGroup);
    }
  }

  private createNode(p: NodePlacement): NetworkNode {
    switch (p.type) {
      case 'server': return new Server(p.label, p.col, p.row, p.variant);
      case 'router': return new Router(p.label, p.col, p.row);
      case 'firewall': return new Firewall(p.label, p.col, p.row);
      case 'switch': return new Switch(p.label, p.col, p.row);
      case 'database': return new Database(p.label, p.col, p.row);
      case 'loadbalancer': return new LoadBalancer(p.label, p.col, p.row);
      case 'monitorwall': return new MonitorWall(p.label, p.col, p.row);
    }
  }

  private connectCables(): void {
    for (const conn of this.layout.cables) {
      const fromNode = this.nodesByLabel.get(conn.from);
      const toNode = this.nodesByLabel.get(conn.to);
      if (fromNode && toNode) {
        this.cableManager.connect(fromNode, toNode);
      }
    }
  }

  /** 경계 테두리 — 캔버스 가장자리에서 1셀 안쪽에 미세한 선을 그린다 */
  private drawBoundary(): void {
    const margin = CELL_SIZE;
    const g = new Graphics();
    g.rect(margin, margin, this.canvasWidth - margin * 2, this.canvasHeight - margin * 2)
      .stroke({ width: 1, color: 0x1c3858, alpha: 0.25 });
    this.floorLayer.addChild(g);
  }

  private markWalls(): void {
    const cols = this.grid.cols;
    const rows = this.grid.rows;

    // 2-cell deep border walls on all sides
    // — pathfinding이 경계 근처로 절대 가지 않도록
    for (let col = 0; col < cols; col++) {
      for (let r = 0; r < 2; r++) {
        const cell = this.grid.getCell(col, r);
        if (cell) cell.walkable = false;
      }
      for (let r = rows - 2; r < rows; r++) {
        const cell = this.grid.getCell(col, r);
        if (cell) cell.walkable = false;
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < 2; c++) {
        const cell = this.grid.getCell(c, row);
        if (cell) cell.walkable = false;
      }
      for (let c = cols - 2; c < cols; c++) {
        const cell = this.grid.getCell(c, row);
        if (cell) cell.walkable = false;
      }
    }
  }

  /** 서버실 하단 벽 + 입구 2개 */
  private markServerRoomWalls(): void {
    const sr = getServerRoomBounds();
    const wallRow1 = sr.row + sr.height - 1;
    const wallRow2 = sr.row + sr.height;

    // 입구 위치: col 6-7, col 16-17
    const entrance1Start = 6;
    const entrance1End = 7;
    const entrance2Start = 16;
    const entrance2End = 17;

    for (let col = 0; col < this.grid.cols; col++) {
      const isEntrance =
        (col >= entrance1Start && col <= entrance1End) ||
        (col >= entrance2Start && col <= entrance2End);

      if (!isEntrance) {
        const cell1 = this.grid.getCell(col, wallRow1);
        if (cell1) cell1.walkable = false;
        const cell2 = this.grid.getCell(col, wallRow2);
        if (cell2) cell2.walkable = false;
      }
    }
  }

  /** 서버실 하단 경계 시각화: 두꺼운 선 + 입구 갭 */
  private drawServerRoomBoundary(): void {
    const sr = getServerRoomBounds();
    const g = new Graphics();
    const wallY = (sr.row + sr.height) * CELL_SIZE;

    // 입구: col 6-7, col 16-17 (2셀 너비)
    const entrance1Start = 6 * CELL_SIZE;
    const entrance1End = 8 * CELL_SIZE;
    const entrance2Start = 16 * CELL_SIZE;
    const entrance2End = 18 * CELL_SIZE;

    // 왼쪽 벽 세그먼트 (0 → entrance1)
    g.moveTo(0, wallY).lineTo(entrance1Start, wallY)
      .stroke({ width: 3, color: 0x385878, alpha: 0.7 });
    // 중간 벽 세그먼트 (entrance1End → entrance2Start)
    g.moveTo(entrance1End, wallY).lineTo(entrance2Start, wallY)
      .stroke({ width: 3, color: 0x385878, alpha: 0.7 });
    // 오른쪽 벽 세그먼트 (entrance2End → end)
    g.moveTo(entrance2End, wallY).lineTo(this.canvasWidth, wallY)
      .stroke({ width: 3, color: 0x385878, alpha: 0.7 });

    // 입구 표시 (점선)
    for (const [start, end] of [[entrance1Start, entrance1End], [entrance2Start, entrance2End]]) {
      for (let x = start; x < end; x += 8) {
        g.moveTo(x, wallY).lineTo(Math.min(x + 4, end), wallY)
          .stroke({ width: 1, color: 0x487898, alpha: 0.4 });
      }
    }

    this.floorLayer.addChild(g);
  }

  /** 물리세계 데코레이션 배치 */
  private drawDecorations(): void {
    const pub = getPubZoneBounds();
    const garden = getGardenBounds();
    const parking = getParkingBounds();
    const sr = getServerRoomBounds();

    type DecoPlacement = {
      type: Parameters<typeof PixelSprites.createDecoration>[0];
      col: number;
      row: number;
      cellW: number;
      cellH: number;
    };

    const decos: DecoPlacement[] = [
      // 맥주집 건물 — Pub 존 상단
      { type: 'pub', col: pub.col + 1, row: pub.row + 1, cellW: 4, cellH: 3 },
      // 나무 ×3 — Garden 존 곳곳
      { type: 'tree', col: garden.col + 2, row: garden.row + 1, cellW: 1, cellH: 1 },
      { type: 'tree', col: garden.col + 5, row: garden.row + 2, cellW: 1, cellH: 1 },
      { type: 'tree', col: garden.col + 8, row: garden.row + 1, cellW: 1, cellH: 1 },
      // 연못 — Garden 중앙
      { type: 'pond', col: garden.col + 4, row: garden.row + 3, cellW: 2, cellH: 1 },
      // 자판기 — 서버실 입구 옆 (왼쪽 입구)
      { type: 'vending', col: 5, row: sr.row + sr.height, cellW: 1, cellH: 1 },
      // 커피머신 — 서버실 입구 옆 (오른쪽 입구)
      { type: 'coffee', col: 18, row: sr.row + sr.height, cellW: 1, cellH: 1 },
      // 벤치 — 서버실-펍 사이 통로
      { type: 'bench', col: 9, row: sr.row + sr.height + 1, cellW: 2, cellH: 1 },
      // 차량 ×2 — Parking 존
      { type: 'car', col: parking.col + 1, row: parking.row + 1, cellW: 2, cellH: 1 },
      { type: 'car', col: parking.col + 4, row: parking.row + 1, cellW: 2, cellH: 1 },
    ];

    for (const d of decos) {
      const sprite = PixelSprites.createDecoration(d.type);
      sprite.x = d.col * CELL_SIZE;
      sprite.y = d.row * CELL_SIZE;
      this.decoLayer.addChild(sprite);

      // Mark decoration cells as non-walkable
      for (let dc = 0; dc < d.cellW; dc++) {
        for (let dr = 0; dr < d.cellH; dr++) {
          const cell = this.grid.getCell(d.col + dc, d.row + dr);
          if (cell) cell.walkable = false;
        }
      }
    }
  }

  getNodeByLabel(label: string): NetworkNode | undefined {
    return this.nodesByLabel.get(label);
  }

  getSpawnPoints(): { col: number; row: number }[] {
    return this.layout.characterSpawnPoints;
  }

  /**
   * 비균일 스케일 보정 — 노드·라벨에 counterScale 을 적용하여
   * 캔버스 비율과 무관하게 스프라이트가 정방형을 유지하도록 한다.
   * 라벨은 컨테이너 스케일의 완전한 역수를 적용해 원래 픽셀 크기를 유지한다.
   */
  setSpriteScale(counterX: number, counterY: number, rawScaleX?: number, rawScaleY?: number): void {
    for (const [, node] of this.nodesByLabel) {
      node.container.scale.set(counterX, counterY);
    }
    // 라벨: rawScale이 주어지면 완전 역수로 텍스트 크기 고정
    const labelCX = rawScaleX ? 1 / rawScaleX : counterX;
    const labelCY = rawScaleY ? 1 / rawScaleY : counterY;
    for (const child of this.labelLayer.children) {
      child.scale.set(labelCX, labelCY);
    }
  }

  update(delta: number): void {
    this.entityManager.update(delta);
  }
}
