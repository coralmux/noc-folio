import { ChallengeSystem, ActiveChallenge } from '../systems/ChallengeSystem';
import { ChallengeTemplate } from '../data/challengeTemplates';

export class ConsolePanel {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private outputArea: HTMLDivElement;
  private optionsArea: HTMLDivElement;
  private stepIndicator: HTMLDivElement;
  private titleArea: HTMLDivElement;
  private challengeSystem: ChallengeSystem;
  private visible = false;
  private currentTemplate: ChallengeTemplate | null = null;
  private outputLog: string[] = [];

  constructor(parentOverlay: HTMLElement, challengeSystem: ChallengeSystem) {
    this.challengeSystem = challengeSystem;

    // Fullscreen semi-transparent overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      pointer-events: auto;
    `;

    // Terminal panel
    this.panel = document.createElement('div');
    this.panel.style.cssText = `
      width: 500px;
      max-height: 80vh;
      background: #0c1018;
      border: 1px solid #61c777;
      border-radius: 8px;
      padding: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #d6dbe0;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(97, 199, 119, 0.15);
    `;

    // Title bar
    this.titleArea = document.createElement('div');
    this.titleArea.style.cssText = `
      padding: 12px 16px;
      background: #161b22;
      border-bottom: 1px solid #283040;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    // Step indicator
    this.stepIndicator = document.createElement('div');
    this.stepIndicator.style.cssText = `
      padding: 8px 16px;
      color: #959da5;
      font-size: 11px;
      border-bottom: 1px solid #1a1e28;
    `;

    // Output area (terminal log)
    this.outputArea = document.createElement('div');
    this.outputArea.style.cssText = `
      padding: 16px;
      min-height: 120px;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.5;
      background: #0a0e14;
    `;

    // Options area
    this.optionsArea = document.createElement('div');
    this.optionsArea.style.cssText = `
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid #283040;
    `;

    this.panel.appendChild(this.titleArea);
    this.panel.appendChild(this.stepIndicator);
    this.panel.appendChild(this.outputArea);
    this.panel.appendChild(this.optionsArea);
    this.overlay.appendChild(this.panel);
    parentOverlay.appendChild(this.overlay);
  }

  open(challenge: ActiveChallenge): void {
    this.currentTemplate = challenge.template;
    this.outputLog = [];
    this.visible = true;
    this.overlay.style.display = 'flex';
    this.resetPanelStyles();
    this.renderTitle();
    this.renderStep(challenge);
  }

  close(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
    this.currentTemplate = null;
    this.outputLog = [];
    this.resetPanelStyles();
  }

  isVisible(): boolean {
    return this.visible;
  }

  private resetPanelStyles(): void {
    this.panel.style.borderColor = '#61c777';
    this.panel.style.boxShadow = '0 0 30px rgba(97, 199, 119, 0.15)';
  }

  private renderTitle(): void {
    if (!this.currentTemplate) return;
    this.titleArea.innerHTML = `
      <span style="font-size: 18px;">${this.currentTemplate.emoji}</span>
      <span style="color: #61c777; font-weight: bold;">${this.currentTemplate.title}</span>
    `;
  }

  private buildOutputHtml(promptText: string): string {
    if (!this.currentTemplate) return '';
    let html = `<div style="color: #959da5; margin-bottom: 8px;"># ${this.currentTemplate.description}</div>`;
    for (const line of this.outputLog) {
      html += `<div>${line}</div>`;
    }
    html += `<div style="color: #d9a840; margin-top: 8px;">${promptText}</div>`;
    return html;
  }

  private refreshOutputArea(promptText: string): void {
    this.outputArea.innerHTML = this.buildOutputHtml(promptText);
    this.outputArea.scrollTop = this.outputArea.scrollHeight;
  }

