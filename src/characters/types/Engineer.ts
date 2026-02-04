import { Character } from '../Character';
import { WalkState } from '../states/WalkState';
import { WorkState } from '../states/WorkState';
import { IdleState } from '../states/IdleState';
import { randomPick, randomFloat, randomChance } from '../../utils/random';
import { NetworkNode } from '../../entities/nodes/NetworkNode';
import { EntityManager } from '../../entities/EntityManager';
import { Server } from '../../entities/nodes/Server';
import { NODE_TASKS, getTaskKeyForNode, NodeTask, MONITORING_TASKS, BREAK_TASKS } from '../../data/commandTemplates';
import { getPubZoneBounds } from '../../world/WorldLayout';
import { randomInt } from '../../utils/random';

// ─── 엔지니어별 상태 추적 (characterId → state) ───

interface EngineerState {
  patrolIndex: number;       // 순찰 중인 노드 인덱스
  consecutiveWork: number;   // 연속 작업 횟수
  totalWorkCount: number;    // 총 작업 횟수
}

const engineerStates = new Map<string, EngineerState>();

function getState(characterId: string): EngineerState {
  let state = engineerStates.get(characterId);
  if (!state) {
    state = { patrolIndex: 0, consecutiveWork: 0, totalWorkCount: 0 };
    engineerStates.set(characterId, state);
  }
  return state;
}

/**
 * Engineer AI 고도화:
 * 1. 순찰 루틴 — 노드를 순차적으로 방문
 * 2. 사전 모니터링 — health < 70 노드 발견 시 경고
 * 3. 피로도 — 연속 3회 작업 후 커피 브레이크
 * 4. 우선순위 — damaged > warning > 순찰 > 모니터링
 * 5. Idle 다양화 — 로그 워치, 헬스체크 등 다양한 행동
 */
export function engineerIdleBehavior(
  character: Character,
  entityManager: EntityManager,
): void {
  const nodes = entityManager.getAll().filter(
    (e): e is NetworkNode => e instanceof NetworkNode,
  );
  if (nodes.length === 0) return;

  const state = getState(character.id);

  // ── 피로도 체크: 연속 3회 이상 작업 시 휴식 ──
  if (state.consecutiveWork >= 3 && randomChance(0.7)) {
    goOnBreak(character, entityManager, state);
    return;
  }

  // ── 우선순위 1: critical/offline 노드 → 즉시 대응 ──
  const criticalNodes = nodes.filter(n => n.status === 'critical' || n.status === 'offline');
  if (criticalNodes.length > 0) {
    const target = criticalNodes.reduce((worst, n) => n.health < worst.health ? n : worst, criticalNodes[0]);
    respondToNode(character, entityManager, target, state, true);
    return;
  }

  // ── 우선순위 2: warning 노드 → 사전 모니터링 ──
  const warningNodes = nodes.filter(n => n.status === 'warning');
  if (warningNodes.length > 0 && randomChance(0.6)) {
    const target = randomPick(warningNodes);
    monitorNode(character, entityManager, target, state);
    return;
  }

  // ── 우선순위 3: 순찰 루틴 (60%) vs 모니터링 (25%) vs 대기 (15%) ──
  const roll = Math.random();

  if (roll < 0.60) {
    // 순찰: 노드를 순차적으로 방문
    const target = nodes[state.patrolIndex % nodes.length];
    state.patrolIndex = (state.patrolIndex + 1) % nodes.length;
    respondToNode(character, entityManager, target, state, false);
  } else if (roll < 0.85) {
    // 사전 모니터링: 랜덤 노드 헬스체크
    const target = randomPick(nodes);
    monitorNode(character, entityManager, target, state);
  } else {
    // 대기: 로그 워치 등 가벼운 행동
    idleAction(character, entityManager, state);
  }
}

/** 노드로 이동 → 작업 수행 */
function respondToNode(
  character: Character,
  entityManager: EntityManager,
  target: NetworkNode,
  state: EngineerState,
  isUrgent: boolean,
): void {
  const destCol = target.gridCol + target.gridWidth;
  const destRow = target.gridRow + Math.floor(target.gridHeight / 2);

  if (isUrgent) {
    character.setBubble('🚨');
  }

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    character.setState(new WalkState(path, (c) => {
      const variant = (target instanceof Server) ? (target as Server).variant : undefined;
      const taskKey = getTaskKeyForNode(target.label, variant);
      const tasks = NODE_TASKS[taskKey] ?? NODE_TASKS['generic'];
      const task = randomPick(tasks) as NodeTask;

      c.setTask(task.action, task.emoji, task.commands);

      // 긴급 시 더 빠르게, 일반 시 여유롭게
      const baseTime = task.commands.length * 1.2;
      const workDuration = isUrgent
        ? baseTime + randomFloat(0.3, 0.8)
        : baseTime + randomFloat(0.5, 2.0);

      c.setState(new WorkState(workDuration, (ch) => {
        ch.clearTask();
        state.consecutiveWork++;
        state.totalWorkCount++;
        ch.setState(new IdleState(entityManager));
      }));
    }));
  }
}

/** 사전 모니터링 — 노드로 가서 헬스체크 수행 */
function monitorNode(
  character: Character,
  entityManager: EntityManager,
  target: NetworkNode,
  state: EngineerState,
): void {
  const destCol = target.gridCol + target.gridWidth;
  const destRow = target.gridRow + Math.floor(target.gridHeight / 2);

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    character.setState(new WalkState(path, (c) => {
      const task = randomPick(MONITORING_TASKS);
      c.setTask(task.action, task.emoji, task.commands);

      const workDuration = task.commands.length * 1.2 + randomFloat(0.5, 1.0);

      c.setState(new WorkState(workDuration, (ch) => {
        // warning 노드 발견 시 경고 이모지
        if (target.status === 'warning') {
          ch.setBubble('⚠️');
          setTimeout(() => {
            ch.clearBubble();
            ch.setState(new IdleState(entityManager));
          }, 1500);
        } else {
          ch.clearTask();
          ch.setState(new IdleState(entityManager));
        }
      }));
    }));
  }
}

/** 커피 브레이크 — Pub으로 이동해서 휴식 */
function goOnBreak(
  character: Character,
  entityManager: EntityManager,
  state: EngineerState,
): void {
  const pub = getPubZoneBounds();
  const destCol = randomInt(pub.col + 1, pub.col + pub.width - 2);
  const destRow = randomInt(pub.row + 1, pub.row + pub.height - 2);

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    character.setState(new WalkState(path, (c) => {
      const task = randomPick(BREAK_TASKS);
      c.setTask(task.action, task.emoji, task.commands);

      const breakDuration = task.commands.length * 1.2 + randomFloat(2.0, 4.0);

      c.setState(new WorkState(breakDuration, (ch) => {
        ch.clearTask();
        state.consecutiveWork = 0;  // 피로도 리셋
        ch.setState(new IdleState(entityManager));
      }));
    }));
  } else {
    // 경로 못 찾으면 그 자리에서 간단 휴식
    state.consecutiveWork = 0;
  }
}

/** 가벼운 대기 행동 — 제자리에서 로그 확인 등 */
function idleAction(
  character: Character,
  entityManager: EntityManager,
  state: EngineerState,
): void {
  const task = randomPick(MONITORING_TASKS);
  character.setTask(task.action, task.emoji, task.commands);

  const duration = task.commands.length * 1.2 + randomFloat(0.5, 1.5);

  character.setState(new WorkState(duration, (ch) => {
    ch.clearTask();
    ch.setState(new IdleState(entityManager));
  }));
}
