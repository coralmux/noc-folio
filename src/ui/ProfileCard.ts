const EXPERTISE_FIELDS = [
  'AI', 'Cloud', 'Big Data', 'Backend',
  'Database', 'DevOps', 'Network', 'Security',
];

/* ═══════════════════════════════════════════════════════════
   PORTRAIT — auto-generated from my.jpg, face-cropped 64×64
   24-color k-means palette with contrast boost
   -1 = transparent (fish swim behind), filled = opaque person
   ═══════════════════════════════════════════════════════════ */
const P_PAL: string[] = [
  '#040101', '#100908', '#251613', '#48241a', '#633022', '#4c3c39', '#7e3b28', '#6e4436',
  '#5d504d', '#934735', '#6f6059', '#875949', '#9f5f49', '#8d766b', '#ad6c52', '#ba785d',
  '#a78776', '#c1846b', '#b49583', '#ca9077', '#bd9f8f', '#caaa99', '#ccb5aa', '#dcc6be',
];

/* prettier-ignore */
const P_GRID: number[][] = [
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,22,8,8,10,18,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,1,1,1,1,0,2,8,22,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,22,13,10,10,13,21,13,0,1,2,2,1,1,0,0,2,8,22,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,2,2,2,2,1,2,2,0,1,1,0,0,1,1,1,2,2,2,20,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,20,2,1,2,2,2,2,2,1,1,1,0,0,0,0,0,0,0,1,2,2,2,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,1,0,1,2,2,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,2,1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,1,1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,0,0,0,0,0,0,0,0,0,1,1,2,3,2,2,2,2,1,0,0,0,0,1,1,1,1,1,1,20,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,0,0,0,0,0,0,0,0,0,2,3,4,9,11,11,7,4,7,4,1,0,0,0,0,0,0,0,1,0,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,2,0,1,0,0,0,0,0,0,0,3,4,9,12,14,15,14,12,12,11,3,1,0,0,0,0,0,0,0,1,0,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,0,1,1,0,0,1,1,0,0,1,3,6,12,14,14,15,15,14,14,12,6,2,0,0,0,0,0,0,0,1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,0,2,1,0,1,1,0,0,1,2,4,9,12,14,15,15,15,15,15,14,12,4,1,0,0,0,0,0,0,0,0,0,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,0,1,1,0,0,0,0,1,1,3,6,12,14,15,15,15,15,15,15,15,15,12,3,0,0,0,0,0,0,0,0,0,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,0,0,0,0,0,0,0,1,1,3,9,14,14,15,15,15,15,15,15,15,15,15,11,2,0,0,0,0,0,0,0,0,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,1,0,0,0,1,1,0,0,1,6,12,14,15,15,15,15,15,15,15,15,15,14,14,9,2,0,0,0,0,0,0,0,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,1,0,0,0,0,0,0,1,6,14,14,14,15,15,15,15,15,15,15,15,15,15,14,14,12,3,0,0,0,0,0,0,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,1,1,0,0,1,2,4,12,14,14,14,15,17,17,17,17,15,15,15,15,15,15,15,14,12,12,9,7,2,0,0,0,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,1,1,1,1,3,14,15,14,14,12,15,15,17,19,19,19,17,17,17,19,19,19,17,14,12,11,12,12,3,0,0,0,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,2,1,1,2,11,15,14,12,7,7,7,7,7,12,15,19,19,19,19,19,14,11,7,5,4,4,6,12,7,0,0,0,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,1,1,7,15,14,14,7,7,7,11,11,12,12,14,17,19,19,17,14,12,11,11,11,7,4,4,9,12,2,0,2,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,1,1,11,15,15,14,14,15,19,19,19,19,19,17,19,19,20,17,17,17,17,19,19,19,14,11,11,12,3,0,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,1,2,14,17,15,17,17,17,15,14,14,17,19,19,19,21,21,19,17,17,17,14,14,14,14,14,14,14,7,0,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,2,3,17,17,17,17,14,6,7,2,2,11,14,19,19,21,21,17,17,15,7,1,2,4,4,12,14,14,11,0,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,3,5,19,17,17,15,12,12,15,11,11,14,14,17,17,19,19,15,15,15,12,7,12,15,9,12,14,14,14,2,20,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,22,9,11,19,15,15,15,15,17,19,19,19,19,19,17,17,19,19,15,15,17,17,17,19,17,15,14,14,14,15,7,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,14,14,19,17,15,17,17,17,19,19,19,19,19,17,17,19,17,15,15,17,17,17,17,17,17,15,14,14,14,12,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,17,20,17,17,17,17,17,19,19,19,19,19,17,17,17,17,15,15,17,17,19,19,19,17,17,15,15,15,15,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,19,21,19,17,17,19,19,19,19,19,19,19,17,15,17,17,14,15,17,19,19,19,19,17,17,17,15,17,17,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,14,17,21,19,19,17,19,19,19,19,19,19,19,14,14,17,19,15,14,15,19,19,19,19,17,17,17,15,17,17,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,15,21,19,19,19,19,19,19,19,19,17,15,15,17,21,21,19,15,14,15,17,17,17,17,17,17,15,17,17,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,19,19,21,19,19,19,19,19,19,19,19,15,14,17,9,17,19,15,9,14,15,17,17,17,17,17,17,15,17,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,17,21,19,19,19,19,19,19,19,17,17,15,14,6,14,15,11,4,12,15,17,17,19,17,17,17,15,17,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,21,19,19,19,19,19,19,19,17,17,17,15,19,19,17,15,15,15,15,15,17,19,17,17,17,15,17,20,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,20,22,21,19,19,19,19,19,19,17,17,17,17,17,19,17,15,15,15,15,15,17,19,17,17,17,15,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,19,19,19,19,19,19,17,19,19,19,19,17,15,17,17,15,15,17,17,17,19,19,17,17,20,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,19,19,19,19,19,19,15,14,15,15,14,12,14,14,12,14,14,14,15,17,19,17,17,17,21,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,19,19,19,19,19,15,14,12,9,9,9,9,9,9,6,9,9,15,17,17,17,17,17,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,19,19,19,19,19,19,19,19,15,17,15,14,15,14,14,15,17,15,17,17,17,17,17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,19,19,19,19,19,19,19,19,17,17,15,15,15,15,15,15,17,15,17,15,15,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,19,19,17,19,19,19,19,17,17,15,15,15,15,15,15,15,15,15,15,14,14,18,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,22,17,17,17,19,17,17,17,17,17,17,17,17,15,15,15,15,14,14,14,15,16,20,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,17,17,17,17,17,17,17,17,17,17,17,15,15,15,14,14,14,15,15,15,16,18,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,17,15,17,17,17,17,17,15,15,15,15,15,14,14,14,14,15,15,17,3,5,8,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,19,17,15,15,14,15,15,15,15,14,14,12,12,14,15,17,15,17,11,0,5,18,16,22,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19,17,17,17,15,14,12,12,12,12,14,14,14,15,17,17,17,14,7,13,8,20,16,16,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,12,19,19,19,17,17,17,17,17,15,15,17,17,17,19,17,17,14,7,18,22,13,13,20,7,11,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16,11,19,19,19,17,17,17,17,17,17,17,19,19,19,19,17,15,9,11,20,21,18,7,12,11,8,16,18,22,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,23,18,4,15,19,19,19,19,19,19,19,19,19,19,19,19,19,17,12,16,18,12,15,12,3,11,21,16,16,18,16,18,22,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,21,18,22,8,4,9,19,19,19,19,19,19,19,19,19,19,19,19,19,14,18,22,17,4,6,16,13,8,20,16,16,16,18,18,18,18,21,23,-1,-1,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,22,22,16,21,11,13,16,4,14,19,19,19,19,19,19,19,19,19,19,19,14,16,21,14,12,12,12,22,20,8,10,16,16,16,18,18,18,20,18,20,20,23,-1,-1,-1,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,22,21,21,18,16,16,20,16,14,11,6,17,19,19,19,19,19,19,19,19,19,17,16,7,4,14,21,21,12,20,21,10,2,16,16,18,18,18,18,18,20,20,20,23,22,20,23,-1,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,22,21,20,18,21,16,13,22,23,2,2,20,6,9,15,17,19,19,19,19,19,19,19,18,13,3,2,7,21,22,16,7,10,5,8,18,16,18,18,18,18,20,20,20,22,22,18,20,22,23,-1,-1],
  [-1,-1,-1,-1,-1,-1,-1,-1,-1,23,22,20,20,18,18,20,21,13,22,23,16,0,0,11,18,14,12,14,15,17,17,17,19,18,18,16,11,7,3,2,7,18,10,1,2,10,13,18,18,18,18,18,18,20,20,20,22,18,16,21,22,22,21,23],
  [-1,-1,-1,-1,-1,-1,-1,22,21,21,20,20,20,18,18,21,18,13,18,22,10,0,0,3,14,20,16,9,12,14,15,17,18,16,16,16,13,12,11,7,3,7,10,8,11,13,16,18,18,18,20,18,18,20,18,20,20,16,16,20,20,18,20,20],
  [-1,-1,-1,-1,-1,23,22,20,20,21,20,20,20,18,18,21,16,11,11,18,3,2,2,11,14,16,18,16,9,9,14,18,16,18,18,18,18,16,16,13,11,11,11,20,16,11,18,18,18,18,18,18,20,20,18,20,18,13,18,18,18,20,20,18],
  [-1,-1,-1,-1,22,20,20,18,20,20,20,20,20,18,20,21,16,20,20,10,7,11,12,13,16,14,16,20,16,4,16,20,18,18,20,20,20,20,20,18,16,16,13,11,16,16,18,18,18,18,18,18,20,18,18,20,13,16,18,16,20,20,18,16],
  [-1,-1,22,21,21,18,20,18,20,21,20,20,20,20,21,20,16,20,18,13,16,18,18,16,18,18,13,16,18,16,20,18,18,20,21,20,20,20,20,20,16,18,20,18,16,18,18,18,18,18,18,18,20,18,18,16,13,16,16,20,20,18,18,18],
  [-1,22,20,20,20,16,20,20,20,20,20,20,20,20,21,20,18,18,20,20,20,20,20,18,18,20,18,13,16,20,18,20,21,21,21,20,20,20,20,18,16,20,20,18,16,18,18,18,18,18,18,18,18,16,18,13,16,13,20,18,18,18,18,18],
  [22,21,18,18,18,16,20,20,20,20,20,20,20,20,21,20,20,20,20,20,20,20,20,20,18,18,18,16,20,20,20,21,21,21,20,20,20,20,20,18,18,20,20,18,16,20,18,18,18,18,20,20,18,16,16,11,13,18,18,18,20,18,18,18],
  [20,21,18,18,18,16,20,20,20,20,20,20,20,20,21,20,20,20,20,20,20,20,20,20,18,18,16,18,21,21,21,21,21,20,20,20,20,20,20,18,20,20,20,18,18,20,18,18,18,18,20,20,18,16,13,11,16,18,16,20,18,18,20,18],
];