  private renderStep(challenge: ActiveChallenge): void {
    if (!this.currentTemplate) return;
    const step = this.currentTemplate.steps[challenge.currentStep];
    const totalSteps = this.currentTemplate.steps.length;

    this.stepIndicator.textContent = `Step ${challenge.currentStep + 1}/${totalSteps}`;

    this.refreshOutputArea(step.prompt);

    // Render options
    this.optionsArea.innerHTML = '';
    step.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.style.cssText = `
        background: #161b22;
        border: 1px solid #61c777;
        border-radius: 4px;
        color: #d6dbe0;
        padding: 10px 16px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s;
      `;
      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) {
          btn.style.background = '#1a2a1a';
          btn.style.borderColor = '#71d787';
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.disabled) {
          btn.style.background = '#161b22';
          btn.style.borderColor = '#61c777';
        }
      });
      btn.addEventListener('click', () => this.handleAnswer(index));
      this.optionsArea.appendChild(btn);
    });
  }

  private extractCommand(option: string): string {
    return option.replace(/^\$\s*/, '');
  }

  private handleAnswer(optionIndex: number): void {
    const challenge = this.challengeSystem.getCurrentChallenge();
    if (!challenge || !this.currentTemplate) return;

    const step = this.currentTemplate.steps[challenge.currentStep];
    const result = this.challengeSystem.submitAnswer(optionIndex);

    if (result.correct) {
      this.outputLog.push(`<span style="color: #61c777;">$ ${this.extractCommand(step.options[optionIndex])}</span>`);
      this.outputLog.push(`<span style="color: #b0b8c4;">${result.output.replace(/\n/g, '</span><br><span style="color: #b0b8c4;">')}</span>`);

      if (result.done) {
        this.showSuccess();
      } else {
        const nextChallenge = this.challengeSystem.getCurrentChallenge();
        if (nextChallenge) {
          this.renderStep(nextChallenge);
        }
      }
    } else {
      // Disable the wrong button
      const buttons = this.optionsArea.querySelectorAll('button');
      const btn = buttons[optionIndex] as HTMLButtonElement;
      if (btn) {
        btn.style.borderColor = '#e06468';
        btn.style.background = '#2a1a1a';
        btn.style.color = '#959da5';
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
      }

      this.outputLog.push(`<span style="color: #e06468;">$ ${this.extractCommand(step.options[optionIndex])}</span>`);
      this.outputLog.push(`<span style="color: #d87070;">${result.output}</span>`);

      if (result.done && result.failed) {
        this.showFailure();
        return;
      }

      // Auto-hint: highlight the correct answer after 2 wrong on same step
      if (result.autoHint) {
        const correctBtn = buttons[step.correctIndex] as HTMLButtonElement;
        if (correctBtn) {
          correctBtn.style.borderColor = '#d9a840';
          correctBtn.style.background = '#2a2a1a';
          correctBtn.style.color = '#d9a840';
        }
        this.outputLog.push(`<span style="color: #d9a840;">💡 힌트: 강조된 명령어를 확인하세요.</span>`);
      }

      this.refreshOutputArea(step.prompt);
    }
  }

  private showSuccess(): void {
    this.optionsArea.innerHTML = `
      <div style="text-align: center; padding: 16px; color: #61c777; font-size: 16px;">
        문제 해결 완료! 노드가 복구되었습니다.
      </div>
    `;
    this.panel.style.borderColor = '#61c777';
    this.panel.style.boxShadow = '0 0 40px rgba(97, 199, 119, 0.3)';
    setTimeout(() => this.close(), 2500);
  }

  private showFailure(): void {
    this.optionsArea.innerHTML = `
      <div style="text-align: center; padding: 16px; color: #e06468; font-size: 16px;">
        챌린지 실패... 엔지니어가 처리합니다.
      </div>
    `;
    this.panel.style.borderColor = '#e06468';
    this.panel.style.boxShadow = '0 0 40px rgba(224, 100, 104, 0.3)';
    setTimeout(() => this.close(), 2500);
  }
}
