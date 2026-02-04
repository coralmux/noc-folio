import { Character } from '../Character';
import { WalkState } from '../states/WalkState';
import { WorkState } from '../states/WorkState';
import { IdleState } from '../states/IdleState';
import { randomPick, randomFloat } from '../../utils/random';
import { NetworkNode } from '../../entities/nodes/NetworkNode';
import { EntityManager } from '../../entities/EntityManager';

const MANAGER_COMMANDS = [
  ['$ cat /tmp/kpi_report.csv', '가동율: 99.97%', 'MTTR: 12분', '보고서 작성 완료'],
  ['$ slack send #noc "주간 보고"', '금주 장애: 3건', '해결율: 100%', 'SLA 준수율: 99.9%'],
  ['$ jira sprint-report', 'Sprint #42 완료율: 87%', 'Carry-over: 2건', '다음 스프린트 계획 중...'],
];

export function managerIdleBehavior(
  character: Character,
  entityManager: EntityManager,
): void {
  const nodes = entityManager.getAll().filter(
    (e): e is NetworkNode => e instanceof NetworkNode,
  );
  if (nodes.length === 0) return;

  // 관리자는 모니터월 우선, 없으면 랜덤
  const monitors = nodes.filter(n => n.nodeType === 'monitorwall');
  const target = monitors.length > 0 ? randomPick(monitors) : randomPick(nodes);

  const destCol = target.gridCol + target.gridWidth;
  const destRow = target.gridRow + Math.floor(target.gridHeight / 2);

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    const cmds = randomPick(MANAGER_COMMANDS);
    character.setTask('KPI 점검', '📊', cmds);
    character.setState(new WalkState(path, (c) => {
      c.setState(new WorkState(randomFloat(2, 4), (ch) => {
        ch.clearTask();
        ch.setState(new IdleState(entityManager));
      }));
    }));
  }
}