function createPortraitCanvas(displaySize: number): HTMLCanvasElement {
  const S = 64;
  const D = displaySize;
  const canvas = document.createElement('canvas');
  // Native resolution = display size → no CSS scaling, no sub-pixel jitter
  canvas.width = D;
  canvas.height = D;
  const ctx = canvas.getContext('2d')!;

  // Helper: map source pixel (x,y) to display rect with integer boundaries
  const px0 = (i: number) => Math.round(i * D / S);
  const px1 = (i: number) => Math.round((i + 1) * D / S);

  // Pass 1: 2px dark border around silhouette
  const EDGE = '#060e18';
  ctx.fillStyle = EDGE;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (P_GRID[y][x] >= 0) continue;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) {
        for (let dx = -2; dx <= 2 && !near; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < S && nx >= 0 && nx < S && P_GRID[ny][nx] >= 0) near = true;
        }
      }
      if (near) ctx.fillRect(px0(x), px0(y), px1(x) - px0(x), px1(y) - px0(y));
    }
  }

  // Pass 2: draw person pixels
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const idx = P_GRID[y][x];
      if (idx >= 0) {
        ctx.fillStyle = P_PAL[idx];
        ctx.fillRect(px0(x), px0(y), px1(x) - px0(x), px1(y) - px0(y));
      }
    }
  }

  canvas.style.cssText = `
    width: ${D}px; height: ${D}px;
    position: absolute;
    top: 0; left: 0;
    z-index: 2;
    pointer-events: none;
  `;
  return canvas;
}

/* ═══════════════════════════════════════════════════════════
   FISH PIXEL ART — Nemo, Imperial Angel, Blue Tang, Goby
   ═══════════════════════════════════════════════════════════ */

type FishType = 'nemo' | 'angel' | 'bluetang' | 'goby' | 'seahorse' | 'jellyfish';

