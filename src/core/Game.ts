import { Application, Container } from 'pixi.js';
import { EventBus } from './EventBus';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { World } from '../world/World';
import { getTopologyLayout, getPhysicalLayout } from '../world/WorldLayout';
import { CharacterManager } from '../characters/CharacterManager';
import { PacketManager } from '../entities/effects/PacketManager';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';
import { IncidentSystem } from '../systems/IncidentSystem';
import { TicketSystem } from '../systems/TicketSystem';
import { TrafficSystem } from '../systems/TrafficSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { ChallengeSystem } from '../systems/ChallengeSystem';
import { UIManager } from '../ui/UIManager';
import { VirtualBrowser } from '../ui/VirtualBrowser';
import {
  GRID_COLS, LOGICAL_ROWS, PHYSICAL_ROWS,
  BROWSER_CANVAS_WIDTH, BROWSER_CANVAS_HEIGHT,
  LOGICAL_CANVAS_WIDTH, LOGICAL_CANVAS_HEIGHT,
  PHYSICAL_CANVAS_WIDTH, PHYSICAL_CANVAS_HEIGHT,
  COLORS,
} from '../constants';

export class Game {
  public browserApp!: Application;
  public logicalApp!: Application;
  public physicalApp!: Application;
  public eventBus: EventBus;
  public entityManager: EntityManager;
  public logicalWorld!: World;
  public physicalWorld!: World;
  public characterManager!: CharacterManager;
  public logicalPacketManager!: PacketManager;
  public physicalPacketManager!: PacketManager;
  public incidentSystem!: IncidentSystem;
  public ticketSystem!: TicketSystem;
  public logicalTrafficSystem!: TrafficSystem;
  public physicalTrafficSystem!: TrafficSystem;
  public spawnSystem!: SpawnSystem;
  public challengeSystem!: ChallengeSystem;
  public uiManager!: UIManager;
  public virtualBrowser!: VirtualBrowser;

  private browserContainer!: Container;
  private logicalContainer!: Container;
  private physicalContainer!: Container;
  private browserCamera!: Camera;
  private logicalCamera!: Camera;
  private physicalCamera!: Camera;

  constructor() {
    this.eventBus = new EventBus();
    this.entityManager = new EntityManager();
  }

