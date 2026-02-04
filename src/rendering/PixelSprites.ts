import { Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS, CELL_SIZE, NodeType, CharacterType } from '../constants';
import type { ServiceIcon, OSIcon, GroundType } from '../world/WorldLayout';

export type DecorationType = 'pub' | 'tree' | 'pond' | 'vending' | 'bench' | 'car' | 'coffee';
export type TileType = GroundType | 'path' | 'outdoor';
export type AmbientType = 'grassTuft' | 'flower' | 'smallStone' | 'oilStain' | 'vent' | 'weed' | 'crack';

export class PixelSprites {
  static createNode(type: NodeType, width: number, height: number): Graphics {
    const g = new Graphics();
    const w = width * CELL_SIZE;
    const h = height * CELL_SIZE;

    switch (type) {
      case 'server': return this.drawServer(g, w, h);
      case 'router': return this.drawRouter(g, w, h);
      case 'firewall': return this.drawFirewall(g, w, h);
      case 'switch': return this.drawSwitch(g, w, h);
      case 'database': return this.drawDatabase(g, w, h);
      case 'loadbalancer': return this.drawLoadBalancer(g, w, h);
      case 'monitorwall': return this.drawMonitorWall(g, w, h);
    }
  }

  // ======== 서비스 로고 아이콘 (논리 레이어 위에 오버레이) ========

  static createServiceIcon(icon: ServiceIcon, w: number, h: number): Graphics {
    const g = new Graphics();
    const cx = w / 2, cy = h / 2;

    switch (icon) {
      case 'nginx':
        // 초록 배경 + 흰색 N
        g.rect(cx - 14, cy - 14, 28, 28).fill(0x009639);
        g.rect(cx - 8, cy - 9, 4, 18).fill(0xffffff);
        g.rect(cx + 4, cy - 9, 4, 18).fill(0xffffff);
        g.rect(cx - 4, cy - 6, 4, 4).fill(0xffffff);
        g.rect(cx, cy - 2, 4, 4).fill(0xffffff);
        g.rect(cx - 4, cy + 2, 8, 4).fill(0xffffff);
        break;

      case 'spring':
        // 초록 원 + 잎사귀 모양
        g.circle(cx, cy, 13).fill(0x6db33f);
        g.circle(cx, cy, 10).fill(0x0b1018);
        g.rect(cx - 6, cy - 1, 12, 2).fill(0x6db33f);
        g.rect(cx - 1, cy - 6, 2, 12).fill(0x6db33f);
        break;

      case 'nodejs':
        // 녹색 육각형 스타일
        g.rect(cx - 12, cy - 14, 24, 28).fill(0x339933);
        g.rect(cx - 4, cy - 8, 3, 16).fill(0xffffff);
        g.rect(cx - 1, cy - 8, 6, 3).fill(0xffffff);
        g.rect(cx - 1, cy - 1, 4, 3).fill(0xffffff);
        break;

      case 'mysql':
        // 파랑 + 주황 돌고래 형태 단순화
        g.rect(cx - 14, cy - 12, 28, 24).fill(0x00618a);
        g.circle(cx - 2, cy - 2, 6).fill(0xf29111);
        g.rect(cx + 2, cy - 6, 6, 3).fill(0xf29111);
        break;

      case 'postgresql':
        // 파란 코끼리 단순화
        g.rect(cx - 14, cy - 12, 28, 24).fill(0x336791);
        g.circle(cx, cy - 2, 8).fill(0xffffff);
        g.rect(cx + 4, cy - 6, 4, 3).fill(0xffffff);
        g.circle(cx, cy - 2, 5).fill(0x336791);
        break;

      case 'redis':
        // 빨간 다이아몬드
        g.rect(cx - 14, cy - 12, 28, 24).fill(0xdc382d);
        // 별 모양 단순화
        g.rect(cx - 6, cy - 2, 12, 4).fill(0xffffff);
        g.rect(cx - 2, cy - 6, 4, 12).fill(0xffffff);
        break;

      case 'k8s':
        // 파란 원 + 조타 모양
        g.circle(cx, cy, 14).fill(0x326ce5);
        g.circle(cx, cy, 11).fill(0x0b1018);
        g.circle(cx, cy, 4).fill(0x326ce5);
        // 6개 방향 선
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60) * Math.PI / 180;
          const x2 = cx + Math.cos(angle) * 9;
          const y2 = cy + Math.sin(angle) * 9;
          g.rect(Math.min(cx, x2), Math.min(cy, y2),
            Math.abs(x2 - cx) || 2, Math.abs(y2 - cy) || 2).fill(0x326ce5);
        }
        break;