/** Nemo (Clownfish) — 32×20, pudgy body + 3 curved white bands */
function drawNemo(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#10101a';
  const ORG  = '#e85820';  // deeper orange
  const DORG = '#c04018';  // dark orange (belly shadow)
  const LORG = '#f07030';  // lighter orange
  const WHT  = '#f0f0f0';
  const BWHT = '#d0d0d0';  // band shadow

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Pudgier body: rounder, less elongated
  const bcx = 17, bcy = 10, brx = 8.5, bry = 6.5;
  const inBody = (x: number, y: number) => {
    const dx = (x + .5 - bcx) / brx, dy = (y + .5 - bcy) / bry;
    return dx * dx + dy * dy <= 1;
  };
  const isEdge = (x: number, y: number) =>
    inBody(x, y) && (!inBody(x - 1, y) || !inBody(x + 1, y) || !inBody(x, y - 1) || !inBody(x, y + 1));

  // 3 white bands that curve with body shape
  const bandCenter = (bandX: number, y: number) => {
    const dy = (y - bcy) / bry;
    // Bands curve inward toward center at top/bottom
    return bandX + dy * dy * (bandX < bcx ? 1.2 : -1.2);
  };

  const isWhiteBand = (x: number, y: number) => {
    const bands = [12, 17, 22]; // 3 band center x-positions
    for (const bx of bands) {
      const cx = bandCenter(bx, y);
      const dist = Math.abs(x - cx);
      if (dist < 1.3) return 'white';
      if (dist < 2.2) return 'border';
    }
    return null;
  };

  // Draw body
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 32; x++) {
      if (!inBody(x, y)) continue;
      if (isEdge(x, y)) { px(x, y, BLK); continue; }

      const band = isWhiteBand(x, y);
      if (band === 'white') px(x, y, y > bcy ? BWHT : WHT);
      else if (band === 'border') px(x, y, BLK);
      else if (y > bcy + 2) px(x, y, DORG);  // belly darker
      else if (y < bcy - 2) px(x, y, LORG);  // top lighter
      else px(x, y, ORG);
    }
  }

  // Eye (right side = front of fish)
  px(23, 9, WHT); px(24, 9, WHT);
  px(23, 10, WHT); px(24, 10, BLK);

  // Mouth
  px(26, 10, BLK); px(26, 11, BLK);

  // Tail fin — forked, black-edged
  const tail: [number, number, string][] = [
    [7,5,LORG],[7,6,ORG],[7,7,ORG],[7,8,ORG],[7,9,ORG],
    [7,10,ORG],[7,11,ORG],[7,12,ORG],[7,13,DORG],[7,14,DORG],
    [6,4,LORG],[6,5,LORG],[6,6,ORG],[6,13,DORG],[6,14,DORG],
    [5,3,LORG],[5,4,LORG],[5,14,DORG],[5,15,DORG],
    [4,2,LORG],[4,3,LORG],[4,15,DORG],[4,16,DORG],
    // Outline
    [3,1,BLK],[4,1,BLK],[5,2,BLK],[6,3,BLK],[7,4,BLK],
    [3,2,BLK],[3,3,BLK],[4,4,BLK],[5,5,BLK],[6,7,BLK],
    [3,17,BLK],[4,17,BLK],[5,16,BLK],[6,15,BLK],[7,15,BLK],
    [3,16,BLK],[3,15,BLK],[4,14,BLK],[5,13,BLK],[6,12,BLK],
  ];
  for (const [tx, ty, tc] of tail) px(tx, ty, tc);

  // Dorsal fin (top)
  const dorsal: [number, number, string][] = [
    [14,2,ORG],[15,2,ORG],[16,2,ORG],[17,2,ORG],[18,2,ORG],
    [13,1,BLK],[14,1,BLK],[15,1,BLK],[16,1,BLK],[17,1,BLK],[18,1,BLK],[19,1,BLK],
    [13,2,BLK],[19,2,BLK],
  ];
  for (const [dx, dy, dc] of dorsal) px(dx, dy, dc);

  // Anal fin (bottom)
  const anal: [number, number, string][] = [
    [14,17,DORG],[15,17,DORG],[16,17,DORG],[17,17,DORG],
    [13,18,BLK],[14,18,BLK],[15,18,BLK],[16,18,BLK],[17,18,BLK],[18,18,BLK],
    [13,17,BLK],[18,17,BLK],
  ];
  for (const [ax, ay, ac] of anal) px(ax, ay, ac);

  // Pectoral fin
  px(22, 12, BLK); px(23, 12, LORG); px(24, 12, LORG);
  px(23, 13, BLK); px(24, 13, BLK); px(25, 13, BLK);
}

/** Imperial Angelfish — 32×22 */
function drawAngel(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#0a0a1a';
  const NAVY = '#1a3468';
  const BLUE = '#2850a0';
  const LBLU = '#3868b8';
  const YEL  = '#ffd830';
  const LYEL = '#ffe860';
  const WHT  = '#e8e8f0';

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Body ellipse — taller, more disc-shaped
  const bcx = 16, bcy = 11, brx = 10, bry = 8;
  const inBody = (x: number, y: number) => {
    const dx = (x+.5-bcx)/brx, dy = (y+.5-bcy)/bry;
    return dx*dx+dy*dy <= 1;
  };
  const isEdge = (x: number, y: number) =>
    inBody(x,y) && (!inBody(x-1,y)||!inBody(x+1,y)||!inBody(x,y-1)||!inBody(x,y+1));

  // Draw body with horizontal blue+yellow stripes
  for (let y = 0; y < 22; y++) {
    for (let x = 0; x < 32; x++) {
      if (!inBody(x,y)) continue;
      if (isEdge(x,y)) { px(x,y,BLK); continue; }
      // Face mask (front dark area)
      if (x >= 22 && y >= 6 && y <= 16) {
        const d = x - 22;
        if (d >= 3) { px(x,y,NAVY); continue; }
        if (y % 2 === 0) { px(x,y,NAVY); continue; }
      }
      // Horizontal stripe pattern
      const stripe = y % 3;
      if (stripe === 0) px(x,y,BLUE);
      else if (stripe === 1) px(x,y,YEL);
      else px(x,y,NAVY);
    }
  }

  // Yellow tail
  for (let y = 4; y <= 18; y++) {
    const dist = Math.abs(y - 11);
    const w = Math.max(1, 4 - Math.floor(dist / 3));
    for (let dx = 0; dx < w; dx++) {
      const tx = 5 - dx;
      if (tx >= 0) {
        px(tx, y, isEdge(tx,y) ? BLK : (y % 2 === 0 ? YEL : LYEL));
      }
    }
  }
  // Tail outline
  for (let y = 3; y <= 19; y++) {
    const dist = Math.abs(y - 11);
    if (dist >= 6 && dist <= 8) px(4, y, BLK);
  }

  // Eye
  px(23, 9, WHT); px(24, 9, WHT);
  px(23, 10, WHT); px(24, 10, BLK);

  // Yellow ring around eye
  px(22, 9, YEL); px(25, 9, YEL);
  px(22, 10, YEL); px(25, 10, YEL);
  px(23, 8, YEL); px(24, 8, YEL);
  px(23, 11, YEL); px(24, 11, YEL);

  // Dorsal fin
  for (let x = 12; x <= 20; x++) {
    px(x, 1, BLK);
    px(x, 2, LBLU);
  }
  px(11, 2, BLK); px(21, 2, BLK);

  // Anal fin
  for (let x = 12; x <= 20; x++) {
    px(x, 20, LBLU);
    px(x, 21, BLK);
  }
  px(11, 20, BLK); px(21, 20, BLK);

  // Pectoral fin
  px(21, 13, BLK); px(22, 13, LBLU); px(23, 14, BLK);
}