  async init(
    browserCanvas: HTMLCanvasElement,
    topologyCanvas: HTMLCanvasElement,
    physicalCanvas: HTMLCanvasElement,
  ): Promise<void> {
    const dpr = window.devicePixelRatio || 1;

    // Browser canvas (left)
    this.browserApp = new Application();
    await this.browserApp.init({
      canvas: browserCanvas,
      width: BROWSER_CANVAS_WIDTH,
      height: BROWSER_CANVAS_HEIGHT,
      backgroundColor: COLORS.BG_DARK,
      resolution: dpr,
      autoDensity: true,
      antialias: true,
    });

    // Topology canvas (center)
    this.logicalApp = new Application();
    await this.logicalApp.init({
      canvas: topologyCanvas,
      width: LOGICAL_CANVAS_WIDTH,
      height: LOGICAL_CANVAS_HEIGHT,
      backgroundColor: COLORS.BG_DARK,
      resolution: dpr,
      autoDensity: true,
      antialias: true,
    });

    // Physical canvas (right)
    this.physicalApp = new Application();
    await this.physicalApp.init({
      canvas: physicalCanvas,
      width: PHYSICAL_CANVAS_WIDTH,
      height: PHYSICAL_CANVAS_HEIGHT,
      backgroundColor: COLORS.BG_DARK,
      resolution: dpr,
      autoDensity: true,
      antialias: true,
    });

    // Game containers + cameras — 카메라가 resizeToFit 전에 존재해야 함
    this.browserContainer = new Container();
    this.logicalContainer = new Container();
    this.physicalContainer = new Container();
    this.browserApp.stage.addChild(this.browserContainer);
    this.logicalApp.stage.addChild(this.logicalContainer);
    this.physicalApp.stage.addChild(this.physicalContainer);

    this.browserCamera = new Camera(this.browserContainer);
    this.logicalCamera = new Camera(this.logicalContainer);
    this.physicalCamera = new Camera(this.physicalContainer);

    this.resizeToFit();
    window.addEventListener('resize', () => this.resizeToFit());

    // Worlds (shared EntityManager)
    const topologyLayout = getTopologyLayout();
    const physicalLayout = getPhysicalLayout();

    this.logicalWorld = new World(topologyLayout, GRID_COLS, LOGICAL_ROWS, this.entityManager, false);
    this.physicalWorld = new World(physicalLayout, GRID_COLS, PHYSICAL_ROWS, this.entityManager, true);

    this.logicalWorld.build();
    this.physicalWorld.build();

    this.logicalContainer.addChild(this.logicalWorld.container);
    this.physicalContainer.addChild(this.physicalWorld.container);

    // Packet Managers (one per canvas — topology + physical)
    this.logicalPacketManager = new PacketManager(this.entityManager);
    this.logicalContainer.addChild(this.logicalPacketManager.container);

    this.physicalPacketManager = new PacketManager(this.entityManager);
    this.physicalContainer.addChild(this.physicalPacketManager.container);

    // Character Manager (physical only)
    this.characterManager = new CharacterManager(
      this.physicalWorld.grid, this.eventBus, this.entityManager,
    );
    this.physicalContainer.addChild(this.characterManager.container);

    // Systems (shared EntityManager gives access to all nodes)
    const physicalNodeIdSet = new Set<string>();
    for (const np of physicalLayout.nodes) {
      const node = this.physicalWorld.getNodeByLabel(np.label);
      if (node) physicalNodeIdSet.add(node.id);
    }
    this.incidentSystem = new IncidentSystem(this.eventBus, this.entityManager, physicalNodeIdSet);
    this.logicalTrafficSystem = new TrafficSystem(this.eventBus, this.logicalWorld.cableManager, this.logicalPacketManager);
    this.physicalTrafficSystem = new TrafficSystem(this.eventBus, this.physicalWorld.cableManager, this.physicalPacketManager);
    this.ticketSystem = new TicketSystem(this.eventBus, this.characterManager, this.entityManager);
    this.spawnSystem = new SpawnSystem(this.characterManager, this.eventBus);
    this.challengeSystem = new ChallengeSystem(this.eventBus, this.entityManager);

    // Spawn initial characters (physical world)
    const spawnPoints = this.physicalWorld.getSpawnPoints();
    for (let i = 0; i < Math.min(3, spawnPoints.length); i++) {
      const sp = spawnPoints[i];
      this.characterManager.spawn('engineer', sp.col, sp.row);
    }
    if (spawnPoints.length > 3) {
      this.characterManager.spawn('janitor', spawnPoints[3].col, spawnPoints[3].row);
    }
    if (spawnPoints.length > 4) {
      this.characterManager.spawn('manager', spawnPoints[4].col, spawnPoints[4].row);
    }

    // Collect node IDs per world for InputManagers
    const logicalNodeIds = new Set<string>();
    for (const np of topologyLayout.nodes) {
      const node = this.logicalWorld.getNodeByLabel(np.label);
      if (node) logicalNodeIds.add(node.id);
    }
    const physicalNodeIds = new Set<string>();
    for (const np of physicalLayout.nodes) {
      const node = this.physicalWorld.getNodeByLabel(np.label);
      if (node) physicalNodeIds.add(node.id);
    }

    // Input (topology + physical canvases)
    new InputManager(this.logicalApp, this.eventBus, this.entityManager, logicalNodeIds, this.logicalContainer);
    new InputManager(this.physicalApp, this.eventBus, this.entityManager, physicalNodeIds, this.physicalContainer);

    // UI
    const overlay = document.getElementById('ui-overlay')!;
    this.uiManager = new UIManager(
      overlay,
      this.eventBus,
      this.ticketSystem,
      this.incidentSystem,
      this.physicalTrafficSystem,
      this.characterManager,
      this.entityManager,
      this.challengeSystem,
    );

    // Virtual browser (own canvas panel)
    this.virtualBrowser = new VirtualBrowser(
      this.eventBus, this.entityManager, this.logicalTrafficSystem, this.incidentSystem,
    );
    this.browserContainer.addChild(this.virtualBrowser.container);

    // Handle cable:cut event for random cable damage
    this.eventBus.on('cable:cut', ({ cableId }) => {
      // Check both worlds' cables
      const allCables = [
        ...this.logicalWorld.cableManager.getCables(),
        ...this.physicalWorld.cableManager.getCables(),
      ];
      if (cableId === 'random' && allCables.length > 0) {
        const idx = Math.floor(Math.random() * allCables.length);
        allCables[idx].damaged = true;
        const cable = allCables[idx];
        const fromNode = this.entityManager.get(cable.fromNodeId);
        const toNode = this.entityManager.get(cable.toNodeId);
        if (fromNode && toNode) {
          const fn = fromNode as NetworkNode;
          const tn = toNode as NetworkNode;
          cable.draw(fn.worldCenterX, fn.worldCenterY, tn.worldCenterX, tn.worldCenterY);
        }
      }
    });

    // Auto-repair cables
    this.eventBus.on('cable:repaired', ({ cableId }) => {
      const cable =
        this.logicalWorld.cableManager.getCableById(cableId) ??
        this.physicalWorld.cableManager.getCableById(cableId);
      if (cable) {
        cable.damaged = false;
      }
    });

    // 모든 오브젝트 생성 후 다시 한번 resize → 스프라이트 보정 적용
    this.resizeToFit();

    // Main loop (physical app drives the tick)
    this.physicalApp.ticker.add((ticker) => {
      const delta = ticker.deltaTime / 60;
      this.update(delta);
    });

    console.log('[NOC] Aquarium initialized — triple canvas online');
  }

