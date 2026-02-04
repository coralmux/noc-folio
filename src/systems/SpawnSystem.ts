import { CharacterManager } from '../characters/CharacterManager';
import { PanicState } from '../characters/states/PanicState';
import { EventBus } from '../core/EventBus';
import { randomPick, randomChance, randomInt } from '../utils/random';
import { GRID_COLS, PHYSICAL_ROWS } from '../constants';
import { getPubZoneBounds } from '../world/WorldLayout';

export class SpawnSystem {
  private characterManager: CharacterManager;
  private eventBus: EventBus;
  private elapsed = 0;
  private hackerTimer = 0;

  constructor(characterManager: CharacterManager, eventBus: EventBus) {
    this.characterManager = characterManager;
    this.eventBus = eventBus;

    // Despawn hackers after they panic
    this.eventBus.on('character:stateChange', ({ characterId, to }) => {
      const ch = this.characterManager.getById(characterId);
      if (ch && ch.type === 'hacker' && to === 'idle') {
        // Hacker has finished panicking, despawn after a short delay
        setTimeout(() => {
          this.characterManager.despawn(characterId);
        }, 1500);
      }
    });

    // Manager panics on incidents
    this.eventBus.on('incident:start', () => {
      const managers = this.characterManager.getByType('manager');
      for (const mgr of managers) {
        if (mgr.currentStateName !== 'panic') {
          mgr.setState(new PanicState(3.0));
        }
      }
    });
  }

  update(delta: number): void {
    this.elapsed += delta;
    this.hackerTimer += delta;

    // Every 10 seconds, consider spawning characters
    if (this.elapsed >= 10) {
      this.elapsed = 0;

      const all = this.characterManager.getAll();
      const engineers = all.filter(c => c.type === 'engineer');
      const janitors = all.filter(c => c.type === 'janitor');
      const newbies = all.filter(c => c.type === 'newbie');
      const managers = all.filter(c => c.type === 'manager');

      // Maintain minimum populations — spawn in Pub zone
      if (engineers.length < 3) {
        this.spawnInPub('engineer');
      }
      if (janitors.length < 1 && randomChance(0.5)) {
        this.spawnInPub('janitor');
      }
      if (newbies.length < 1 && randomChance(0.3)) {
        this.spawnInPub('newbie');
      }
      if (managers.length < 1 && randomChance(0.4)) {
        this.spawnInPub('manager');
      }
    }

    // Hackers spawn less frequently — still at edge (sneaking in)
    if (this.hackerTimer >= 30) {
      this.hackerTimer = 0;
      if (randomChance(0.3)) {
        const hackers = this.characterManager.getByType('hacker');
        if (hackers.length < 1) {
          this.spawnAtEdge('hacker');
        }
      }
    }
  }

  private spawnInPub(type: 'engineer' | 'janitor' | 'newbie' | 'manager'): void {
    const pub = getPubZoneBounds();
    const col = randomInt(pub.col + 1, pub.col + pub.width - 2);
    const row = randomInt(pub.row + 1, pub.row + pub.height - 2);
    this.characterManager.spawn(type, col, row);
  }

  private spawnAtEdge(type: 'engineer' | 'hacker' | 'janitor' | 'newbie' | 'manager'): void {
    // 2셀 경계 안쪽에서 스폰 — 경계 밖으로 나가지 않도록
    const edges = [
      { col: 2, row: randomInt(3, PHYSICAL_ROWS - 4) },
      { col: GRID_COLS - 3, row: randomInt(3, PHYSICAL_ROWS - 4) },
      { col: randomInt(3, GRID_COLS - 4), row: PHYSICAL_ROWS - 3 },
    ];
    const pos = randomPick(edges);
    this.characterManager.spawn(type, pos.col, pos.row);
  }
}