/** Blue Tang (Dory) — 30×18 */
function drawBlueTang(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#0a0a18';
  const BLUE = '#2060c8';
  const DBLU = '#1848a0';
  const LBLU = '#4080e0';
  const YEL  = '#ffd020';
  const WHT  = '#f0f0f0';

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Body — laterally compressed oval
  const bcx = 16, bcy = 9, brx = 10, bry = 6;
  const inBody = (x: number, y: number) => {
    const dx = (x+.5-bcx)/brx, dy = (y+.5-bcy)/bry;
    return dx*dx+dy*dy <= 1;
  };
  const isEdge = (x: number, y: number) =>
    inBody(x,y) && (!inBody(x-1,y)||!inBody(x+1,y)||!inBody(x,y-1)||!inBody(x,y+1));

  // Main body blue
  for (let y = 0; y < 18; y++) for (let x = 0; x < 30; x++) {
    if (!inBody(x,y)) continue;
    if (isEdge(x,y)) { px(x,y,BLK); continue; }
    // Lighter belly
    if (y >= 11) px(x,y,LBLU);
    else px(x,y,BLUE);
  }

  // Black "palette" / "6" marking
  // Horizontal bar across middle
  for (let x = 10; x <= 22; x++) { px(x,8,BLK); px(x,9,BLK); }
  // Curve up at front
  for (let y = 4; y <= 8; y++) { px(22,y,BLK); px(21,y,BLK); }
  // Curve down from middle
  for (let y = 9; y <= 12; y++) {
    const cx = 14 - Math.floor((y-9)*0.8);
    px(cx,y,BLK); px(cx+1,y,BLK);
  }
  // Connect to tail area
  for (let x = 8; x <= 12; x++) { px(x,12,BLK); }

  // Yellow tail
  for (let y = 5; y <= 13; y++) {
    const d = Math.abs(y-9);
    if (d <= 4) {
      px(5,y,YEL); px(6,y,YEL);
      if (d <= 2) px(4,y,YEL);
    }
    // Tail outline
    if (d === 4) { px(4,y,BLK); px(5,y,BLK); }
  }
  px(3,6,BLK); px(3,12,BLK);

  // Eye
  px(23,8,WHT); px(24,8,WHT);
  px(23,9,WHT); px(24,9,BLK);

  // Dorsal fin (blue)
  for (let x = 13; x <= 21; x++) { px(x,1,BLK); px(x,2,DBLU); }
  px(12,2,BLK); px(22,2,BLK);

  // Anal fin
  for (let x = 13; x <= 21; x++) { px(x,16,DBLU); px(x,17,BLK); }
  px(12,16,BLK); px(22,16,BLK);

  // Pectoral fin
  px(22,11,BLK); px(23,11,LBLU); px(24,12,BLK);
}

/** Goby — 24×10 (small, elongated) */
function drawGoby(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#1a1a28';
  const BODY = '#c8b888';
  const LBDY = '#d8cc98';
  const SBDY = '#b0a070';
  const SPOT = '#988860';
  const WHT  = '#f0f0f0';
  const FIN  = '#d0c498';

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Elongated body ellipse
  const bcx = 12, bcy = 5, brx = 9, bry = 3.5;
  const inBody = (x: number, y: number) => {
    const dx = (x+.5-bcx)/brx, dy = (y+.5-bcy)/bry;
    return dx*dx+dy*dy <= 1;
  };
  const isEdge = (x: number, y: number) =>
    inBody(x,y) && (!inBody(x-1,y)||!inBody(x+1,y)||!inBody(x,y-1)||!inBody(x,y+1));

  // Main body
  for (let y = 0; y < 10; y++) for (let x = 0; x < 24; x++) {
    if (!inBody(x,y)) continue;
    if (isEdge(x,y)) { px(x,y,BLK); continue; }
    if (y >= 6) px(x,y,LBDY);
    else px(x,y,BODY);
  }

  // Spots/speckles
  px(10,4,SPOT); px(14,5,SPOT); px(8,5,SPOT); px(16,4,SPOT);
  px(12,3,SPOT); px(11,6,SPOT); px(15,6,SPOT);

  // Big eye (characteristic of gobies)
  px(19,3,WHT); px(20,3,WHT);
  px(19,4,WHT); px(20,4,BLK);
  px(19,5,BLK); // lower lid

  // Mouth
  px(21,5,BLK);

  // Tail — rounded
  px(2,3,SBDY); px(2,4,FIN); px(2,5,FIN); px(2,6,FIN); px(2,7,SBDY);
  px(1,3,FIN); px(1,4,FIN); px(1,5,FIN); px(1,6,FIN); px(1,7,FIN);
  px(0,4,BLK); px(0,5,BLK); px(0,6,BLK);
  px(1,2,BLK); px(1,8,BLK);

  // First dorsal fin (tall, characteristic)
  px(13,0,BLK); px(14,0,BLK);
  px(12,1,BLK); px(15,1,BLK); px(13,1,FIN); px(14,1,FIN);

  // Second dorsal fin
  px(8,1,BLK); px(9,1,BLK);
  px(7,2,BLK); px(10,2,BLK); px(8,2,FIN); px(9,2,FIN);

  // Anal fin
  px(10,8,FIN); px(11,8,FIN); px(12,8,FIN);
  px(10,9,BLK); px(11,9,BLK); px(12,9,BLK);

  // Pectoral fin
  px(18,6,BLK); px(19,6,FIN); px(19,7,BLK);
}

