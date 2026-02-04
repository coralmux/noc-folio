import { Character } from '../Character';
import { WalkState } from '../states/WalkState';
import { AttackState } from '../states/AttackState';
import { randomPick } from '../../utils/random';
import { NetworkNode } from '../../entities/nodes/NetworkNode';
import { EntityManager } from '../../entities/EntityManager';

const HACKER_COMMANDS = [
  ['$ nmap -sS 10.0.0.0/24', 'Scanning...', '22/tcp open ssh', '443/tcp open https'],
  ['$ hydra -l root -P rockyou.txt ssh://10.0.1.1', 'Trying password...', '[22][ssh] host: 10.0.1.1 login: root'],
  ['$ sqlmap -u "http://target/api?id=1"', 'testing connection...', '[CRITICAL] injectable parameter'],
  ['$ msfconsole', 'msf6 > use exploit/multi/handler', 'msf6 > set LHOST 10.0.3.22', 'msf6 > exploit'],
];

export function hackerIdleBehavior(
  character: Character,
  entityManager: EntityManager,
): void {
  const nodes = entityManager.getAll().filter(
    (e): e is NetworkNode => e instanceof NetworkNode && e.status === 'online',
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
    const cmds = randomPick(HACKER_COMMANDS);
    character.setTask('침투 시도', '👾', cmds);
    character.setState(new WalkState(path, (c) => {
      c.setState(new AttackState(target.id));
    }));
  }
}
