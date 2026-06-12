/**
 * Pixel sprite system — characters are defined as text grids, rendered to
 * <canvas> at runtime. Each char maps to a palette color, "." = transparent.
 */

export type Palette = Record<string, string>;
export type SpriteGrid = string[];

export interface CharacterDef {
  id: string;
  name: string;
  cls: string;
  flavor: string;
  accent: string;
  accentDim: string;
  stats: { label: string; value: number }[];
  palette: Palette;
  idle: SpriteGrid;
  walk: SpriteGrid;
}

/* ------------------------------------------------------------------ */
/* BYTE — the hooded debugger                                          */
/* ------------------------------------------------------------------ */
const BYTE_PALETTE: Palette = {
  G: "#52b788", // hood trim
  H: "#081c15", // hood inner
  B: "#2d6a4f", // hoodie
  D: "#1b4332", // hoodie shade
  S: "#ffd6a5", // skin
  A: "#00ff9f", // visor glow
  P: "#14213d", // pants
  T: "#000814", // boots
};

const BYTE_IDLE: SpriteGrid = [
  "..GGGGGGGG..",
  ".GGHHHHHHGG.",
  ".GHHHHHHHHG.",
  ".GHAAAAAAHG.",
  ".GHSSSSSSHG.",
  "..GSSSSSSG..",
  "..DBBBBBBD..",
  ".BBBBBBBBBB.",
  ".SBBBBBBBBS.",
  ".SBBBBBBBBS.",
  "..BBBBBBBB..",
  "...PPPPPP...",
  "...PP..PP...",
  "...PP..PP...",
  "...TT..TT...",
  "..TTT..TTT..",
];

const BYTE_WALK: SpriteGrid = [
  "..GGGGGGGG..",
  ".GGHHHHHHGG.",
  ".GHHHHHHHHG.",
  ".GHAAAAAAHG.",
  ".GHSSSSSSHG.",
  "..GSSSSSSG..",
  "..DBBBBBBD..",
  ".BBBBBBBBBB.",
  "..SBBBBBBS..",
  "..SBBBBBBS..",
  "..BBBBBBBB..",
  "...PPPPPP...",
  "..PP....PP..",
  "..PP....PP..",
  "..TT....TT..",
  ".TTT....TTT.",
];

/* ------------------------------------------------------------------ */
/* ARIA — the hard-hat architect                                       */
/* ------------------------------------------------------------------ */
const ARIA_PALETTE: Palette = {
  H: "#ffb703", // hat
  R: "#fb8500", // hat brim
  S: "#ffd6a5", // skin
  A: "#1d3557", // eyes
  B: "#e76f51", // shirt
  Y: "#ffe066", // tool belt
  P: "#264653", // pants
  T: "#1d2d44", // boots
};

const ARIA_IDLE: SpriteGrid = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  ".RRRRRRRRRR.",
  "..SSSSSSSS..",
  "..SASSSSAS..",
  "...SSSSSS...",
  "..BBBBBBBB..",
  ".BBBBBBBBBB.",
  ".SBBBBBBBBS.",
  ".SBBBBBBBBS.",
  "..BYYYYYYB..",
  "...PPPPPP...",
  "...PP..PP...",
  "...PP..PP...",
  "...TT..TT...",
  "..TTT..TTT..",
];

const ARIA_WALK: SpriteGrid = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  ".RRRRRRRRRR.",
  "..SSSSSSSS..",
  "..SASSSSAS..",
  "...SSSSSS...",
  "..BBBBBBBB..",
  ".BBBBBBBBBB.",
  "..SBBBBBBS..",
  "..SBBBBBBS..",
  "..BYYYYYYB..",
  "...PPPPPP...",
  "..PP....PP..",
  "..PP....PP..",
  "..TT....TT..",
  ".TTT....TTT.",
];

/* ------------------------------------------------------------------ */
/* NOVA — the creator                                                  */
/* ------------------------------------------------------------------ */
const NOVA_PALETTE: Palette = {
  H: "#9d4edd", // hair
  D: "#7b2cbf", // hair shade
  S: "#ffd6a5", // skin
  A: "#240046", // eyes
  B: "#f72585", // shirt
  W: "#ffffff", // shirt detail
  P: "#3a0ca3", // pants
  T: "#240046", // boots
};

const NOVA_IDLE: SpriteGrid = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  ".HSSSSSSSSH.",
  ".HSASSSSASH.",
  ".D.SSSSSS.D.",
  "..BBBBBBBB..",
  ".BBBWWBBBBB.",
  ".SBBWWBBBBS.",
  ".SBBBBBBBBS.",
  "..BBBBBBBB..",
  "...PPPPPP...",
  "...PP..PP...",
  "...PP..PP...",
  "...TT..TT...",
  "..TTT..TTT..",
];

const NOVA_WALK: SpriteGrid = [
  "...HHHHHH...",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  ".HSSSSSSSSH.",
  ".HSASSSSASH.",
  ".D.SSSSSS.D.",
  "..BBBBBBBB..",
  ".BBBWWBBBBB.",
  "..SBWWBBBS..",
  "..SBBBBBBS..",
  "..BBBBBBBB..",
  "...PPPPPP...",
  "..PP....PP..",
  "..PP....PP..",
  "..TT....TT..",
  ".TTT....TTT.",
];

export const CHARACTERS: CharacterDef[] = [
  {
    id: "byte",
    name: "BYTE",
    cls: "The Debugger",
    flavor: "Sees the matrix in every stack trace. Ships fixes before the bug report lands.",
    accent: "#00ff9f",
    accentDim: "rgba(0, 255, 159, 0.15)",
    stats: [
      { label: "LOGIC", value: 92 },
      { label: "SPEED", value: 78 },
      { label: "COFFEE", value: 99 },
    ],
    palette: BYTE_PALETTE,
    idle: BYTE_IDLE,
    walk: BYTE_WALK,
  },
  {
    id: "aria",
    name: "ARIA",
    cls: "The Architect",
    flavor: "Draws blueprints in her sleep. Builds systems that outlive trends.",
    accent: "#ffb703",
    accentDim: "rgba(255, 183, 3, 0.15)",
    stats: [
      { label: "DESIGN", value: 85 },
      { label: "LOGIC", value: 90 },
      { label: "GRIT", value: 96 },
    ],
    palette: ARIA_PALETTE,
    idle: ARIA_IDLE,
    walk: ARIA_WALK,
  },
  {
    id: "nova",
    name: "NOVA",
    cls: "The Creator",
    flavor: "Ships pixels with personality. Every interface tells a story.",
    accent: "#f72585",
    accentDim: "rgba(247, 37, 133, 0.15)",
    stats: [
      { label: "DESIGN", value: 97 },
      { label: "SPEED", value: 82 },
      { label: "VIBES", value: 99 },
    ],
    palette: NOVA_PALETTE,
    idle: NOVA_IDLE,
    walk: NOVA_WALK,
  },
];

/** Renders a sprite grid onto a canvas, pixel-perfect. */
export function drawSprite(
  canvas: HTMLCanvasElement,
  grid: SpriteGrid,
  palette: Palette,
  scale: number,
) {
  const w = grid[0].length;
  const h = grid.length;
  if (canvas.width !== w * scale) canvas.width = w * scale;
  if (canvas.height !== h * scale) canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < h; y++) {
    const row = grid[y];
    for (let x = 0; x < w; x++) {
      const color = palette[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}