/** Seahorse — 14×28, vertical orientation */
function drawSeahorse(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#10101a';
  const BODY = '#e0a030';
  const LBDY = '#f0c050';
  const DBDY = '#b08020';
  const SPOT = '#c88828';
  const WHT  = '#f0f0f0';
  const SNOUT= '#d09028';

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Head crown/coronet
  px(6,0,BLK); px(7,0,BLK); px(8,0,BLK);
  px(5,1,BLK); px(6,1,LBDY); px(7,1,LBDY); px(8,1,LBDY); px(9,1,BLK);
  px(5,2,BLK); px(6,2,LBDY); px(7,2,BODY); px(8,2,LBDY); px(9,2,BLK);

  // Head
  px(4,3,BLK); px(5,3,LBDY); px(6,3,BODY); px(7,3,BODY); px(8,3,BODY); px(9,3,LBDY); px(10,3,BLK);
  px(4,4,BLK); px(5,4,BODY); px(6,4,BODY); px(7,4,BODY); px(8,4,BODY); px(9,4,BODY); px(10,4,BLK);
  // Eye
  px(6,4,WHT); px(7,4,BLK);

  // Snout (long, pointing right)
  px(4,5,BLK); px(5,5,BODY); px(6,5,BODY); px(7,5,BODY); px(8,5,SNOUT); px(9,5,SNOUT); px(10,5,SNOUT); px(11,5,SNOUT); px(12,5,BLK);
  px(4,6,BLK); px(5,6,BODY); px(6,6,BODY); px(7,6,BODY); px(8,6,SNOUT); px(9,6,SNOUT); px(10,6,SNOUT); px(11,6,BLK);
  px(12,6,BLK);

  // Neck curve
  px(3,7,BLK); px(4,7,BODY); px(5,7,BODY); px(6,7,BODY); px(7,7,DBDY); px(8,7,BLK);
  px(3,8,BLK); px(4,8,LBDY); px(5,8,BODY); px(6,8,DBDY); px(7,8,BLK);

  // Body (segmented belly ridges)
  for (let y = 9; y <= 18; y++) {
    const w = y <= 12 ? 5 : y <= 15 ? 4 : 3;
    const xOff = y <= 12 ? 2 : y <= 15 ? 3 : 4;
    px(xOff, y, BLK);
    for (let dx = 1; dx < w; dx++) {
      const c = (y % 2 === 0) ? BODY : DBDY;
      px(xOff + dx, y, c);
    }
    px(xOff + w, y, BLK);
    // Belly ridge dots
    if (y % 2 === 0) px(xOff + 1, y, SPOT);
  }

  // Curled tail
  px(5,19,BLK); px(6,19,DBDY); px(7,19,BLK);
  px(6,20,BLK); px(7,20,DBDY); px(8,20,BLK);
  px(7,21,BLK); px(8,21,DBDY); px(9,21,BLK);
  px(8,22,BLK); px(9,22,DBDY); px(10,22,BLK);
  px(8,23,BLK); px(9,23,DBDY); px(10,23,BLK);
  px(7,24,BLK); px(8,24,DBDY); px(9,24,BLK);
  px(6,25,BLK); px(7,25,DBDY); px(8,25,BLK);
  px(6,26,BLK); px(7,26,BLK);

  // Dorsal fin (small, on back)
  px(2,10,BLK); px(1,11,BLK); px(2,11,LBDY); px(1,12,BLK); px(2,12,LBDY); px(2,13,BLK);
}

/** Jellyfish — 18×26, translucent bell + trailing tentacles */
function drawJellyfish(ctx: CanvasRenderingContext2D): void {
  const BLK  = '#10102a';
  const BELL = 'rgba(160, 180, 255, 0.55)';
  const LBEL = 'rgba(190, 210, 255, 0.65)';
  const EDGE = 'rgba(120, 140, 220, 0.50)';
  const TENT = 'rgba(140, 160, 240, 0.35)';
  const LTNT = 'rgba(180, 200, 255, 0.25)';
  const GLOW = 'rgba(200, 220, 255, 0.40)';

  const px = (x: number, y: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };

  // Bell dome (semicircle-ish)
  const bcx = 9, bcy = 7, brx = 7, bry = 7;
  for (let y = 0; y <= 9; y++) {
    for (let x = 0; x < 18; x++) {
      const dx = (x + .5 - bcx) / brx, dy = (y + .5 - bcy) / bry;
      if (dx * dx + dy * dy > 1) continue;
      // Edge detection
      const dx2 = (x + .5 - bcx) / (brx - 1), dy2 = (y + .5 - bcy) / (bry - 1);
      if (dx2 * dx2 + dy2 * dy2 > 1) px(x, y, EDGE);
      else if (y <= 3) px(x, y, LBEL);
      else px(x, y, BELL);
    }
  }

  // Inner glow
  px(8, 4, GLOW); px(9, 4, GLOW); px(10, 4, GLOW);
  px(7, 5, GLOW); px(8, 5, GLOW); px(9, 5, GLOW); px(10, 5, GLOW); px(11, 5, GLOW);

  // Bell bottom rim (scalloped)
  for (let x = 3; x <= 15; x++) {
    px(x, 10, (x % 2 === 0) ? EDGE : BELL);
  }

  // Oral arms (short, frilly, center)
  for (let y = 11; y <= 14; y++) {
    px(7, y, BELL); px(8, y, BELL); px(9, y, BELL); px(10, y, BELL); px(11, y, BELL);
  }
  px(8, 15, BELL); px(9, 15, BELL); px(10, 15, BELL);

  // Tentacles (long, trailing, wavy)
  // Left tentacles
  for (let y = 11; y <= 24; y++) {
    const wave = Math.sin(y * 0.8) * 1.2;
    const tx = Math.round(4 + wave);
    px(tx, y, TENT);
    if (y < 20) px(tx + 1, y, LTNT);
  }
  // Center-left
  for (let y = 11; y <= 22; y++) {
    const wave = Math.sin(y * 0.6 + 1) * 0.8;
    px(Math.round(7 + wave), y, TENT);
  }
  // Center-right
  for (let y = 11; y <= 23; y++) {
    const wave = Math.sin(y * 0.7 + 2) * 0.8;
    px(Math.round(11 + wave), y, TENT);
  }
  // Right tentacles
  for (let y = 11; y <= 25; y++) {
    const wave = Math.sin(y * 0.9 + 3) * 1.2;
    const tx = Math.round(14 + wave);
    px(tx, y, TENT);
    if (y < 21) px(tx - 1, y, LTNT);
  }
}

/* ═══════════════════════════════════════════════════════════
   Fish data URL cache + swimming inside portrait circle
   ═══════════════════════════════════════════════════════════ */

