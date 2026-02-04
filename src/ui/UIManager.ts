import { EventBus } from '../core/EventBus';
import { InfoPanel } from './InfoPanel';
import { TicketBoard } from './TicketBoard';
import { StatsBar } from './StatsBar';
import { MiniLog } from './MiniLog';
import { ProfileCard } from './ProfileCard';
import { ConsolePanel } from './ConsolePanel';
import { AIChatModal } from './AIChatModal';
import { TicketSystem } from '../systems/TicketSystem';
import { IncidentSystem } from '../systems/IncidentSystem';
import { TrafficSystem } from '../systems/TrafficSystem';
import { ChallengeSystem } from '../systems/ChallengeSystem';
import { CharacterManager } from '../characters/CharacterManager';
import { EntityManager } from '../entities/EntityManager';
import { NetworkNode } from '../entities/nodes/NetworkNode';

export class UIManager {
  private infoPanel: InfoPanel;
  private ticketBoard: TicketBoard;
  private statsBar: StatsBar;
  private miniLog: MiniLog;
  private profileCard: ProfileCard;
  private consolePanel: ConsolePanel;
  private aiChatModal: AIChatModal;
  private entityManager: EntityManager;
  private challengeSystem: ChallengeSystem;
  private banner: HTMLDivElement;
  private bannerVisible = false;
  private updateTimer = 0;

  constructor(
    overlay: HTMLElement,
    eventBus: EventBus,
    ticketSystem: TicketSystem,
    incidentSystem: IncidentSystem,
    trafficSystem: TrafficSystem,
    characterManager: CharacterManager,
    entityManager: EntityManager,
    challengeSystem: ChallengeSystem,
  ) {
    this.entityManager = entityManager;
    this.challengeSystem = challengeSystem;

    // Layout containers
    const topBar = document.getElementById('top-bar')!;
    const profileSection = document.getElementById('profile-section')!;
    const leftPanel = document.getElementById('left-panel')!;
    const rightPanel = document.getElementById('right-panel')!;

    // Components in their layout slots
    this.statsBar = new StatsBar(topBar, incidentSystem, trafficSystem, characterManager, entityManager);
    this.profileCard = new ProfileCard(profileSection);
    this.ticketBoard = new TicketBoard(leftPanel, ticketSystem, (ticketId) => {
      if (this.consolePanel.isVisible()) return;
      const ticket = ticketSystem.getTicketById(ticketId);
      if (!ticket?.challengeTemplateId) return;
      const challenge = challengeSystem.startTicketChallenge(ticket.challengeTemplateId, ticketId);
      if (challenge) {
        this.consolePanel.open(challenge);
      }
    });
    this.miniLog = new MiniLog(rightPanel, eventBus, trafficSystem, entityManager);

    // Overlays (modal popups — stay in ui-overlay)
    this.infoPanel = new InfoPanel(overlay);
    this.consolePanel = new ConsolePanel(overlay, challengeSystem);
    this.aiChatModal = new AIChatModal(overlay);

    // Wire Contact(AI) button to chat modal
    this.profileCard.setOnContactAI(() => this.aiChatModal.open());

    // Banner
    this.banner = document.createElement('div');
    this.banner.className = 'alert-banner';
    this.banner.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0;
      background: linear-gradient(90deg, #e06468, #d07048, #e06468);
      color: #fff;
      text-align: center;
      padding: 10px 0;
      font-family: 'Courier New', monospace;
      font-size: 15px;
      font-weight: bold;
      z-index: 500;
      display: none;
      pointer-events: none;
      animation: bannerPulse 1s ease-in-out infinite;
    `;
    this.banner.textContent = '!! Click the blinking node to fix the incident !!';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes bannerPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.banner);

    // Handle node clicks
    eventBus.on('node:click', ({ nodeId }) => {
      const node = entityManager.get(nodeId) as NetworkNode | undefined;
      if (!node) return;

      if (node.blinking) {
        // ChallengeSystem handles via its own node:click listener
      } else {
        if (!this.consolePanel.isVisible()) {
          this.infoPanel.showForNode(node);
        }
      }
    });

    // Challenge events
    eventBus.on('challenge:blinking', () => {
      this.showBanner();
    });

    eventBus.on('challenge:start', () => {
      this.hideBanner();
      const challenge = challengeSystem.getCurrentChallenge();
      if (challenge) {
        this.infoPanel.hide();
        this.consolePanel.open(challenge);
      }
    });

    eventBus.on('challenge:success', () => {
      this.hideBanner();
    });

    eventBus.on('challenge:failed', () => {
      this.hideBanner();
    });
  }

  update(delta: number): void {
    this.updateTimer += delta;
    if (this.updateTimer >= 0.5) {
      this.updateTimer = 0;
      this.ticketBoard.update();
      this.miniLog.update();
      this.statsBar.update();
    }

    const challenge = this.challengeSystem.getCurrentChallenge();
    if ((!challenge || challenge.started) && this.bannerVisible) {
      this.hideBanner();
    }
  }

  private showBanner(): void {
    if (!this.bannerVisible) {
      this.banner.style.display = 'block';
      this.bannerVisible = true;
    }
  }

  private hideBanner(): void {
    if (this.bannerVisible) {
      this.banner.style.display = 'none';
      this.bannerVisible = false;
    }
  }
}
