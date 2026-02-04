import { CharacterState } from './CharacterState';
import { WalkState } from './WalkState';
import { WorkState } from './WorkState';
import { CelebrationState } from './CelebrationState';
import type { Character } from '../Character';
import { randomPick, randomFloat } from '../../utils/random';
import { INCIDENT_REPAIR_TASKS, type IncidentRepairTask } from '../../data/commandTemplates';

/**
 * RespondState 고도화:
 * 1. 진단 단계 — 장애 유형별 진단 커맨드 표시
 * 2. 수리 단계 — 피해 규모 비례 수리 시간
 * 3. 검증 단계 — 수리 후 상태 확인
 */
export class RespondState implements CharacterState {
  readonly name = 'respond';
  private targetCol: number;
  private targetRow: number;
  private nodeId: string;
  private incidentType: string;
  private damage: number;

  constructor(
    targetCol: number,
    targetRow: number,
    nodeId: string,
    incidentType = 'generic',
    damage = 20,
  ) {
    this.targetCol = targetCol;
    this.targetRow = targetRow;
    this.nodeId = nodeId;
    this.incidentType = incidentType;
    this.damage = damage;
  }

  enter(character: Character): void {
    character.setBubble('🚨');
    const path = character.pathfinder.findPath(
      character.gridCol, character.gridRow,
      this.targetCol, this.targetRow,
    );
    if (path && path.length > 0) {
      const walkState = new WalkState(path, () => {
        this.startDiagnosis(character);
      });
      character.setState(walkState);
    }
  }

  /** 1단계: 진단 */
  private startDiagnosis(character: Character): void {
    const repairTask = this.getRepairTask();

    if (repairTask) {
      // 장애 유형별 진단 커맨드
      character.setTask(repairTask.diagAction, repairTask.diagEmoji, repairTask.diagCommands);
      const diagDuration = repairTask.diagCommands.length * 1.2 + randomFloat(0.5, 1.0);

      character.setState(new WorkState(diagDuration, (c) => {
        c.clearTask();
        this.startRepair(c, repairTask);
      }));
    } else {
      // fallback: 진단 없이 바로 수리
      character.setBubble('🔧');
      this.startRepairFallback(character);
    }
  }

  /** 2단계: 수리 — 피해 규모 비례 시간 */
  private startRepair(character: Character, repairTask: IncidentRepairTask): void {
    character.setTask(repairTask.repairAction, repairTask.repairEmoji, repairTask.repairCommands);

    // 수리 시간: 기본 커맨드 시간 + 피해 비례 추가 (damage 60 → +3초)
    const baseDuration = repairTask.repairCommands.length * 1.2;
    const damagePenalty = (this.damage / 20) * 1.0;
    const repairDuration = baseDuration + damagePenalty + randomFloat(0.3, 1.0);

    character.setState(new WorkState(repairDuration, (c) => {
      c.clearTask();
      this.startVerification(c, repairTask);
    }));
  }

  /** 3단계: 검증 — 수리 결과 확인 */
  private startVerification(character: Character, repairTask: IncidentRepairTask): void {
    character.setTask('사후 점검', '✅', repairTask.verifyCommands);
    const verifyDuration = repairTask.verifyCommands.length * 1.2 + randomFloat(0.3, 0.8);

    character.setState(new WorkState(verifyDuration, (c) => {
      c.clearTask();
      // 수리 완료 이벤트
      if (c.eventBus) {
        c.eventBus.emit('node:repaired', { nodeId: this.nodeId });
      }
      c.setState(new CelebrationState());
    }));
  }

  /** 장애 유형 매칭 실패 시 fallback */
  private startRepairFallback(character: Character): void {
    // damage 비례 수리 시간 (최소 3초, 최대 8초)
    const repairDuration = Math.min(8, Math.max(3, this.damage / 10 + 2)) + randomFloat(0.5, 1.5);

    character.setState(new WorkState(repairDuration, (c) => {
      if (c.eventBus) {
        c.eventBus.emit('node:repaired', { nodeId: this.nodeId });
      }
      c.setState(new CelebrationState());
    }));
  }

  private getRepairTask(): IncidentRepairTask | null {
    const tasks = INCIDENT_REPAIR_TASKS[this.incidentType];
    if (tasks && tasks.length > 0) {
      return randomPick(tasks);
    }
    return null;
  }

  update(_character: Character, _delta: number): void {
    // Transition happens in enter via WalkState callback
  }

  exit(_character: Character): void {}
}