interface FishSpec {
  type: FishType;
  canvasW: number;
  canvasH: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const FISH_SPECS: FishSpec[] = [
  { type: 'nemo',      canvasW: 32, canvasH: 20, draw: drawNemo },
  { type: 'angel',     canvasW: 32, canvasH: 22, draw: drawAngel },
  { type: 'bluetang',  canvasW: 30, canvasH: 18, draw: drawBlueTang },
  { type: 'goby',      canvasW: 24, canvasH: 10, draw: drawGoby },
  { type: 'seahorse',  canvasW: 14, canvasH: 28, draw: drawSeahorse },
  { type: 'jellyfish', canvasW: 18, canvasH: 26, draw: drawJellyfish },
];

function createFishDataURL(spec: FishSpec): string {
  const c = document.createElement('canvas');
  c.width = spec.canvasW;
  c.height = spec.canvasH;
  spec.draw(c.getContext('2d')!);
  return c.toDataURL();
}

interface SwimConfig {
  fishIdx: number;    // index into FISH_SPECS
  top: string;        // vertical position (horizontal swimmers) or ignored (vertical)
  left?: string;      // horizontal position (vertical swimmers only)
  size: number;       // display width px
  speed: number;      // seconds per crossing
  delay: number;
  dir: 'left' | 'right' | 'up' | 'down';
  opacity: number;
  wobble: number;
}

const SWIM_CONFIG: SwimConfig[] = [
  // Nemos
  { fishIdx: 0, top: '12%', size: 36, speed: 7,   delay: 0,   dir: 'right', opacity: 0.85, wobble: 2.8 },
  { fishIdx: 0, top: '55%', size: 24, speed: 11,  delay: 4,   dir: 'left',  opacity: 0.55, wobble: 3.5 },
  // Imperial Angelfish
  { fishIdx: 1, top: '38%', size: 34, speed: 9,   delay: 2,   dir: 'left',  opacity: 0.75, wobble: 3.0 },
  { fishIdx: 1, top: '68%', size: 22, speed: 14,  delay: 7,   dir: 'right', opacity: 0.45, wobble: 3.8 },
  // Blue Tang
  { fishIdx: 2, top: '22%', size: 30, speed: 8,   delay: 5,   dir: 'right', opacity: 0.7,  wobble: 2.6 },
  { fishIdx: 2, top: '72%', size: 20, speed: 12,  delay: 1,   dir: 'left',  opacity: 0.5,  wobble: 3.3 },
  // Goby (small, close to bottom)
  { fishIdx: 3, top: '78%', size: 28, speed: 15,  delay: 3,   dir: 'right', opacity: 0.55, wobble: 4.5 },
  { fishIdx: 3, top: '48%', size: 18, speed: 16,  delay: 10,  dir: 'left',  opacity: 0.35, wobble: 4.0 },
  // Seahorse (vertical, slow)
  { fishIdx: 4, top: '0', left: '15%', size: 24, speed: 12,  delay: 2,   dir: 'up',    opacity: 0.65, wobble: 3.5 },
  { fishIdx: 4, top: '0', left: '75%', size: 18, speed: 16,  delay: 8,   dir: 'down',  opacity: 0.45, wobble: 4.0 },
  // Jellyfish (vertical, gentle drift)
  { fishIdx: 5, top: '0', left: '55%', size: 28, speed: 14,  delay: 5,   dir: 'up',    opacity: 0.5,  wobble: 5.0 },
  { fishIdx: 5, top: '0', left: '30%', size: 20, speed: 18,  delay: 11,  dir: 'down',  opacity: 0.35, wobble: 5.5 },
];

function addFishToFrame(frame: HTMLDivElement): void {
  const dataURLs = FISH_SPECS.map(createFishDataURL);

  for (const cfg of SWIM_CONFIG) {
    const spec = FISH_SPECS[cfg.fishIdx];
    const url = dataURLs[cfg.fishIdx];
    const isVertical = cfg.dir === 'up' || cfg.dir === 'down';
    const w = cfg.size;
    const h = Math.round(w * spec.canvasH / spec.canvasW);

    // Randomize start position: negative delay = jump into mid-animation
    const randSwimOffset = -(Math.random() * cfg.speed).toFixed(2);
    const randWobbleOffset = -(Math.random() * cfg.wobble).toFixed(2);

    // Randomize perpendicular position slightly (±12%)
    const jitter = (Math.random() * 24 - 12).toFixed(1);

    // 3-layer nesting: swim → wobble → body (no transform conflicts)
    const swimDiv = document.createElement('div');

    if (isVertical) {
      const swimAnim = cfg.dir === 'up' ? 'fishSwimUp' : 'fishSwimDown';
      const baseLeft = parseFloat(cfg.left || '50');
      const jitteredLeft = (baseLeft + parseFloat(jitter)).toFixed(1);
      swimDiv.style.cssText = `
        position: absolute;
        left: ${jitteredLeft}%;
        top: 0;
        z-index: 1;
        pointer-events: none;
        will-change: transform;
        animation: ${swimAnim} ${cfg.speed}s linear ${randSwimOffset}s infinite;
      `;
    } else {
      const baseTop = parseFloat(cfg.top);
      const jitteredTop = (baseTop + parseFloat(jitter)).toFixed(1);
      const swimAnim = cfg.dir === 'right' ? 'fishSwimRight' : 'fishSwimLeft';
      swimDiv.style.cssText = `
        position: absolute;
        top: ${jitteredTop}%;
        left: 0;
        z-index: 1;
        pointer-events: none;
        will-change: transform;
        animation: ${swimAnim} ${cfg.speed}s linear ${randSwimOffset}s infinite;
      `;
    }

    // Middle: wobble perpendicular to swim direction
    const wobbleDiv = document.createElement('div');
    const wobbleAnim = isVertical ? 'fishWobbleX' : 'fishWobble';
    wobbleDiv.style.cssText = `
      will-change: transform;
      animation: ${wobbleAnim} ${cfg.wobble}s ease-in-out ${randWobbleOffset}s infinite;
    `;

    // Inner: fish image + optional flip/pulse
    const bodyDiv = document.createElement('div');
    const isJelly = spec.type === 'jellyfish';
    bodyDiv.style.cssText = `
      width: ${w}px;
      height: ${h}px;
      background-image: url("${url}");
      background-size: 100% 100%;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      opacity: ${cfg.opacity};
      ${cfg.dir === 'left' ? 'transform: scaleX(-1);' : ''}
      ${isJelly ? `animation: jellyPulse ${cfg.wobble * 0.6}s ease-in-out ${randWobbleOffset}s infinite;` : ''}
    `;

    wobbleDiv.appendChild(bodyDiv);
    swimDiv.appendChild(wobbleDiv);
    frame.appendChild(swimDiv);
  }
}

/* ═══════════════════════════════════════════════════════════
   Profile Card
   ═══════════════════════════════════════════════════════════ */

const FRAME_SIZE = 160;

export class ProfileCard {
  private section: HTMLDivElement;
  private onContactAI: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.section = document.createElement('div');
    this.section.id = 'profile-card';
    this.section.style.cssText = `
      width: 100%;
      max-width: 480px;
      padding: 32px;
      font-family: 'Courier New', monospace;
    `;

    const expertiseHtml = EXPERTISE_FIELDS.map(f =>
      `<span style="
        font-size: 12px; padding: 3px 10px; border-radius: 3px;
        color: #61c777; border: 1px solid #1c2e1c;
      ">${f}</span>`
    ).join('');

