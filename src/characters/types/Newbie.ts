import { Character } from '../Character';
import { WalkState } from '../states/WalkState';
import { WorkState } from '../states/WorkState';
import { PanicState } from '../states/PanicState';
import { IdleState } from '../states/IdleState';
import { randomPick, randomChance, randomFloat } from '../../utils/random';
import { NetworkNode } from '../../entities/nodes/NetworkNode';
import { EntityManager } from '../../entities/EntityManager';

const NEWBIE_COMMANDS = [
  ['$ sudo su -', '# rm -rf /tmp/*', '# wait... which /tmp?', '# oh no...'],
  ['$ vim /etc/network/interfaces', '(어떻게 나가지...)', ':q!', '$ nano /etc/network/interfaces'],
  ['$ iptables -F', '(모든 룰 삭제됨)', '$ ... 어?', '$ ping google.com -- 응답없음'],
  ['$ chmod 777 /etc/shadow', '(파일 권한 변경됨)', '$ 이거 맞나...?', '선배님!!!'],
  ['$ apt upgrade -y', '(커널 업데이트 중...)', '*** REBOOT REQUIRED ***', '$ reboot now (실서버에서?!)'],
];

export function newbieIdleBehavior(
  character: Character,
  entityManager: EntityManager,
): void {
  const nodes = entityManager.getAll().filter(
    (e): e is NetworkNode => e instanceof NetworkNode,
  );
  if (nodes.length === 0) return;

  const target = randomPick(nodes);
  const destCol = target.gridCol + target.gridWidth;
  const destRow = target.gridRow + Math.floor(target.gridHeight / 2);

  const path = character.pathfinder.findPath(
    character.gridCol, character.gridRow,
    destCol, destRow,
  );

  if (path && path.length > 0) {
    const cmds = randomPick(NEWBIE_COMMANDS);
    character.setTask('서버 설정 시도', '📖', cmds);
    character.setState(new WalkState(path, (c) => {
      c.setState(new WorkState(randomFloat(3, 6), (ch) => {
        // 25% 확률로 설정 오류
        if (randomChance(0.25) && ch.eventBus) {
          ch.eventBus.emit('node:damaged', { nodeId: target.id, reason: 'misconfiguration' });
          ch.clearTask();
          ch.setBubble('😱 뭘 잘못 건드렸어?!');
          ch.setState(new PanicState(3.0));
        } else {
          ch.clearTask();
          ch.setState(new IdleState(entityManager));
        }
      }));
    }));
  }
}