      case 'docker':
        // 파란 배경 + 고래 모양
        g.rect(cx - 14, cy - 12, 28, 24).fill(0x2496ed);
        // 컨테이너 박스들
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3; c++) {
            g.rect(cx - 9 + c * 7, cy - 6 + r * 6, 5, 4).fill(0xffffff);
          }
        }
        // 고래 몸체
        g.rect(cx - 12, cy + 4, 20, 4).fill(0xffffff);
        break;

      case 'prometheus':
        // 주황/빨간 불꽃
        g.circle(cx, cy, 13).fill(0xe6522c);
        g.circle(cx, cy, 9).fill(0x0b1018);
        g.rect(cx - 1, cy - 10, 2, 6).fill(0xe6522c);
        g.rect(cx - 5, cy + 4, 10, 3).fill(0xe6522c);
        break;

      case 'grafana':
        // 주황 그라데이션 원
        g.circle(cx, cy, 13).fill(0xf46800);
        g.circle(cx, cy, 9).fill(0x0b1018);
        // 그래프 선
        g.rect(cx - 6, cy, 3, 2).fill(0xf46800);
        g.rect(cx - 3, cy - 4, 3, 2).fill(0xf46800);
        g.rect(cx, cy - 2, 3, 2).fill(0xf46800);
        g.rect(cx + 3, cy - 6, 3, 2).fill(0xf46800);
        break;

      case 'cdn':
        // 글로브 아이콘
        g.circle(cx, cy, 13).fill(0x72b3e8);
        g.circle(cx, cy, 10).fill(0x0b1018);
        g.rect(cx - 1, cy - 10, 2, 20).fill(0x72b3e8);
        g.rect(cx - 10, cy - 1, 20, 2).fill(0x72b3e8);
        g.ellipse(cx, cy, 6, 10).stroke({ color: 0x72b3e8, width: 1.5 });
        break;

      case 'loadbalancer':
        // LB 아이콘 - 분산 화살표
        g.rect(cx - 14, cy - 12, 28, 24).fill(0x2a4a4a);
        g.rect(cx - 1, cy - 8, 2, 6).fill(0x56c4d9);
        g.rect(cx - 8, cy + 2, 6, 2).fill(0x56c4d9);
        g.rect(cx + 2, cy + 2, 6, 2).fill(0x56c4d9);
        g.rect(cx - 8, cy + 2, 2, 6).fill(0x56c4d9);
        g.rect(cx + 6, cy + 2, 2, 6).fill(0x56c4d9);
        break;

      default:
        g.rect(cx - 10, cy - 10, 20, 20).fill(0x4a4a6a);
    }
    return g;
  }

  // ======== OS 로고 (물리 레이어 서버 위에 오버레이) ========

  static createOSIcon(icon: OSIcon, w: number, h: number): Graphics {
    const g = new Graphics();
    const cx = w / 2, cy = h / 2;

    switch (icon) {
      case 'linux':
        // Tux 펭귄 단순화
        // 몸통 (검정)
        g.ellipse(cx, cy + 2, 10, 12).fill(0x1a1a1a);
        // 배 (흰색)
        g.ellipse(cx, cy + 4, 7, 8).fill(0xf0e68c);
        // 머리
        g.circle(cx, cy - 10, 7).fill(0x1a1a1a);
        // 눈 (흰 바탕 + 검은 눈동자)
        g.circle(cx - 3, cy - 11, 3).fill(0xffffff);
        g.circle(cx + 3, cy - 11, 3).fill(0xffffff);
        g.circle(cx - 3, cy - 11, 1.5).fill(0x1a1a1a);
        g.circle(cx + 3, cy - 11, 1.5).fill(0x1a1a1a);
        // 부리
        g.rect(cx - 2, cy - 8, 4, 3).fill(0xf0a030);
        // 발
        g.rect(cx - 8, cy + 12, 6, 2).fill(0xf0a030);
        g.rect(cx + 2, cy + 12, 6, 2).fill(0xf0a030);
        break;

      case 'ubuntu':
        // Ubuntu 원형 로고
        g.circle(cx, cy, 13).fill(0xe95420);
        g.circle(cx, cy, 8).fill(0x0b1018);
        // 3개 원
        g.circle(cx, cy - 8, 3).fill(0xffffff);
        g.circle(cx - 7, cy + 4, 3).fill(0xffffff);
        g.circle(cx + 7, cy + 4, 3).fill(0xffffff);
        break;

      case 'centos':
        // CentOS 4색 사각형
        g.rect(cx - 12, cy - 12, 11, 11).fill(0x932279);
        g.rect(cx + 1, cy - 12, 11, 11).fill(0xefa724);
        g.rect(cx - 12, cy + 1, 11, 11).fill(0x9ccd2a);
        g.rect(cx + 1, cy + 1, 11, 11).fill(0x262577);
        // 중앙 다이아몬드
        g.rect(cx - 4, cy - 4, 8, 8).fill(0xffffff);
        break;

      case 'windows':
        // Windows 4색 창문
        g.rect(cx - 12, cy - 12, 24, 24).fill(0x00a4ef);
        g.rect(cx - 10, cy - 10, 9, 9).fill(0xf25022);
        g.rect(cx + 1, cy - 10, 9, 9).fill(0x7fba00);
        g.rect(cx - 10, cy + 1, 9, 9).fill(0x00a4ef);
        g.rect(cx + 1, cy + 1, 9, 9).fill(0xffb900);
        break;
    }
    return g;
  }

  // ======== 바닥 타일 & 소형 장식 ========

  /** 셀 하나의 바닥 타일을 Graphics에 그린다 */
  static drawGroundTile(g: Graphics, x: number, y: number, type: TileType, variation: number): void {
    const cs = CELL_SIZE;
    const palette = this.getTilePalette(type);
    const baseColor = palette[variation % palette.length];

    // 셀 전체 fill
    g.rect(x, y, cs, cs).fill(baseColor);

    // 타입별 텍스처 디테일
    switch (type) {
      case 'serverFloor': {
        // 4px 격자 선
        g.rect(x, y, cs, 1).fill({ color: 0x222230, alpha: 0.4 });
        g.rect(x, y, 1, cs).fill({ color: 0x222230, alpha: 0.4 });
        // 작은 볼트 마크
        if (variation % 3 === 0) {
          g.rect(x + 4, y + 4, 2, 2).fill({ color: 0x404050, alpha: 0.5 });
          g.rect(x + cs - 6, y + cs - 6, 2, 2).fill({ color: 0x404050, alpha: 0.5 });
        }
        break;
      }
      case 'grass': {
        // 풀 결 — 미세한 밝은 줄
        const offset = (variation * 3) % 7;
        g.rect(x + offset, y + 2, 1, cs - 4).fill({ color: 0x4a9a4a, alpha: 0.3 });
        g.rect(x + offset + 8, y + 4, 1, cs - 8).fill({ color: 0x3a8a3a, alpha: 0.2 });
        g.rect(x + offset + 16, y + 1, 1, cs - 2).fill({ color: 0x5aaa5a, alpha: 0.25 });
        break;
      }
      case 'wood': {
        // 나무결 — 가로 줄
        g.rect(x, y + 6, cs, 1).fill({ color: 0x4a3a1a, alpha: 0.3 });
        g.rect(x, y + 14, cs, 1).fill({ color: 0x4a3a1a, alpha: 0.25 });
        g.rect(x, y + 22, cs, 1).fill({ color: 0x4a3a1a, alpha: 0.2 });
        if (variation % 2 === 0) {
          g.rect(x + 10, y + 8, 4, 1).fill({ color: 0x6a5a3a, alpha: 0.3 });
        }
        break;
      }
      case 'asphalt': {
        // 아스팔트 — 거친 점 텍스처
        if (variation % 2 === 0) {
          g.rect(x + 5, y + 8, 2, 1).fill({ color: 0x4a4a50, alpha: 0.4 });
          g.rect(x + 18, y + 20, 2, 1).fill({ color: 0x4a4a50, alpha: 0.3 });
        }
        break;
      }
      case 'carpet': {
        // 카펫 — 미세한 체크 패턴
        if ((variation + 1) % 2 === 0) {
          g.rect(x, y, cs / 2, cs / 2).fill({ color: 0x3e3a50, alpha: 0.15 });
          g.rect(x + cs / 2, y + cs / 2, cs / 2, cs / 2).fill({ color: 0x3e3a50, alpha: 0.15 });
        }
        break;
      }
      case 'path': {
        // 돌길 — 셀 내 작은 돌 rect
        g.rect(x + 2, y + 3, 10, 8).fill({ color: 0x9a8a6a, alpha: 0.5 });
        g.rect(x + 14, y + 12, 12, 9).fill({ color: 0x8a7a5a, alpha: 0.4 });
        g.rect(x + 4, y + 18, 8, 10).fill({ color: 0x7a6a4a, alpha: 0.45 });
        // 돌 사이 틈
        g.rect(x + 12, y + 2, 2, cs - 4).fill({ color: 0x5a5a3a, alpha: 0.3 });
        g.rect(x + 2, y + 11, cs - 4, 1).fill({ color: 0x5a5a3a, alpha: 0.3 });
        break;
      }
      case 'outdoor': {
        // 야외 잔디 — grass보다 어두운 톤 + 간단한 줄
        const off = (variation * 5) % 9;
        g.rect(x + off, y + 3, 1, cs - 6).fill({ color: 0x3a6a3a, alpha: 0.25 });
        g.rect(x + off + 12, y + 5, 1, cs - 10).fill({ color: 0x2a5a2a, alpha: 0.2 });
        break;
      }
    }
  }

  /** 소형 장식을 Graphics에 추가 */
  static drawAmbientSprite(g: Graphics, x: number, y: number, type: AmbientType, seed: number): void {
    switch (type) {
      case 'grassTuft': {
        const greens = [0x3a8a3a, 0x4a9a4a, 0x2a7a2a];
        const c = greens[seed % 3];
        g.rect(x + 2, y + 4, 2, 6).fill(c);
        g.rect(x + 5, y + 2, 2, 8).fill(c);
        g.rect(x + 8, y + 5, 2, 5).fill(c);
        break;
      }
      case 'flower': {
        const colors = [0xff4a4a, 0xffaa4a, 0xaa4aff, 0xff6aaa, 0xffff4a];
        const fc = colors[seed % 5];
        // 줄기
        g.rect(x + 4, y + 5, 1, 5).fill(0x3a7a3a);
        // 꽃잎
        g.rect(x + 2, y + 2, 3, 3).fill(fc);
        g.rect(x + 5, y + 2, 3, 3).fill(fc);
        g.rect(x + 3, y + 0, 3, 3).fill(fc);
        // 중심
        g.rect(x + 4, y + 3, 2, 2).fill(0xffee44);
        break;
      }
      case 'smallStone': {
        const grays = [0x6a6a6a, 0x7a7a7a, 0x5a5a5a];
        const sc = grays[seed % 3];
        g.rect(x + 2, y + 4, 6, 4).fill(sc);
        g.rect(x + 3, y + 3, 4, 6).fill(sc);
        // 하이라이트
        g.rect(x + 3, y + 4, 2, 1).fill({ color: 0xaaaaaa, alpha: 0.4 });
        break;
      }
      case 'oilStain': {
        g.circle(x + 5, y + 5, 4).fill({ color: 0x1a1a1a, alpha: 0.3 });
        g.circle(x + 6, y + 4, 2).fill({ color: 0x2a1a3a, alpha: 0.25 });
        break;
      }
      case 'vent': {
        g.rect(x + 1, y + 2, 8, 6).fill(0x222230);
        // 슬릿
        g.rect(x + 2, y + 3, 6, 1).fill(0x1a1a20);
        g.rect(x + 2, y + 5, 6, 1).fill(0x1a1a20);
        g.rect(x + 2, y + 7, 6, 1).fill(0x1a1a20);
        break;
      }
      case 'weed': {
        g.rect(x + 3, y + 3, 1, 7).fill(0x4a7a3a);
        g.rect(x + 6, y + 5, 1, 5).fill(0x3a6a2a);
        g.rect(x + 4, y + 2, 2, 2).fill(0x5a8a4a);
        break;
      }
      case 'crack': {
        g.rect(x + 2, y + 3, 6, 1).fill({ color: 0x2a2a2a, alpha: 0.4 });
        g.rect(x + 6, y + 3, 1, 4).fill({ color: 0x2a2a2a, alpha: 0.35 });
        g.rect(x + 3, y + 6, 4, 1).fill({ color: 0x2a2a2a, alpha: 0.3 });
        break;
      }
    }
  }

  private static getTilePalette(type: TileType): readonly number[] {
    switch (type) {
      case 'serverFloor': return COLORS.GROUND_SERVER;
      case 'grass': return COLORS.GROUND_GRASS;
      case 'wood': return COLORS.GROUND_WOOD;
      case 'asphalt': return COLORS.GROUND_ASPHALT;
      case 'carpet': return COLORS.GROUND_CARPET;
      case 'path': return COLORS.GROUND_PATH;
      case 'outdoor': return COLORS.GROUND_OUTDOOR;
    }
  }

  // ======== 데코레이션 스프라이트 ========

  static createDecoration(type: DecorationType): Graphics {
    const g = new Graphics();
    const cs = CELL_SIZE;

    switch (type) {
      case 'pub':
        return this.drawPub(g, cs);
      case 'tree':
        return this.drawTree(g, cs);
      case 'pond':
        return this.drawPond(g, cs);
      case 'vending':
        return this.drawVending(g, cs);
      case 'bench':
        return this.drawBench(g, cs);
      case 'car':
        return this.drawCar(g, cs);
      case 'coffee':
        return this.drawCoffee(g, cs);
    }
  }

  // ── Pub (4×3 cells): 갈색 벽, 빨간 지붕, 문, 맥주잔 간판, 따뜻한 창문
  private static drawPub(g: Graphics, cs: number): Graphics {
    const w = 4 * cs, h = 3 * cs;
    // 벽
    g.rect(2, cs * 0.6, w - 4, h - cs * 0.6 - 2).fill(0x5a3a1a);
    // 지붕
    g.moveTo(0, cs * 0.6).lineTo(w / 2, 0).lineTo(w, cs * 0.6).closePath().fill(0xaa2222);
    g.moveTo(2, cs * 0.6).lineTo(w / 2, 2).lineTo(w - 2, cs * 0.6).closePath().fill(0xcc3333);
    // 문
    g.rect(w / 2 - 8, h - 24, 16, 22).fill(0x3a2a0a);
    g.rect(w / 2 - 6, h - 22, 12, 18).fill(0x4a3a1a);
    g.circle(w / 2 + 3, h - 12, 2).fill(0xdaa520);
    // 창문 (따뜻한 빛)
    g.rect(12, cs * 0.8 + 4, 18, 14).fill(0xffdd66);
    g.rect(14, cs * 0.8 + 6, 6, 10).fill(0xffee88);
    g.rect(22, cs * 0.8 + 6, 6, 10).fill(0xffee88);
    g.rect(w - 30, cs * 0.8 + 4, 18, 14).fill(0xffdd66);
    g.rect(w - 28, cs * 0.8 + 6, 6, 10).fill(0xffee88);
    g.rect(w - 20, cs * 0.8 + 6, 6, 10).fill(0xffee88);
    // 맥주잔 간판
    g.rect(w / 2 - 10, cs * 0.3, 20, 12).fill(0x2a1a0a);
    g.rect(w / 2 - 4, cs * 0.3 + 2, 8, 8).fill(0xf0c040);
    g.rect(w / 2 + 4, cs * 0.3 + 4, 3, 4).fill(0xf0c040);
    return g;
  }

  // ── Tree (1×1 cell): 갈색 줄기 + 초록 수관
  private static drawTree(g: Graphics, cs: number): Graphics {
    // 줄기
    g.rect(cs / 2 - 3, cs / 2, 6, cs / 2 - 2).fill(0x5a3a1a);
    // 수관
    g.circle(cs / 2, cs / 3, 12).fill(0x2a6a2a);
    g.circle(cs / 2 - 6, cs / 3 + 4, 8).fill(0x1a5a1a);
    g.circle(cs / 2 + 6, cs / 3 + 4, 8).fill(0x3a7a3a);
    return g;
  }

  // ── Pond (2×1 cells): 파란 타원 + 반짝임
  private static drawPond(g: Graphics, cs: number): Graphics {
    const w = 2 * cs;
    g.ellipse(w / 2, cs / 2, w / 2 - 4, cs / 2 - 4).fill(0x1a4a7a);
    g.ellipse(w / 2, cs / 2, w / 2 - 8, cs / 2 - 8).fill(0x2a6aaa);
    // 반짝임
    g.rect(w / 2 - 8, cs / 2 - 4, 4, 2).fill({ color: 0xaaddff, alpha: 0.6 });
    g.rect(w / 2 + 6, cs / 2 + 2, 3, 2).fill({ color: 0xaaddff, alpha: 0.5 });
    g.rect(w / 2 - 2, cs / 2 - 1, 2, 1).fill({ color: 0xffffff, alpha: 0.4 });
    return g;
  }

  // ── Vending (1×1 cell): 음료 진열 + 동전구
  private static drawVending(g: Graphics, cs: number): Graphics {
    // 본체
    g.rect(4, 2, cs - 8, cs - 4).fill(0x2a3a6a);
    g.rect(6, 4, cs - 12, cs - 10).fill(0x1a2a4a);
    // 음료 진열
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const colors = [0xff4a4a, 0x4aff6e, 0x60a0e8, 0xffaa4a, 0xff4aff, 0xffff4a, 0x50e0d8, 0xff6a3a, 0xaaff4a];
        g.rect(8 + c * 6, 6 + r * 6, 4, 4).fill(colors[r * 3 + c]);
      }
    }
    // 동전구
    g.circle(cs / 2, cs - 8, 3).fill(0x4a4a4a);
    g.circle(cs / 2, cs - 8, 1.5).fill(0x8a8a8a);
    return g;
  }

  // ── Bench (2×1 cells): 벤치
  private static drawBench(g: Graphics, cs: number): Graphics {
    const w = 2 * cs;
    // 좌석
    g.rect(6, cs / 2 - 4, w - 12, 6).fill(0x6a4a2a);
    g.rect(8, cs / 2 - 2, w - 16, 2).fill(0x8a6a4a);
    // 등받이
    g.rect(6, cs / 2 - 12, w - 12, 4).fill(0x6a4a2a);
    g.rect(8, cs / 2 - 10, w - 16, 2).fill(0x8a6a4a);
    // 다리
    g.rect(10, cs / 2 + 2, 4, 10).fill(0x4a4a4a);
    g.rect(w - 14, cs / 2 + 2, 4, 10).fill(0x4a4a4a);
    return g;
  }

  // ── Car (2×1 cells): 차량 측면도 - 차체 + 바퀴 + 유리
  private static drawCar(g: Graphics, cs: number): Graphics {
    const w = 2 * cs;
    // 차체 하단
    g.roundRect(4, cs / 2 - 2, w - 8, cs / 2 - 6, 3).fill(0x3a5a8a);
    // 차체 상단 (캐빈)
    g.roundRect(w / 4, 4, w / 2, cs / 2 - 4, 3).fill(0x3a5a8a);
    // 유리
    g.rect(w / 4 + 3, 7, w / 4 - 4, cs / 2 - 10).fill(0x7abaee);
    g.rect(w / 2 + 1, 7, w / 4 - 4, cs / 2 - 10).fill(0x7abaee);
    // 바퀴
    g.circle(16, cs - 6, 6).fill(0x1a1a1a);
    g.circle(16, cs - 6, 3).fill(0x4a4a4a);
    g.circle(w - 16, cs - 6, 6).fill(0x1a1a1a);
    g.circle(w - 16, cs - 6, 3).fill(0x4a4a4a);
    // 헤드라이트
    g.rect(w - 8, cs / 2, 4, 4).fill(0xffee88);
    // 테일라이트
    g.rect(4, cs / 2, 4, 4).fill(0xff4a4a);
    return g;
  }

  // ── Coffee (1×1 cell): 커피머신
  private static drawCoffee(g: Graphics, cs: number): Graphics {
    // 본체
    g.rect(6, 4, cs - 12, cs - 8).fill(0x3a3a3a);
    g.rect(8, 6, cs - 16, cs - 14).fill(0x2a2a2a);
    // 컵 받침
    g.rect(cs / 2 - 6, cs - 10, 12, 4).fill(0x4a4a4a);
    // 컵
    g.rect(cs / 2 - 4, cs - 16, 8, 10).fill(0xffffff);
    g.rect(cs / 2 - 3, cs - 14, 6, 6).fill(0x5a3a1a);
    // 버튼
    g.circle(cs / 2 - 4, 10, 2).fill(0x61c777);
    g.circle(cs / 2 + 4, 10, 2).fill(0xe06468);
    // 증기
    g.rect(cs / 2 - 2, cs - 20, 1, 3).fill({ color: 0xffffff, alpha: 0.3 });
    g.rect(cs / 2 + 1, cs - 22, 1, 4).fill({ color: 0xffffff, alpha: 0.25 });
    return g;
  }

  // ======== 기본 노드 ========

  private static drawServer(g: Graphics, w: number, h: number): Graphics {
    g.rect(4, 4, w - 8, h - 8).fill(COLORS.SERVER_BODY);
    g.rect(4, 4, w - 8, 4).fill(0x3a4a6c);
    for (let i = 0; i < 3; i++) {
      const y = 12 + i * 14;
      g.rect(8, y, w - 16, 10).fill(0x1a2a4c);
      g.rect(w - 16, y + 3, 4, 4).fill(COLORS.SERVER_LIGHT);
    }
    for (let x = 8; x < w - 12; x += 6) {
      g.rect(x, h - 12, 4, 2).fill(0x202a3c);
    }
    return g;
  }

  private static drawRouter(g: Graphics, w: number, h: number): Graphics {
    g.rect(4, 8, w - 8, h - 16).fill(COLORS.ROUTER_BODY);
    g.rect(12, 4, 3, 8).fill(0x5a6a5c);
    g.rect(w - 15, 4, 3, 8).fill(0x5a6a5c);
    for (let i = 0; i < 4; i++) {
      const x = 10 + i * ((w - 24) / 4);
      g.rect(x, h / 2 - 3, 8, 6).fill(0x1a2a1c);
    }
    g.rect(10, h - 14, 4, 4).fill(COLORS.ROUTER_LIGHT);
    g.rect(18, h - 14, 4, 4).fill(COLORS.ROUTER_LIGHT);
    return g;
  }

  private static drawFirewall(g: Graphics, w: number, h: number): Graphics {
    g.rect(2, 2, w - 4, h - 4).fill(COLORS.FIREWALL_BODY);
    for (let x = 4; x < w - 8; x += 12) {
      g.rect(x, 4, 6, 4).fill(0xffaa4a);
    }
    const cx = w / 2, cy = h / 2;
    g.rect(cx - 8, cy - 6, 16, 14).fill(0x7c3a3a);
    g.rect(cx - 6, cy - 4, 12, 10).fill(0x4c2a2a);
    g.rect(cx - 2, cy - 2, 4, 6).fill(COLORS.FIREWALL_LIGHT);
    g.rect(8, h - 10, 4, 4).fill(COLORS.FIREWALL_LIGHT);
    return g;
  }

  private static drawSwitch(g: Graphics, w: number, h: number): Graphics {
    g.rect(4, 4, w - 8, h - 8).fill(COLORS.SWITCH_BODY);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 6; col++) {
        const x = 8 + col * ((w - 20) / 6);
        const y = 10 + row * 8;
        g.rect(x, y, 6, 5).fill(0x1a1a3c);
      }
    }
    g.rect(w - 14, h - 10, 4, 4).fill(COLORS.SWITCH_LIGHT);
    return g;
  }

  private static drawDatabase(g: Graphics, w: number, h: number): Graphics {
    g.rect(6, 8, w - 12, h - 12).fill(COLORS.DATABASE_BODY);
    g.rect(6, 6, w - 12, 8).fill(0x5a4a3a);
    for (let i = 0; i < 3; i++) {
      const y = 18 + i * 10;
      g.rect(10, y, w - 20, 2).fill(0x6a5a4a);
    }
    g.rect(10, h - 10, 4, 4).fill(COLORS.DATABASE_LIGHT);
    return g;
  }

  private static drawLoadBalancer(g: Graphics, w: number, h: number): Graphics {
    g.rect(4, 6, w - 8, h - 12).fill(COLORS.LOADBALANCER_BODY);
    const cx = w / 2;
    g.rect(cx - 2, 12, 4, 10).fill(COLORS.LOADBALANCER_LIGHT);
    g.rect(cx - 10, 22, 8, 3).fill(COLORS.LOADBALANCER_LIGHT);
    g.rect(cx + 2, 22, 8, 3).fill(COLORS.LOADBALANCER_LIGHT);
    g.rect(10, h - 12, 4, 4).fill(COLORS.LOADBALANCER_LIGHT);
    g.rect(18, h - 12, 4, 4).fill(COLORS.LOADBALANCER_LIGHT);
    return g;
  }

  private static drawMonitorWall(g: Graphics, w: number, h: number): Graphics {
    g.rect(2, 2, w - 4, h - 4).fill(COLORS.MONITOR_BODY);
    const sw = (w - 16) / 2;
    const sh = (h - 16) / 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const sx = 6 + col * (sw + 4);
        const sy = 6 + row * (sh + 4);
        g.rect(sx, sy, sw, sh).fill(COLORS.MONITOR_SCREEN);
        g.rect(sx + 2, sy + sh / 2, sw - 4, 1).fill(0x0a5a3a);
        g.rect(sx + 4, sy + 4, 3, 3).fill(COLORS.STATUS_OK);
      }
    }
    return g;
  }

  // ======== 라벨 텍스트 ========

  static createLabel(text: string, color = 0x606878, size = 11): Text {
    return new Text({
      text,
      style: new TextStyle({
        fontSize: size,
        fontFamily: 'Courier New, monospace',
        fill: color,
      }),
      resolution: Math.max(2, window.devicePixelRatio || 1),
    });
  }

  // ======== 캐릭터 ========

  static createCharacter(type: CharacterType): Graphics {
    const g = new Graphics();
    const color = this.getCharacterColor(type);
    const skin = 0xf0c8a0;
    const dark = this.darkenColor(color);

    g.ellipse(0, 10, 7, 3).fill({ color: 0x000000, alpha: 0.25 });
    g.rect(-5, 5, 4, 6).fill(0x2a2a3a);
    g.rect(1, 5, 4, 6).fill(0x2a2a3a);
    g.rect(-6, 10, 5, 2).fill(0x1a1a2a);
    g.rect(1, 10, 5, 2).fill(0x1a1a2a);
    g.rect(-6, -4, 12, 10).fill(color);
    g.rect(-4, -4, 8, 3).fill(this.lightenColor(color));
    g.rect(-9, -3, 4, 8).fill(color);
    g.rect(5, -3, 4, 8).fill(color);
    g.rect(-9, 4, 4, 3).fill(skin);
    g.rect(5, 4, 4, 3).fill(skin);
    g.rect(-5, -14, 10, 11).fill(skin);
    g.rect(-6, -16, 12, 5).fill(dark);
    g.rect(-6, -14, 2, 4).fill(dark);
    g.rect(4, -14, 2, 4).fill(dark);
    g.rect(-3, -10, 2, 2).fill(0x1a1a2a);
    g.rect(1, -10, 2, 2).fill(0x1a1a2a);

    switch (type) {
      case 'engineer':
        g.rect(-7, -13, 2, 6).fill(0x606878);
        g.rect(5, -13, 2, 6).fill(0x606878);
        g.rect(-7, -14, 14, 2).fill(0x606878);
        break;
      case 'manager':
        g.rect(-1, -3, 2, 8).fill(0xff4a6a);
        break;
      case 'janitor':
        g.rect(7, -2, 2, 14).fill(0x8a7a5a);
        g.rect(4, 10, 8, 3).fill(0xaaaaaa);
        break;
      case 'newbie':
        g.rect(-6, -17, 12, 3).fill(COLORS.NEWBIE_COLOR);
        g.rect(-8, -15, 4, 2).fill(COLORS.NEWBIE_COLOR);
        break;
      case 'hacker':
        g.rect(-7, -16, 14, 4).fill(0x2a2a2a);
        g.rect(-6, -14, 2, 8).fill(0x2a2a2a);
        g.rect(4, -14, 2, 8).fill(0x2a2a2a);
        break;
    }
    return g;
  }

  static createPacket(color: number = COLORS.PACKET_DATA): Graphics {
    const g = new Graphics();
    g.rect(-3, -3, 6, 6).fill(color);
    return g;
  }

  private static getCharacterColor(type: CharacterType): number {
    switch (type) {
      case 'engineer': return COLORS.ENGINEER_COLOR;
      case 'hacker': return COLORS.HACKER_COLOR;
      case 'janitor': return COLORS.JANITOR_COLOR;
      case 'newbie': return COLORS.NEWBIE_COLOR;
      case 'manager': return COLORS.MANAGER_COLOR;
    }
  }

  private static lightenColor(color: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + 40);
    const gc = Math.min(255, ((color >> 8) & 0xff) + 40);
    const b = Math.min(255, (color & 0xff) + 40);
    return (r << 16) | (gc << 8) | b;
  }

  private static darkenColor(color: number): number {
    const r = Math.max(0, ((color >> 16) & 0xff) - 60);
    const gc = Math.max(0, ((color >> 8) & 0xff) - 60);
    const b = Math.max(0, (color & 0xff) - 60);
    return (r << 16) | (gc << 8) | b;
  }
}