    this.section.innerHTML = `
      <!-- Theme toggle -->
      <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span id="theme-label" style="font-size: 10px; color: #959da5; letter-spacing: 0.5px;">dark mode</span>
        <div id="theme-toggle" style="
          display: flex; align-items: center;
          background: #181e2c; border: 1px solid #283040; border-radius: 14px;
          padding: 2px; cursor: pointer; width: 56px; height: 26px;
          position: relative; transition: background 0.3s;
        ">
          <span style="font-size: 12px; position: absolute; left: 5px; top: 3px;">🌙</span>
          <span style="font-size: 12px; position: absolute; right: 5px; top: 3px;">🐰</span>
          <div id="theme-knob" style="
            width: 20px; height: 20px; border-radius: 50%;
            background: #283040; position: absolute; left: 2px;
            transition: left 0.3s, background 0.3s;
            z-index: 1;
          "></div>
        </div>
      </div>

      <!-- Portrait circle = aquarium porthole -->
      <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
        <div id="portrait-frame" style="
          width: ${FRAME_SIZE}px; height: ${FRAME_SIZE}px;
          border-radius: 50%;
          border: 3px solid #1c3050;
          background: radial-gradient(circle, #0c2040 0%, #081828 50%, #060e18 100%);
          position: relative;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 0 20px rgba(60, 140, 220, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s, margin 0.3s;
        "></div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <div style="color: #e0e8f0; font-size: 20px; font-weight: bold;">Dongha Geum</div>
          <span id="status-dot" style="
            display: inline-block; width: 8px; height: 8px;
            background: #3ddc84; border-radius: 50%;
            animation: statusPulse 2s ease-in-out infinite;
          "></span>
        </div>
        <div style="color: #61c777; font-size: 12px;">Software Developer</div>
      </div>

      <!-- Links -->
      <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
        <a href="https://github.com/coralmux" target="_blank" style="
          color: #a0a8b8; text-decoration: none; font-size: 11px;
          border: 1px solid #283040; padding: 5px 14px; border-radius: 4px;
          display: inline-flex; align-items: center; gap: 6px;
        "><svg width="12" height="12" viewBox="0 0 8 8" style="image-rendering: pixelated;">
          <style>
            .gh-body { animation: ghGlow 3s ease-in-out infinite; }
            @keyframes ghGlow {
              0%, 100% { fill: #a0a8b8; }
              50% { fill: #61c777; }
            }
          </style>
          <rect class="gh-body" x="2" y="0" width="4" height="1"/>
          <rect class="gh-body" x="1" y="1" width="1" height="1"/>
          <rect class="gh-body" x="6" y="1" width="1" height="1"/>
          <rect class="gh-body" x="0" y="2" width="1" height="3"/>
          <rect class="gh-body" x="7" y="2" width="1" height="3"/>
          <rect class="gh-body" x="1" y="2" width="6" height="3"/>
          <rect x="2" y="3" width="1" height="1" fill="#0b1018"/>
          <rect x="5" y="3" width="1" height="1" fill="#0b1018"/>
          <rect class="gh-body" x="1" y="5" width="2" height="1"/>
          <rect class="gh-body" x="5" y="5" width="2" height="1"/>
          <rect class="gh-body" x="1" y="6" width="1" height="1"/>
          <rect class="gh-body" x="6" y="6" width="1" height="1"/>
          <rect class="gh-body" x="2" y="7" width="1" height="1"/>
          <rect class="gh-body" x="5" y="7" width="1" height="1"/>
        </svg>GitHub</a>
        <a href="https://www.linkedin.com/in/coralmux/" target="_blank" style="
          color: #a0a8b8; text-decoration: none; font-size: 11px;
          border: 1px solid #283040; padding: 5px 14px; border-radius: 4px;
          display: inline-flex; align-items: center; gap: 6px;
        "><svg width="12" height="12" viewBox="0 0 8 8" style="image-rendering: pixelated; animation: iconPulse 3s ease-in-out infinite;">
          <rect x="0" y="0" width="8" height="8" rx="1" fill="#283040"/>
          <rect x="1" y="3" width="2" height="4" fill="#5b9bd5"/>
          <rect x="1" y="1" width="2" height="2" fill="#5b9bd5"/>
          <rect x="4" y="3" width="3" height="4" fill="#5b9bd5"/>
          <rect x="4" y="2" width="3" height="1" fill="#5b9bd5"/>
          <rect x="6" y="1" width="1" height="1" fill="#5b9bd5"/>
        </svg>LinkedIn</a>
        <a href="https://ignis.kr" target="_blank" style="
          color: #a0a8b8; text-decoration: none; font-size: 11px;
          border: 1px solid #283040; padding: 5px 14px; border-radius: 4px;
          display: inline-flex; align-items: center; gap: 6px;
        "><svg width="12" height="14" viewBox="0 0 8 9" style="image-rendering: pixelated; animation: iconFlicker 2s ease-in-out infinite;">
          <rect x="2" y="0" width="1" height="1" fill="#cc2d10"/>
          <rect x="5" y="0" width="1" height="1" fill="#cc2d10"/>
          <rect x="1" y="1" width="2" height="1" fill="#cc2d10"/>
          <rect x="4" y="1" width="2" height="1" fill="#cc2d10"/>
          <rect x="1" y="2" width="1" height="1" fill="#cc2d10"/>
          <rect x="4" y="2" width="1" height="1" fill="#cc2d10"/>
          <rect x="6" y="2" width="1" height="1" fill="#cc2d10"/>
          <rect x="0" y="3" width="1" height="1" fill="#cc2d10"/>
          <rect x="2" y="3" width="2" height="1" fill="#cc2d10"/>
          <rect x="6" y="3" width="1" height="1" fill="#cc2d10"/>
          <rect x="0" y="4" width="1" height="1" fill="#e83a15"/>
          <rect x="2" y="4" width="3" height="1" fill="#e83a15"/>
          <rect x="6" y="4" width="1" height="1" fill="#e83a15"/>
          <rect x="0" y="5" width="2" height="1" fill="#cc2d10"/>
          <rect x="3" y="5" width="1" height="1" fill="#cc2d10"/>
          <rect x="5" y="5" width="1" height="1" fill="#cc2d10"/>
          <rect x="1" y="6" width="2" height="1" fill="#e83a15"/>
          <rect x="4" y="6" width="2" height="1" fill="#e83a15"/>
          <rect x="2" y="7" width="3" height="1" fill="#cc2d10"/>
          <rect x="3" y="8" width="1" height="1" fill="#cc2d10"/>
        </svg>Blog</a>
        <span id="contact-ai-btn" style="
          color: #a0a8b8; text-decoration: none; font-size: 11px;
          border: 1px solid #283040; padding: 5px 14px; border-radius: 4px;
          display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
        "><svg width="12" height="12" viewBox="0 0 8 8" style="image-rendering: pixelated;">
          <style>
            .ct-dot { animation: ctTyping 1.5s ease-in-out infinite; }
            .ct-dot2 { animation: ctTyping 1.5s ease-in-out 0.3s infinite; }
            .ct-dot3 { animation: ctTyping 1.5s ease-in-out 0.6s infinite; }
            @keyframes ctTyping {
              0%, 60%, 100% { opacity: 0.3; }
              30% { opacity: 1; }
            }
          </style>
          <!-- speech bubble -->
          <rect x="1" y="0" width="6" height="1" fill="#a0a8b8"/>
          <rect x="0" y="1" width="8" height="4" fill="#a0a8b8"/>
          <rect x="1" y="5" width="6" height="1" fill="#a0a8b8"/>
          <!-- tail -->
          <rect x="1" y="6" width="2" height="1" fill="#a0a8b8"/>
          <rect x="0" y="7" width="1" height="1" fill="#a0a8b8"/>
          <!-- typing dots -->
          <rect class="ct-dot" x="2" y="3" width="1" height="1" fill="#0b1018"/>
          <rect class="ct-dot2" x="4" y="3" width="1" height="1" fill="#0b1018"/>
          <rect class="ct-dot3" x="6" y="3" width="1" height="1" fill="#0b1018"/>
        </svg>Contact(AI)</span>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #181e2c; margin-bottom: 16px;"></div>

      <!-- Career -->
      <div style="font-size: 11px; margin-bottom: 8px;">
        <span style="color: #72b3e8;">CAREER</span>
        <span style="color: #959da5;"> - Hamonsoft Co., Ltd. &middot; 2010 - Present (17th Year)</span>
      </div>
      <div id="career-list" style="padding: 0 0 12px 0; font-size: 11px; color: #d6dbe0;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #181e2c;">
          <span>Vice Director, R&amp;D Center</span>
          <span style="color: #959da5; font-size: 10px;">2025 ~</span>
        </div>
        <div class="career-extra" style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #181e2c;">
          <span>Big Data Team Leader</span>
          <span style="color: #959da5; font-size: 10px;">~ 2024</span>
        </div>
        <div class="career-extra" style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #181e2c;">
          <span>Core Team, TMS Part Leader</span>
          <span style="color: #959da5; font-size: 10px;">~ 2019</span>
        </div>
        <div class="career-extra" style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #181e2c;">
          <span>Core Team, App Part Leader</span>
          <span style="color: #959da5; font-size: 10px;">~ 2016</span>
        </div>
        <div class="career-extra" style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #181e2c;">
          <span>Web Team, RIA Developer</span>
          <span style="color: #959da5; font-size: 10px;">~ 2013</span>
        </div>
        <div id="career-toggle" style="display: none; padding: 4px 0; color: #959da5; font-size: 10px; cursor: pointer; text-align: center;">
          ▼ more
        </div>
      </div>

      <!-- Expertise -->
      <div style="color: #72b3e8; font-size: 12px; margin-bottom: 10px;">EXPERTISE</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${expertiseHtml}
      </div>
    `;