  private update(delta: number): void {
    this.logicalWorld.update(delta);
    this.physicalWorld.update(delta);
    this.characterManager.update(delta);
    this.logicalPacketManager.update(delta);
    this.physicalPacketManager.update(delta);
    this.incidentSystem.update(delta);
    this.ticketSystem.update(delta);
    this.logicalTrafficSystem.update(delta);
    this.physicalTrafficSystem.update(delta);
    this.spawnSystem.update(delta);
    this.challengeSystem.update(delta);
    this.virtualBrowser.update(delta);
    this.uiManager.update(delta);
    this.browserCamera.update();
    this.logicalCamera.update();
    this.physicalCamera.update();
  }

  /**
   * 마인드맵 스타일 리사이즈 — 캔버스를 빈틈 없이 채우되,
   * 스프라이트는 uniformScale 로 보정하여 비율 유지.
   * 브라우저가 줄어들면 오브젝트 위치가 자연스럽게 압축된다.
   */
  private resizeToFit(): void {
    const wrappers = document.querySelectorAll('.canvas-wrapper');
    if (wrappers.length < 3) return;

    const browserWrapper = wrappers[0] as HTMLElement;
    const logicalWrapper = wrappers[1] as HTMLElement;
    const physicalWrapper = wrappers[2] as HTMLElement;

    // ── Browser canvas — 독립 축 스케일 (패널 빈틈 없이 채움) ──
    const bw = browserWrapper.clientWidth;
    const bh = browserWrapper.clientHeight;
    if (bw > 0 && bh > 0) {
      this.browserApp.renderer.resize(bw, bh);

      const bsx = bw / BROWSER_CANVAS_WIDTH;
      const bsy = bh / BROWSER_CANVAS_HEIGHT;
      this.browserCamera.baseScaleX = bsx;
      this.browserCamera.baseScaleY = bsy;

      this.virtualBrowser?.setTextCounterScale(bsx, bsy);

      this.browserApp.stage.hitArea = this.browserApp.screen;
    }

    // ── Topology canvas ──
    const lw = logicalWrapper.clientWidth;
    const lh = logicalWrapper.clientHeight;
    if (lw > 0 && lh > 0) {
      this.logicalApp.renderer.resize(lw, lh);

      // 축별 독립 스케일 → 캔버스 전체를 빈틈 없이 채움
      const lsx = lw / LOGICAL_CANVAS_WIDTH;
      const lsy = lh / LOGICAL_CANVAS_HEIGHT;
      this.logicalCamera.baseScaleX = lsx;
      this.logicalCamera.baseScaleY = lsy;

      // 스프라이트 보정: uniformScale / axisScale
      const lUniform = Math.min(lsx, lsy);
      this.logicalWorld?.setSpriteScale(lUniform / lsx, lUniform / lsy, lsx, lsy);

      this.logicalApp.stage.hitArea = this.logicalApp.screen;
    }

    // ── Physical canvas ──
    const pw = physicalWrapper.clientWidth;
    const ph = physicalWrapper.clientHeight;
    if (pw > 0 && ph > 0) {
      this.physicalApp.renderer.resize(pw, ph);

      const psx = pw / PHYSICAL_CANVAS_WIDTH;
      const psy = ph / PHYSICAL_CANVAS_HEIGHT;
      this.physicalCamera.baseScaleX = psx;
      this.physicalCamera.baseScaleY = psy;

      const pUniform = Math.min(psx, psy);
      const pcx = pUniform / psx;
      const pcy = pUniform / psy;
      this.physicalWorld?.setSpriteScale(pcx, pcy, psx, psy);
      this.characterManager?.setSpriteScale(pcx, pcy, psx, psy);

      this.physicalApp.stage.hitArea = this.physicalApp.screen;
    }
  }
}
