import { Character } from '../Character';
import { WalkState } from '../states/WalkState';
import { WorkState } from '../states/WorkState';
import { PanicState } from '../states/PanicState';
import { IdleState } from '../states/IdleState';
import { randomPick, randomChance, randomFloat } from '../../utils/random';
import { NetworkNode } from '../../entities/nodes/NetworkNode';
import { EntityManager } from '../../entities/EntityManager';

/**
 * Janitor AI: 서버 주변을 청소하다가 실수로 케이블을 건드림
 */
export function janitorIdleBehavior(
  character: Character,
  entityManager?: EntityManager,
): void {
  // 서버 근처를 돌아다니며 청소
  const nodes = entityManager?.getAll().filter(
    (e): e is NetworkNode => e instanceof NetworkNode,
  ) ?? [];

  if (nodes.length === 0) return;

  const target = randomPick(nodes);
  const destCol = target.gridCol + target.gridWidth + 1;
  const destRow = target.gridRow + target.gridHeight;

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    character.setTask('바닥 청소', '🧹', [
      '(바닥 닦는 중...)',
      '(서버 아래 먼지 제거...)',
      '(케이블 정리... 어?)',
    ]);
    character.setState(new WalkState(path, (c) => {
      c.setState(new WorkState(randomFloat(3, 5), (ch) => {
        // 15% 확률로 케이블 절단
        if (randomChance(0.15) && ch.eventBus) {
          ch.eventBus.emit('cable:cut', { cableId: 'random' });
          ch.clearTask();
          ch.setBubble('😱 케이블을 건드렸다!');
          ch.setState(new PanicState(2.5));
        } else {
          ch.clearTask();
          ch.setState(new IdleState(entityManager));
        }
      }));
    }));
  }
}