    // Icon animations
    const iconStyle = document.createElement('style');
    iconStyle.textContent = `
      @keyframes iconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
      @keyframes iconFlicker {
        0%, 100% { opacity: 1; transform: scale(1); }
        20% { opacity: 0.7; transform: scale(0.95); }
        40% { opacity: 1; transform: scale(1.05); }
        60% { opacity: 0.8; transform: scale(0.97); }
        80% { opacity: 1; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(iconStyle);

    // Build aquarium inside portrait circle
    const frame = this.section.querySelector('#portrait-frame') as HTMLDivElement;
    addFishToFrame(frame);
    frame.appendChild(createPortraitCanvas(FRAME_SIZE));

    // Contact(AI) button handler
    const contactBtn = this.section.querySelector('#contact-ai-btn') as HTMLSpanElement;
    contactBtn.addEventListener('click', () => {
      if (this.onContactAI) this.onContactAI();
    });

    // Theme toggle handler
    const toggle = this.section.querySelector('#theme-toggle') as HTMLDivElement;
    const knob = this.section.querySelector('#theme-knob') as HTMLDivElement;
    const label = this.section.querySelector('#theme-label') as HTMLSpanElement;
    toggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      knob.style.left = isLight ? '32px' : '2px';
      knob.style.background = isLight ? '#f5e6d0' : '#283040';
      toggle.style.background = isLight ? '#e0d8d0' : '#181e2c';
      toggle.style.borderColor = isLight ? '#c8c0b8' : '#283040';
      label.textContent = isLight ? 'light mode' : 'dark mode';
    });

    // Responsive career collapse: fold when profile-section overflows
    const careerExtras = this.section.querySelectorAll('.career-extra') as NodeListOf<HTMLDivElement>;
    const careerToggle = this.section.querySelector('#career-toggle') as HTMLDivElement;
    const SCALE = 0.55;
    const SHRINK_MARGIN = -Math.round(FRAME_SIZE * (1 - SCALE) / 2);
    let collapsed = false;
    let expanded = false; // user clicked "more" → portrait shrunk + all careers shown

    const shrinkPortrait = () => {
      frame.style.transform = `scale(${SCALE})`;
      frame.style.marginTop = `${SHRINK_MARGIN}px`;
      frame.style.marginBottom = `${SHRINK_MARGIN}px`;
    };

    const restorePortrait = () => {
      frame.style.transform = 'scale(1)';
      frame.style.marginTop = '0';
      frame.style.marginBottom = '16px';
    };

    const collapse = () => {
      collapsed = true;
      expanded = false;
      careerExtras.forEach(el => el.style.display = 'none');
      careerToggle.style.display = 'block';
      careerToggle.textContent = '▼ more';
      restorePortrait();
    };

    const expand = () => {
      collapsed = false;
      expanded = false;
      careerExtras.forEach(el => el.style.display = 'flex');
      careerToggle.style.display = 'none';
      restorePortrait();
    };

    careerToggle.addEventListener('click', () => {
      if (collapsed) {
        // Shrink portrait + show all careers
        expanded = true;
        collapsed = false;
        shrinkPortrait();
        careerExtras.forEach(el => el.style.display = 'flex');
        careerToggle.style.display = 'block';
        careerToggle.textContent = '▲ less';
      } else if (expanded) {
        collapse();
      }
    });

    const observer = new ResizeObserver(() => {
      if (expanded) return; // user is viewing expanded mode, don't auto-collapse
      if (container.scrollHeight > container.clientHeight) {
        if (!collapsed) collapse();
      } else if (collapsed) {
        // Tentatively expand, revert if it causes overflow
        expand();
        requestAnimationFrame(() => {
          if (container.scrollHeight > container.clientHeight) collapse();
        });
      }
    });
    observer.observe(container);

    container.appendChild(this.section);
  }

  setOnContactAI(callback: () => void): void {
    this.onContactAI = callback;
  }
}
