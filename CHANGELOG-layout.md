# 동적 레이아웃 + 마인드맵 반응형 + 경계 시스템

## 최종 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/core/Camera.ts` | `baseScaleX/Y` 추가 — 축별 독립 스케일 지원 |
| `src/core/Game.ts` | `resizeToFit()` 전면 재작성 — 비균일 스케일 + 보정값 전파 |
| `src/world/World.ts` | `setSpriteScale()`, `drawBoundary()`, 2셀 경계벽 |
| `src/world/WorldLayout.ts` | 비례 기반 동적 레이아웃 + `ZONE_BOTTOM_EXTRA` |
| `src/characters/Character.ts` | 스프라이트 보정 + 하드 경계 클램핑 |
| `src/characters/CharacterManager.ts` | `setSpriteScale()` — 캐릭터 보정값 전파 |
| `src/characters/states/IdleState.ts` | 랜덤 보행 범위 경계 안쪽으로 제한 |
| `src/systems/SpawnSystem.ts` | 스폰 위치 경계 안쪽으로 조정 |

---

## 1. 마인드맵 반응형 스케일링

### 문제
기존 `resizeToFit()`은 `Math.min(scaleX, scaleY)` 균일 스케일을 사용했으나,
`Camera.update()`가 매 프레임 `this.target.scale.set(this.zoom)`으로 **오버라이드**하고 있었음.
결과적으로 리사이즈 스케일이 적용되지 않아 오브젝트가 캔버스 밖으로 나갔음.

### 해결: 축별 독립 스케일 + 스프라이트 보정

```
scaleX = canvasWidth / designWidth     ← 가로는 가로에 맞춤
scaleY = canvasHeight / designHeight   ← 세로는 세로에 맞춤
→ 캔버스를 빈틈 없이 채움 (마인드맵처럼)

uniformScale = min(scaleX, scaleY)
counterX = uniformScale / scaleX       ← 스프라이트 가로 보정
counterY = uniformScale / scaleY       ← 스프라이트 세로 보정
→ 스프라이트는 항상 정방형 유지 (찌그러짐 없음)
```

### 동작
- **브라우저 좁아짐** → scaleX↓ → 오브젝트 X 위치 압축, 경계 안으로 모임
- **브라우저 높이 줄어듦** → scaleY↓ → 오브젝트 Y 위치 압축
- **스프라이트 크기** → 항상 `uniformScale`로 일정
- **바닥·존·케이블** → 캔버스에 맞춰 자연스럽게 스트레치

### Camera.ts

```typescript
export class Camera {
  public baseScaleX = 1;  // resizeToFit에서 설정
  public baseScaleY = 1;

  update(): void {
    const sx = this.baseScaleX * this.zoom;
    const sy = this.baseScaleY * this.zoom;
    this.target.scale.set(sx, sy);  // 축별 독립 적용
  }
}
```

### Game.ts resizeToFit()

```typescript
// 축별 독립 스케일 → 캔버스 전체 채움
const psx = pw / PHYSICAL_CANVAS_WIDTH;
const psy = ph / PHYSICAL_CANVAS_HEIGHT;
this.physicalCamera.baseScaleX = psx;
this.physicalCamera.baseScaleY = psy;

// 스프라이트 보정
const pUniform = Math.min(psx, psy);
this.physicalWorld?.setSpriteScale(pUniform / psx, pUniform / psy);
this.characterManager?.setSpriteScale(pUniform / psx, pUniform / psy);
```

### 보정 적용 대상

| 대상 | 방법 |
|------|------|
| 노드 컨테이너 | `node.container.scale.set(cx, cy)` |
| 노드 라벨 | `labelLayer` 자식에 `scale.set(cx, cy)` |
| 캐릭터 | `character.container.scale.set(cx, cy)` |
| 바닥·존·케이블 | 보정 없음 (스트레치 의도) |

---

## 2. 경계 시스템 (4중 방어)

| 계층 | 위치 | 내용 |
|------|------|------|
| 시각적 경계선 | `World.drawBoundary()` | 캔버스 1셀 안쪽에 미세한 테두리 (0x1a3a5a, alpha 0.25) |
| 패스파인딩 벽 | `World.markWalls()` | 4면 2셀 깊이 non-walkable — A*가 경계 근처로 경로 안 잡음 |
| 픽셀 클램핑 | `Character.update()` | 매 프레임 스프라이트 전체가 경계 안에 머물도록 강제 |
| 스폰/이동 제한 | `SpawnSystem`, `IdleState` | 생성·이동 목표 자체가 안전 영역 내 |

### 클램핑 공식 (Character.ts)

```typescript
const BORDER = CELL_SIZE;      // 32px
const EXT_SIDE = 14;           // 스프라이트 좌우 offset
const EXT_TOP = 16;            // 머리 offset
const EXT_BOT = 14;            // 발끝 offset

// minX=46, maxX=722, minY=48, maxY=466
container.x = clamp(BORDER + EXT_SIDE, canvasW - BORDER - EXT_SIDE)
container.y = clamp(BORDER + EXT_TOP, canvasH - BORDER - EXT_BOT)
```

---

## 3. WorldLayout.ts — 비례 기반 동적 레이아웃

### 핵심: 하드코딩 → 비율 기반

존/노드를 0~1 비율로 정의, `resolveZones()`/`resolveNodes()`가 그리드 크기에 맞춰 자동 계산.

```typescript
interface NodeConfig {
  zone: string;      // ZoneConfig.name 참조
  slotX: number;     // zone 내부 X 위치 0~1
  slotY: number;     // zone 내부 Y 위치 0~1
}
```

### API (하위호환 유지)

```typescript
export function getLogicalLayout(): WorldLayoutConfig { ... }
export function getPhysicalLayout(): WorldLayoutConfig { ... }
```

---

## 검증

- `npx tsc --noEmit` — 에러 없음
- 브라우저 리사이즈 시 오브젝트가 경계 안으로 자연스럽게 압축
- 스프라이트 비율 왜곡 없음
- 캐릭터가 경계 밖으로 나가지 않음
