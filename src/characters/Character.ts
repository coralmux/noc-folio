import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CharacterType, CELL_SIZE, GRID_COLS, PHYSICAL_ROWS } from '../constants';
import { CharacterState } from './states/CharacterState';
import { IdleState } from './states/IdleState';
import { PixelSprites } from '../rendering/PixelSprites';
import { Pathfinder } from './pathfinding/Pathfinder';
import { EventBus } from '../core/EventBus';

let characterCounter = 0;

export type FacingDirection = 'up' | 'down' | 'left' | 'right';
export class Character {
  public readonly id: string;
  public readonly type: CharacterType;
  public readonly container: Container;
  public gridCol: number;
  public gridRow: number;
  public facing: FacingDirection = 'down';
  public pathfinder: Pathfinder;
  public eventBus: EventBus | null = null;
  public busy = false;

  /** 현재 수행 중인 커맨드 시퀀스 (command mode용) */
  public currentCommands: string[] = [];
  public currentCommandIndex = 0;
  public currentAction = '';
  public currentEmoji = '';

  /** 비균일 스케일 보정 (resizeToFit에서 전파) */
  public spriteCounterX = 1;
  public spriteCounterY = 1;
  /** 카메라 raw 스케일 (말풍선 크기 고정용) */
  public rawScaleX = 1;
  public rawScaleY = 1;

  private state: CharacterState;
  private bubbleContainer: Container | null = null;
  private commandTickTimer = 0;
  private lastRenderedBubble = '';

  constructor(
    type: CharacterType,
    col: number,
    row: number,
    pathfinder: Pathfinder,
    eventBus?: EventBus,
  ) {
    this.id = `char_${type}_${characterCounter++}`;
    this.type = type;
    this.gridCol = col;
    this.gridRow = row;
    this.pathfinder = pathfinder;
    this.eventBus = eventBus ?? null;

    this.container = new Container();
    this.container.x = col * CELL_SIZE + CELL_SIZE / 2;
    this.container.y = row * CELL_SIZE + CELL_SIZE / 2;

    const sprite = PixelSprites.createCharacter(type);
    this.container.addChild(sprite);

    this.state = new IdleState();
    this.state.enter(this);
  }

  setState(newState: CharacterState): void {
    const oldName = this.state.name;
    this.state.exit(this);
    this.state = newState;
    this.state.enter(this);
    if (this.eventBus) {
      this.eventBus.emit('character:stateChange', {
        characterId: this.id,
        from: oldName,
        to: newState.name,
      });
    }
  }

  get currentStateName(): string {
    return this.state.name;
  }

  /** 커맨드 시퀀스 세팅 (command mode에서 순차적으로 보여줄 프롬프트) */
  setTask(action: string, emoji: string, commands: string[]): void {
    this.currentAction = action;
    this.currentEmoji = emoji;
    this.currentCommands = [...commands];
    this.currentCommandIndex = 0;
    this.commandTickTimer = 0;
    this.refreshBubble();
  }

  clearTask(): void {
    this.currentAction = '';
    this.currentEmoji = '';
    this.currentCommands = [];
    this.currentCommandIndex = 0;
    this.clearBubble();
  }

  /** 단순 이모지/텍스트 말풍선 (패닉, 축하 등 상태용) */
  setBubble(emoji: string): void {
    this.currentAction = '';
    this.currentEmoji = emoji;
    this.currentCommands = [];
    this.renderBubble(emoji, false);
  }

  clearBubble(): void {
    this.lastRenderedBubble = '';
    if (this.bubbleContainer) {
      this.container.removeChild(this.bubbleContainer);
      this.bubbleContainer.destroy({ children: true });
      this.bubbleContainer = null;
    }
  }

  /** 캐릭터 상태 기반 말풍선 표시 */
  private refreshBubble(): void {
    if (this.currentCommands.length > 0) {
      // 커맨드가 있으면 항상 터미널 스타일
      const start = Math.max(0, this.currentCommandIndex - 1);
      const end = Math.min(this.currentCommands.length, this.currentCommandIndex + 2);
      const lines = this.currentCommands.slice(start, end);
      this.renderBubble(lines.join('\n'), true);
    } else if (this.currentEmoji || this.currentAction) {
      const text = this.currentAction
        ? `${this.currentEmoji} ${this.currentAction}`
        : this.currentEmoji;
      this.renderBubble(text, false);
    }
  }

