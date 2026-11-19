// Pixel-art sprites, authored as character grids and baked to tiny canvases.
// '.' is transparent; every other character is looked up in the palette.

export const PALETTE: Record<string, string> = {
  o: "#140c2b", // outline
  h: "#7c3aed", // hood
  H: "#a78bfa", // hood highlight
  k: "#1e1b4b", // face shadow
  v: "#22d3ee", // visor
  V: "#cffafe", // visor shine
  b: "#5b21b6", // body
  B: "#8b5cf6", // body highlight
  g: "#facc15", // belt buckle
  l: "#4338ca", // legs
  f: "#e2e8f0", // shoes
  // bug
  G: "#d9f99d",
  c: "#a3e635",
  w: "#ffffff",
  K: "#14532d",
  O: "#1a2e05",
};

// Hero: 12×14, facing right. Upper body is shared, legs change per frame.
const HERO_TOP = [
  "...ooooo....",
  "..oHHHhho...",
  ".oHHhhhhho..",
  ".oHhhhokkko.",
  ".ohhhokvVvo.",
  ".ohhhokvvvo.",
  ".oohhhokkko.",
  "..oobbbooo..",
  "..obBbbbbo..",
  "..obBbbgbo..",
  "...obbbbo...",
];

const LEGS: Record<string, string[]> = {
  idle: ["....ll..ll..", "....ll..ll..", "....fff.fff."],
  run1: ["...ll...ll..", "..ll.....ll.", ".fff.....fff"],
  run2: ["....lll.....", "....ll......", "....fff....."],
  run3: ["....ll.ll...", "...ll...ll..", "..fff...fff."],
  jump: ["...ll.ll....", "..ff..ll....", "......fff..."],
  fall: ["...ll...ll..", "...ll...ll..", "..fff...fff."],
};

export type HeroFrame = "idle" | "run1" | "run2" | "run3" | "jump" | "fall";
export const RUN_CYCLE: HeroFrame[] = ["run1", "run2", "run3", "run2"];

const BUG = [
  [
    "..O....O..",
    "...O..O...",
    "..OOOOOO..",
    ".OccGGccO.",
    "OccwKcwKcO",
    "OccccccccO",
    ".O.O..O.O.",
  ],
  [
    "..O....O..",
    "...O..O...",
    "..OOOOOO..",
    ".OccGGccO.",
    "OccwKcwKcO",
    "OccccccccO",
    "O.O....O.O",
  ],
];

function bake(rows: string[], flip: boolean): HTMLCanvasElement {
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === "." || ch === " ") continue;
      ctx.fillStyle = PALETTE[ch] ?? "#ff00ff";
      ctx.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }
  }
  return c;
}

export type SpriteSheet = {
  hero: Record<HeroFrame, { r: HTMLCanvasElement; l: HTMLCanvasElement }>;
  bug: HTMLCanvasElement[];
};

export function buildSprites(): SpriteSheet {
  const hero = {} as SpriteSheet["hero"];
  for (const key of Object.keys(LEGS) as HeroFrame[]) {
    const rows = [...HERO_TOP, ...LEGS[key]];
    hero[key] = { r: bake(rows, false), l: bake(rows, true) };
  }
  return { hero, bug: BUG.map((b) => bake(b, false)) };
}
