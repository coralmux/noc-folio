import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
import { writeFileSync } from 'fs';

const INPUT = '/Users/gold/jupyter/커리어/my.jpg';
const SIZE = 64;
const PALETTE_SIZE = 24;
const OUT = '/private/tmp/claude-501/-Users-gold-jupyter----/b2c55fbf-f7a9-4717-bacd-7ef7fcc9ca77/scratchpad';

async function main() {
  const meta = await sharp(INPUT).metadata();
  const w = meta.width, h = meta.height;
  console.log(`Original: ${w}x${h}`);

  // ── 1) FACE-CENTERED CROP ──
  const cropW = Math.round(w * 0.55);
  const cropH = cropW;
  const cropLeft = Math.round((w - cropW) / 2);
  const cropTop = Math.round(h * 0.03);

  console.log(`Crop: ${cropW}x${cropH} at (${cropLeft}, ${cropTop})`);

  const { data, info } = await sharp(INPUT)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(SIZE, SIZE, { kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`Resized: ${info.width}x${info.height}, ch=${info.channels}`);

  // ── 2) Read all pixels ──
  const pixels = [];
  for (let y = 0; y < SIZE; y++) {
    const row = [];
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * info.channels;
      row.push([data[idx], data[idx+1], data[idx+2]]);
    }
    pixels.push(row);
  }

  // ── 3) CONTRAST ENHANCEMENT ──
  // Collect luminance stats for foreground pixels first (pre-bg-detection)
  // Then stretch contrast to make dark features (eyes, brows) pop
  const allLum = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const [r,g,b] = pixels[y][x];
      allLum.push(0.299*r + 0.587*g + 0.114*b);
    }
  allLum.sort((a,b) => a-b);
  const lumLo = allLum[Math.floor(allLum.length * 0.02)];
  const lumHi = allLum[Math.floor(allLum.length * 0.98)];
  const lumRange = lumHi - lumLo || 1;
  console.log(`Luminance range: ${lumLo.toFixed(0)}-${lumHi.toFixed(0)}`);

  // Apply contrast stretch + slight boost
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const [r,g,b] = pixels[y][x];
      const stretch = (v) => {
        let n = (v - lumLo) / lumRange;
        n = Math.max(0, Math.min(1, n));           // clamp to 0..1
        n = Math.pow(n, 1.15);                     // slight gamma darken
        return Math.max(0, Math.min(255, Math.round(n * 255)));
      };
      pixels[y][x] = [stretch(r), stretch(g), stretch(b)];
    }
  }

  // ── 4) FLOOD-FILL background from edges ──
  const isBright = (r, g, b) => {
    const brightness = (r + g + b) / 3;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    return brightness > 210 && sat < 45;
  };

  const bg = Array.from({length: SIZE}, () => new Uint8Array(SIZE));
  const queue = [];

  for (let x = 0; x < SIZE; x++) {
    for (const y of [0, SIZE-1]) {
      const [r,g,b] = pixels[y][x];
      if (isBright(r,g,b)) { bg[y][x] = 1; queue.push([x,y]); }
    }
  }
  for (let y = 0; y < SIZE; y++) {
    for (const x of [0, SIZE-1]) {
      const [r,g,b] = pixels[y][x];
      if (isBright(r,g,b) && !bg[y][x]) { bg[y][x] = 1; queue.push([x,y]); }
    }
  }

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nx = cx+dx, ny = cy+dy;
      if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue;
      if (bg[ny][nx]) continue;
      const [r,g,b] = pixels[ny][nx];
      if (isBright(r,g,b)) {
        bg[ny][nx] = 1;
        queue.push([nx, ny]);
      }
    }
  }

  let bgCount = 0, fgCount = 0;
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      bg[y][x] ? bgCount++ : fgCount++;
  console.log(`Foreground: ${fgCount}, Background: ${bgCount}`);

  // ── 5) K-means clustering for ${PALETTE_SIZE} colors ──
  // Collect foreground pixels
  const fgPixels = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (!bg[y][x]) fgPixels.push(pixels[y][x]);

  // Initialize centroids using k-means++ style
  const centroids = [];
  // First centroid: darkest pixel (ensures dark features like eyes get a color)
  const sorted = [...fgPixels].sort((a,b) => (a[0]+a[1]+a[2]) - (b[0]+b[1]+b[2]));
  centroids.push([...sorted[0]]);
  // Add remaining centroids with maximin strategy
  while (centroids.length < PALETTE_SIZE) {
    let bestPx = null, bestDist = -1;
    for (const px of fgPixels) {
      let minD = Infinity;
      for (const c of centroids) {
        const dr = px[0]-c[0], dg = px[1]-c[1], db = px[2]-c[2];
        const d = dr*dr*2 + dg*dg*4 + db*db;
        if (d < minD) minD = d;
      }
      if (minD > bestDist) { bestDist = minD; bestPx = px; }
    }
    centroids.push([...bestPx]);
  }

  // Run k-means iterations
  for (let iter = 0; iter < 20; iter++) {
    const sums = centroids.map(() => [0,0,0]);
    const counts = centroids.map(() => 0);

    for (const px of fgPixels) {
      let bestI = 0, bestD = Infinity;
      for (let i = 0; i < centroids.length; i++) {
        const dr = px[0]-centroids[i][0], dg = px[1]-centroids[i][1], db = px[2]-centroids[i][2];
        const d = dr*dr*2 + dg*dg*4 + db*db;
        if (d < bestD) { bestD = d; bestI = i; }
      }
      sums[bestI][0] += px[0]; sums[bestI][1] += px[1]; sums[bestI][2] += px[2];
      counts[bestI]++;
    }

    let moved = 0;
    for (let i = 0; i < centroids.length; i++) {
      if (counts[i] === 0) continue;
      const nr = Math.round(sums[i][0]/counts[i]);
      const ng = Math.round(sums[i][1]/counts[i]);
      const nb = Math.round(sums[i][2]/counts[i]);
      if (nr !== centroids[i][0] || ng !== centroids[i][1] || nb !== centroids[i][2]) moved++;
      centroids[i] = [nr, ng, nb];
    }
    if (moved === 0) { console.log(`K-means converged at iter ${iter}`); break; }
  }

  // Sort palette by luminance (dark → light)
  const palette = centroids.map((c,i) => ({ r: c[0], g: c[1], b: c[2], idx: i }));
  palette.sort((a,b) => (0.299*a.r+0.587*a.g+0.114*a.b) - (0.299*b.r+0.587*b.g+0.114*b.b));
  // Create remap table: old index → new sorted index
  const remap = new Array(PALETTE_SIZE);
  palette.forEach((p, newIdx) => { remap[p.idx] = newIdx; });

  console.log(`Palette (${palette.length} colors):`);
  for (const p of palette) {
    const lum = (0.299*p.r + 0.587*p.g + 0.114*p.b).toFixed(0);
    const hex = '#' + [p.r,p.g,p.b].map(v => v.toString(16).padStart(2,'0')).join('');
    console.log(`  ${hex}  lum=${lum}`);
  }

  function nearestIdx(r, g, b) {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < centroids.length; i++) {
      const dr = r - centroids[i][0], dg = g - centroids[i][1], db = b - centroids[i][2];
      const d = dr*dr*2 + dg*dg*4 + db*db;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return remap[best]; // return sorted index
  }

  // ── 6) Build grid ──
  const grid = [];
  for (let y = 0; y < SIZE; y++) {
    const row = [];
    for (let x = 0; x < SIZE; x++) {
      if (bg[y][x]) {
        row.push(-1);
      } else {
        const [r,g,b] = pixels[y][x];
        row.push(nearestIdx(r,g,b));
      }
    }
    grid.push(row);
  }

  // ── 7) Output TypeScript ──
  let ts = `// Auto-generated from my.jpg — face-cropped ${SIZE}×${SIZE}\n`;
  ts += `// ${PALETTE_SIZE}-color k-means palette with contrast boost\n`;
  ts += `// -1 = transparent (fish swim behind), filled = opaque person\n\n`;
  ts += `const P_PAL: string[] = [\n`;
  for (let i = 0; i < palette.length; i++) {
    const hex = '#' + [palette[i].r, palette[i].g, palette[i].b]
      .map(v => Math.min(255,v).toString(16).padStart(2,'0')).join('');
    ts += `  '${hex}',${(i+1)%8===0?'\n':' '}`;
  }
  if (palette.length % 8 !== 0) ts += '\n';
  ts += `];\n\n`;

  ts += `/* prettier-ignore */\nconst P_GRID: number[][] = [\n`;
  for (const row of grid) {
    ts += `  [${row.join(',')}],\n`;
  }
  ts += `];\n`;

  writeFileSync(`${OUT}/portrait-v4.ts`, ts);
  console.log(`Written portrait-v4.ts (${ts.length} bytes)`);
}

main().catch(console.error);