  private renderBubble(content: string, isTerminal: boolean): void {
    // 동일한 내용이면 다시 그리지 않음
    const key = `${content}:${isTerminal}`;
    if (key === this.lastRenderedBubble) return;
    this.lastRenderedBubble = key;

    this.clearBubble();
    if (!content) return;

    this.bubbleContainer = new Container();

    if (isTerminal) {
      // 터미널 스타일 말풍선
      const style = new TextStyle({
        fontSize: 14,
        fontFamily: 'Courier New, monospace',
        fill: 0x61c777,
        lineHeight: 16,
        wordWrap: true,
        wordWrapWidth: 220,
      });
      const text = new Text({ text: content, style, resolution: Math.max(2, window.devicePixelRatio || 1) });
      text.anchor.set(0.5, 1);

      const padX = 6;
      const padY = 4;
      const w = Math.min(text.width + padX * 2, 240);
      const h = text.height + padY * 2;

      const bg = new Graphics();
      // Terminal bg
      bg.roundRect(-w / 2, -h - 8, w, h, 3).fill({ color: 0x0b1018, alpha: 0.92 });
      bg.roundRect(-w / 2, -h - 8, w, h, 3).stroke({ color: 0x61c777, width: 1, alpha: 0.4 });
      // Title bar
      bg.rect(-w / 2, -h - 8, w, 8).fill({ color: 0x182c1a, alpha: 0.9 });
      // Dots
      bg.circle(-w / 2 + 6, -h - 4, 2).fill(0xe06468);
      bg.circle(-w / 2 + 12, -h - 4, 2).fill(0xd9a840);
      bg.circle(-w / 2 + 18, -h - 4, 2).fill(0x61c777);
      // Tail
      bg.moveTo(-3, -8).lineTo(3, -8).lineTo(0, 0).fill({ color: 0x0b1018, alpha: 0.92 });

      this.bubbleContainer.addChild(bg);
      text.x = 0;
      text.y = -8 - padY;
      this.bubbleContainer.addChild(text);
    } else {
      // 일반 말풍선
      const style = new TextStyle({
        fontSize: 16,
        fontFamily: 'Courier New, monospace',
        fill: 0x1a1a2a,
        wordWrap: true,
        wordWrapWidth: 160,
      });
      const text = new Text({ text: content, style, resolution: Math.max(2, window.devicePixelRatio || 1) });
      text.anchor.set(0.5, 1);

      const padX = 8;
      const padY = 4;
      const w = Math.max(text.width + padX * 2, 28);
      const h = text.height + padY * 2;

      const bg = new Graphics();
      bg.roundRect(-w / 2, -h - 6, w, h, 4).fill({ color: 0xffffff, alpha: 0.92 });
      // Tail
      bg.moveTo(-3, -6).lineTo(3, -6).lineTo(0, 0).fill({ color: 0xffffff, alpha: 0.92 });

      this.bubbleContainer.addChild(bg);
      text.x = 0;
      text.y = -6 - padY;
      this.bubbleContainer.addChild(text);
    }

    // 말풍선: 캐릭터 counter-scale의 역수를 적용하여 원래 픽셀 크기 유지
    // 캐릭터 container scale = (counterX, counterY)
    // 카메라 scale = (rawScaleX, rawScaleY)
    // 실효 스케일 = rawScale * counter = uniform
    // 말풍선을 1:1로 하려면 1/(rawScale * counter)
    const bsx = 1 / (this.rawScaleX * this.spriteCounterX);
    const bsy = 1 / (this.rawScaleY * this.spriteCounterY);
    this.bubbleContainer.scale.set(bsx, bsy);
    // 위치도 역수 보정 (부모의 counter-scale 공간에서 -20px 위)
    this.bubbleContainer.y = -20;
    this.container.addChild(this.bubbleContainer);
  }

  update(delta: number): void {
    this.state.update(this, delta);

    // 커맨드 모드 틱: 일정 간격으로 다음 커맨드 줄 표시
    if (this.currentCommands.length > 0 && this.currentCommandIndex < this.currentCommands.length) {
      this.commandTickTimer += delta;
      if (this.commandTickTimer >= 1.2) {
        this.commandTickTimer = 0;
        this.currentCommandIndex++;
        this.refreshBubble();
      }
    }

    // 모드 전환 시 말풍선 갱신
    if (this.currentCommands.length > 0 || this.currentAction) {
      this.refreshBubble();
    }

    // 스프라이트 비균일 스케일 보정 적용
    this.container.scale.set(this.spriteCounterX, this.spriteCounterY);

    // 말풍선 스케일 갱신 (리사이즈 시 rawScale이 변경될 수 있음)
    if (this.bubbleContainer) {
      const bsx = 1 / (this.rawScaleX * this.spriteCounterX);
      const bsy = 1 / (this.rawScaleY * this.spriteCounterY);
      this.bubbleContainer.scale.set(bsx, bsy);
    }

    // 하드 경계 클램핑 — 테두리(1셀=32px) 안쪽에 스프라이트 전체가 머물도록
    // 스프라이트: center 기준 위로 16px, 아래로 14px, 좌우 14px
    const BORDER = CELL_SIZE;        // 32px — 눈에 보이는 테두리 위치
    const EXT_TOP = 16;              // 스프라이트 머리 offset
    const EXT_BOT = 14;              // 스프라이트 발끝 offset
    const EXT_SIDE = 14;             // 좌우 offset
    const canvasW = GRID_COLS * CELL_SIZE;
    const canvasH = PHYSICAL_ROWS * CELL_SIZE;
    this.container.x = Math.max(BORDER + EXT_SIDE, Math.min(canvasW - BORDER - EXT_SIDE, this.container.x));
    this.container.y = Math.max(BORDER + EXT_TOP, Math.min(canvasH - BORDER - EXT_BOT, this.container.y));
  }

  destroy(): void {
    this.clearBubble();
    this.container.destroy({ children: true });
  }
}
