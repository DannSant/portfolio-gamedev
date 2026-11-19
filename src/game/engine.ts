// A tiny canvas platformer that plays itself ("attract mode") until the
// visitor takes over with the keyboard or a tap.
import { buildSprites, RUN_CYCLE, type HeroFrame, type SpriteSheet } from "./sprites";
import { scoreStore } from "./scoreStore";

export type GameMode = "demo" | "keys" | "touch";
export type GameKey = "left" | "right" | "jump";

type Plat = { x: number; y: number; w: number; solid: boolean };
type Coin = { x: number; y: number; alive: boolean; phase: number };
type Bug = { x: number; y: number; vx: number; min: number; max: number; alive: boolean; dead: number; plat: Plat };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number; g: number };
type FloatText = { x: number; y: number; text: string; life: number; color: string };
type Star = { x: number; y: number; p: number; b: number };
type Node = { x: number; y: number; px: number; py: number };

// Physics, in logical pixels and seconds.
const G = 640;
const JUMP_V = 240;
const RUN = 74;
const ACCEL = 900;
const FRICTION = 1100;
const MAX_FALL = 420;
const PW = 8;
const PH = 14;
const STEP = 1 / 120;
const COYOTE = 0.08;
const BUFFER = 0.12;
const LEDGE_H = 6;
const BUG_W = 10;
const BUG_H = 7;
const AIR_TIME = (2 * JUMP_V) / G;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const approach = (v: number, t: number, d: number) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
/** Time until a jump lands on a surface `up` pixels higher than take-off. */
function landTime(up: number) {
  const disc = JUMP_V * JUMP_V - 2 * G * Math.max(0, up);
  return (JUMP_V + Math.sqrt(Math.max(0, disc))) / G;
}

export class PlatformerGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteSheet;
  private onMode: (m: GameMode) => void;

  private W = 320;
  private H = 180;
  private zoneTop = 100;
  private horizon = 120;
  private gMin = 130;
  private gMax = 160;

  private plats: Plat[] = [];
  private coins: Coin[] = [];
  private bugs: Bug[] = [];
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private stars: Star[] = [];
  private scarf: Node[] = [];
  private genX = 0;
  private genY = 0;
  private camX = 0;

  private p = {
    x: 0, y: 0, vx: 0, vy: 0, facing: 1, anim: 0, hurt: 0, coyote: 0, buffer: 0,
    onGround: false, ground: null as Plat | null, lastSafe: null as Plat | null,
  };

  private mode: GameMode = "demo";
  private input = { left: false, right: false, jump: false };
  private idle = 0;
  private time = 0;
  private rainbow = 0;
  private acc = 0;
  private last = 0;
  private raf = 0;
  private running = false;

  private skyGrad: CanvasGradient | null = null;
  private hazeGrad: CanvasGradient | null = null;
  private sun: HTMLCanvasElement | null = null;
  private sunX = 0;
  private sunY = 0;
  private shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  private nextShoot = 3;

  constructor(canvas: HTMLCanvasElement, onMode: (m: GameMode) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.sprites = buildSprites();
    this.onMode = onMode;
  }

  // ───────────────────────────── setup ─────────────────────────────

  resize(cssW: number, cssH: number, zoneTopCss: number) {
    const scale = clamp(Math.round(Math.min(cssH / 220, cssW / 250)), 2, 5);
    this.W = Math.ceil(cssW / scale);
    this.H = Math.ceil(cssH / scale);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.canvas.style.width = `${this.W * scale}px`;
    this.canvas.style.height = `${this.H * scale}px`;
    this.ctx.imageSmoothingEnabled = false;

    const { W, H } = this;
    this.zoneTop = Math.round(zoneTopCss / scale);
    const zoneH = H - this.zoneTop;
    this.horizon = Math.round(this.zoneTop + zoneH * 0.22);
    this.gMin = Math.round(Math.min(this.zoneTop + Math.max(48, zoneH * 0.45), H - 28));
    this.gMax = Math.round(Math.max(this.gMin + 6, Math.min(this.zoneTop + zoneH * 0.85, H - 12)));

    const sky = this.ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#07040f");
    sky.addColorStop(0.45, "#1a0b3b");
    sky.addColorStop(Math.min(0.95, this.horizon / H), "#4a1a6b");
    sky.addColorStop(1, "#2a0f48");
    this.skyGrad = sky;

    const haze = this.ctx.createLinearGradient(0, this.horizon - 10, 0, H);
    haze.addColorStop(0, "rgba(244,114,182,0)");
    haze.addColorStop(0.25, "rgba(244,114,182,0.10)");
    haze.addColorStop(1, "rgba(11,7,24,0.55)");
    this.hazeGrad = haze;

    this.stars = Array.from({ length: Math.round((W * this.horizon) / 260) }, () => ({
      x: Math.random() * W,
      y: Math.random() * this.horizon * 0.95,
      p: Math.random() * Math.PI * 2,
      b: Math.random(),
    }));

    this.buildSun();
    this.reset();
  }

  private buildSun() {
    const r = Math.round(clamp(this.W * 0.11, 18, 42));
    const c = document.createElement("canvas");
    c.width = r * 2;
    c.height = r * 2;
    const ctx = c.getContext("2d")!;
    const top = [253, 224, 71];
    const bottom = [236, 72, 153];
    for (let y = 0; y < r * 2; y++) {
      const dy = y - r + 0.5;
      const half = Math.sqrt(Math.max(0, r * r - dy * dy));
      if (half <= 0) continue;
      // retro stripes that thicken towards the bottom
      if (dy > -r * 0.1) {
        const band = Math.floor((dy + r * 0.1) / 5);
        if ((dy + r * 0.1) % 5 < Math.min(3, 0.6 + band * 0.55)) continue;
      }
      const t = y / (r * 2);
      ctx.fillStyle = `rgb(${top.map((v, i) => Math.round(v + (bottom[i] - v) * t)).join(",")})`;
      ctx.fillRect(Math.round(r - half), y, Math.round(half * 2), 1);
    }
    this.sun = c;
    this.sunX = Math.round(this.W * 0.78 - r);
    this.sunY = Math.round(this.horizon - r * 1.55);
  }

  private reset() {
    this.plats = [];
    this.coins = [];
    this.bugs = [];
    this.particles = [];
    this.texts = [];
    const y0 = Math.round((this.gMin + this.gMax) / 2);
    const first: Plat = { x: -40, y: y0, w: Math.max(150, Math.round(this.W * 0.45)), solid: true };
    this.plats.push(first);
    this.genX = first.x + first.w;
    this.genY = y0;
    const p = this.p;
    p.x = 24;
    p.y = y0 - PH;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    p.ground = first;
    p.lastSafe = first;
    p.hurt = 0;
    this.camX = p.x - this.W * 0.32;
    this.scarf = Array.from({ length: 7 }, () => ({ x: p.x, y: p.y + 7, px: p.x, py: p.y + 7 }));
    this.generate();
  }

  // ─────────────────────────── level gen ───────────────────────────

  private generate() {
    while (this.genX < this.camX + this.W + 140) this.addSegment();
    const cutoff = this.camX - this.W;
    while (this.plats.length > 2 && this.plats[0].x + this.plats[0].w < cutoff) this.plats.shift();
    this.coins = this.coins.filter((c) => c.x > cutoff);
    this.bugs = this.bugs.filter((b) => b.x > cutoff && (b.alive || b.dead > 0));
  }

  private addSegment() {
    const fromX = this.genX;
    const fromY = this.genY;
    let ny = Math.round(clamp(fromY + rand(-20, 20), this.gMin, this.gMax));
    if (fromY - ny > 22) ny = fromY - 22;
    const up = fromY - ny;
    const maxGap = (RUN * landTime(up) - 5) * 0.82;
    const gap = Math.round(rand(14, Math.max(16, maxGap)));
    const w = Math.round(rand(52, 150));
    const x = fromX + gap;
    const pillar: Plat = { x, y: ny, w, solid: true };
    this.plats.push(pillar);

    if (Math.random() < 0.65) this.arcCoins(fromX, fromY, x, ny);

    const roll = Math.random();
    if (w >= 96 && roll < 0.45) {
      const lw = Math.round(rand(24, 38));
      const lx = x + Math.round(rand(40, w - 22 - lw));
      const ly = ny - Math.round(rand(28, 34));
      this.plats.push({ x: lx, y: ly, w: lw, solid: false });
      for (let i = 0; i < 3; i++) this.coins.push({ x: lx + lw / 2 + (i - 1) * 8, y: ly - 8, alive: true, phase: i });
    } else if (w >= 84 && roll < 0.85) {
      const min = x + 16;
      const max = x + w - 16 - BUG_W;
      this.bugs.push({ x: (min + max) / 2, y: ny - BUG_H, vx: Math.random() < 0.5 ? -14 : 14, min, max, alive: true, dead: 0, plat: pillar });
    } else if (Math.random() < 0.6) {
      const n = clamp(Math.floor((w - 30) / 10), 2, 5);
      for (let i = 0; i < n; i++) this.coins.push({ x: x + w / 2 + (i - (n - 1) / 2) * 10, y: ny - 9, alive: true, phase: i * 0.7 });
    }

    this.genX = x + w;
    this.genY = ny;
  }

  /** Lay coins along the exact arc the demo AI will take across a gap. */
  private arcCoins(edgeX: number, fromY: number, toX: number, toY: number) {
    let x = edgeX - PW - 3;
    let y = fromY - PH;
    let vy = -JUMP_V;
    const pts: [number, number][] = [];
    for (let i = 0; i < 400; i++) {
      vy = Math.min(MAX_FALL, vy + G * STEP);
      x += RUN * STEP;
      y += vy * STEP;
      pts.push([x + PW / 2, y + PH / 2]);
      if (vy > 0 && y + PH >= toY && x + PW > toX) break;
    }
    for (const f of [0.3, 0.5, 0.7]) {
      const [cx, cy] = pts[Math.floor(pts.length * f)];
      this.coins.push({ x: cx, y: cy, alive: true, phase: f * 6 });
    }
  }

  // ───────────────────────────── input ─────────────────────────────

  key(k: GameKey, down: boolean) {
    this.idle = 0;
    if (this.mode !== "keys") this.setMode("keys");
    if (k === "jump") {
      if (down && !this.input.jump) this.p.buffer = BUFFER;
      if (!down && this.p.vy < -100) this.p.vy *= 0.5; // variable jump height
    }
    this.input[k] = down;
  }

  tap() {
    this.idle = 0;
    if (this.mode === "demo") this.setMode("touch");
    this.p.buffer = BUFFER;
  }

  releaseAll() {
    this.input.left = this.input.right = this.input.jump = false;
  }

  cheat() {
    this.rainbow = 12;
    const p = this.p;
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      this.particles.push({
        x: p.x + PW / 2, y: p.y + PH / 2, vx: Math.cos(a) * rand(40, 90), vy: Math.sin(a) * rand(40, 90) - 40,
        life: 1.2, max: 1.2, color: `hsl(${i * 9},90%,65%)`, size: 2, g: 120,
      });
    }
    this.texts.push({ x: p.x + PW / 2, y: p.y - 6, text: "CHEAT MODE!", life: 2, color: "#fde047" });
    scoreStore.add(1000, "bonus");
  }

  private setMode(m: GameMode) {
    if (m === this.mode) return;
    this.mode = m;
    if (m === "demo") this.releaseAll();
    this.onMode(m);
  }

  // ──────────────────────────── loop ───────────────────────────────

  setRunning(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else {
      cancelAnimationFrame(this.raf);
    }
  }

  renderOnce() {
    this.render();
  }

  destroy() {
    this.setRunning(false);
  }

  private frame = (t: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0, (t - this.last) / 1000));
    this.last = t;
    this.acc += dt;
    while (this.acc >= STEP) {
      this.step(STEP);
      this.acc -= STEP;
    }
    this.updateScarf();
    this.generate();
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private step(dt: number) {
    const p = this.p;
    this.time += dt;
    this.rainbow = Math.max(0, this.rainbow - dt);

    if (this.mode !== "demo") {
      this.idle += dt;
      if (this.idle > (this.mode === "keys" ? 15 : 8)) this.setMode("demo");
    }

    let dir = 0;
    if (this.mode === "demo") {
      dir = 1;
      if (this.aiWantsJump()) p.buffer = BUFFER;
    } else if (this.mode === "touch") {
      dir = 1;
    } else {
      dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    }
    if (p.hurt > 0.9) dir = 0; // brief knock-back stun
    p.hurt = Math.max(0, p.hurt - dt);

    if (dir !== 0) {
      p.vx = approach(p.vx, dir * RUN, ACCEL * dt);
      p.facing = dir;
    } else {
      p.vx = approach(p.vx, 0, FRICTION * dt);
    }

    p.coyote = p.onGround ? COYOTE : p.coyote - dt;
    p.buffer -= dt;
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -JUMP_V;
      p.buffer = 0;
      p.coyote = 0;
      p.onGround = false;
      this.dust(p.x + PW / 2, p.y + PH, 4);
    }

    p.vy = Math.min(MAX_FALL, p.vy + G * dt);

    // horizontal move + pillar sides
    const prevX = p.x;
    p.x += p.vx * dt;
    const leftLimit = this.plats[0].x;
    if (p.x < leftLimit) {
      p.x = leftLimit;
      p.vx = 0;
    }
    for (const pl of this.plats) {
      if (!pl.solid) continue;
      if (p.x + PW > pl.x && p.x < pl.x + pl.w && p.y + PH > pl.y + 0.5) {
        p.x = prevX + PW <= pl.x + 0.01 ? pl.x - PW : pl.x + pl.w;
        p.vx = 0;
      }
    }

    // vertical move + landing
    const prevBottom = p.y + PH;
    p.y += p.vy * dt;
    const wasGround = p.onGround;
    p.onGround = false;
    if (p.vy >= 0) {
      for (const pl of this.plats) {
        if (p.x + PW > pl.x && p.x < pl.x + pl.w && prevBottom <= pl.y + 0.01 && p.y + PH >= pl.y) {
          if (!wasGround && p.vy > 160) this.dust(p.x + PW / 2, pl.y, 5);
          p.y = pl.y - PH;
          p.vy = 0;
          p.onGround = true;
          p.ground = pl;
          if (pl.solid) p.lastSafe = pl;
          break;
        }
      }
    }
    if (!p.onGround) p.ground = null;

    if (p.onGround && Math.abs(p.vx) > 40 && Math.random() < 0.06) this.dust(p.x + (p.facing > 0 ? 0 : PW), p.y + PH, 1);
    p.anim += dt * (Math.abs(p.vx) / RUN);

    // coins
    const pcx = p.x + PW / 2;
    const pcy = p.y + PH / 2;
    for (const c of this.coins) {
      if (c.alive && Math.abs(c.x - pcx) < 7 && Math.abs(c.y - pcy) < 10) {
        c.alive = false;
        scoreStore.add(10, "coin");
        this.texts.push({ x: c.x, y: c.y - 6, text: "+10", life: 0.7, color: "#fde047" });
        for (let i = 0; i < 6; i++)
          this.particles.push({ x: c.x, y: c.y, vx: rand(-40, 40), vy: rand(-60, -10), life: 0.4, max: 0.4, color: i % 2 ? "#fde047" : "#ffffff", size: 1, g: 200 });
      }
    }

    // bugs
    for (const b of this.bugs) {
      if (!b.alive) {
        b.dead -= dt;
        continue;
      }
      b.x += b.vx * dt;
      if (b.x < b.min || b.x > b.max) {
        b.x = clamp(b.x, b.min, b.max);
        b.vx *= -1;
      }
      const overlap = p.x + PW > b.x + 1 && p.x < b.x + BUG_W - 1 && p.y + PH > b.y + 1 && p.y < b.y + BUG_H;
      if (!overlap) continue;
      if (p.vy > 0 && prevBottom <= b.y + 4) {
        b.alive = false;
        b.dead = 0.5;
        p.vy = -JUMP_V * 0.6;
        scoreStore.add(50, "bug");
        this.texts.push({ x: b.x + BUG_W / 2, y: b.y - 8, text: "BUG FIXED!", life: 1, color: "#a3e635" });
        for (let i = 0; i < 10; i++)
          this.particles.push({ x: b.x + BUG_W / 2, y: b.y + 4, vx: rand(-60, 60), vy: rand(-90, -20), life: 0.6, max: 0.6, color: i % 3 ? "#a3e635" : "#d9f99d", size: 1, g: 260 });
      } else if (p.hurt <= 0) {
        p.hurt = 1.2;
        p.vx = (p.x + PW / 2 < b.x + BUG_W / 2 ? -1 : 1) * 90;
        p.vy = -140;
        this.texts.push({ x: p.x + PW / 2, y: p.y - 6, text: "OUCH", life: 0.7, color: "#f472b6" });
      }
    }

    // fell into a pit
    if (p.y > this.H + 24) this.respawn();

    for (const pt of this.particles) {
      pt.vy += pt.g * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
    for (const t of this.texts) {
      t.y -= 16 * dt;
      t.life -= dt;
    }
    this.texts = this.texts.filter((t) => t.life > 0);

    // camera
    const lead = this.mode === "keys" && p.facing < 0 ? 0.62 : 0.32;
    const target = p.x - this.W * lead;
    this.camX += (target - this.camX) * (1 - Math.exp(-3.5 * dt));
    this.camX = Math.max(this.camX, leftLimit - 10);

    // ambient shooting stars
    this.nextShoot -= dt;
    if (this.nextShoot <= 0) {
      this.nextShoot = rand(4, 9);
      this.shooting = { x: rand(this.W * 0.3, this.W), y: rand(4, this.horizon * 0.45), vx: -rand(150, 220), vy: rand(40, 70), life: 0.7 };
    }
    if (this.shooting) {
      const s = this.shooting;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) this.shooting = null;
    }
  }

  private aiWantsJump(): boolean {
    const p = this.p;
    const ground = p.ground;
    if (!p.onGround || !ground) return false;
    const front = p.x + PW + 3;
    const feet = p.y + PH;
    const end = ground.x + ground.w;

    // 1. about to run off an edge: jump, unless there's floor right below
    if (front >= end) {
      const floorBelow = this.plats.some((pl) => pl !== ground && front > pl.x && front < pl.x + pl.w && pl.y > feet - 0.5);
      return !floorBelow;
    }
    if (!ground.solid) return false;

    // 2. stomp the bug: time the jump so we land on its predicted position
    for (const b of this.bugs) {
      if (!b.alive || b.plat !== ground || b.x + BUG_W < p.x) continue;
      const bx = clamp(b.x + b.vx * AIR_TIME, b.min, b.max) + BUG_W / 2;
      const land = p.x + RUN * AIR_TIME + PW / 2;
      if (land >= bx - 1 && land + PW / 2 < end - 2) return true;
    }

    // 3. hop onto floating ledges for their coins
    for (const l of this.plats) {
      if (l.solid || l.x < p.x || l.x > end) continue;
      const up = feet - l.y;
      if (up < 18 || up > 42) continue;
      const landX = p.x + RUN * landTime(up);
      if (landX + PW >= l.x + 4 && landX <= l.x + l.w - PW - 2) return true;
    }
    return false;
  }

  private respawn() {
    const p = this.p;
    const safe = p.lastSafe && this.plats.includes(p.lastSafe) ? p.lastSafe : this.plats[0];
    p.x = safe.x + 6;
    p.y = safe.y - PH - 26;
    p.vx = 0;
    p.vy = 0;
    p.hurt = 1;
    for (const n of this.scarf) {
      n.x = n.px = p.x;
      n.y = n.py = p.y + 7;
    }
    for (let i = 0; i < 14; i++)
      this.particles.push({ x: p.x + PW / 2, y: p.y + PH / 2, vx: rand(-50, 50), vy: rand(-50, 50), life: 0.5, max: 0.5, color: "#c4b5fd", size: 2, g: 0 });
  }

  private dust(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++)
      this.particles.push({ x: x + rand(-3, 3), y: y - 1, vx: rand(-25, 25), vy: rand(-25, -5), life: 0.35, max: 0.35, color: "#c4b5fd", size: 1, g: 40 });
  }

  private updateScarf() {
    const p = this.p;
    const ax = p.x - 2 + (p.facing > 0 ? 3 : 8);
    const ay = p.y + 7;
    const wind = -p.facing * (0.15 + (Math.abs(p.vx) / RUN) * 0.5);
    const seg = 2;
    const nodes = this.scarf;
    nodes[0].x = ax;
    nodes[0].y = ay;
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      const vx = (n.x - n.px) * 0.86;
      const vy = (n.y - n.py) * 0.86;
      n.px = n.x;
      n.py = n.y;
      n.x += vx + wind + Math.sin(this.time * 9 + i) * 0.08;
      n.y += vy + 0.22;
    }
    for (let k = 0; k < 3; k++) {
      for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i - 1];
        const b = nodes[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        b.x = a.x + (dx / d) * seg;
        b.y = a.y + (dy / d) * seg;
      }
    }
  }

  // ─────────────────────────── rendering ───────────────────────────

  private render() {
    const { ctx, W, H } = this;
    const cam = Math.round(this.camX);

    ctx.fillStyle = this.skyGrad ?? "#120b29";
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of this.stars) {
      const tw = 0.5 + 0.5 * Math.sin(this.time * (1 + s.b * 2) + s.p);
      if (tw < 0.25) continue;
      const x = (((s.x - this.camX * 0.03) % W) + W) % W;
      ctx.globalAlpha = 0.35 + tw * 0.65;
      ctx.fillStyle = s.b > 0.85 ? "#a5f3fc" : "#ffffff";
      ctx.fillRect(Math.round(x), Math.round(s.y), 1, 1);
      if (s.b > 0.93 && tw > 0.8) {
        ctx.globalAlpha = 0.4;
        ctx.fillRect(Math.round(x) - 1, Math.round(s.y), 3, 1);
        ctx.fillRect(Math.round(x), Math.round(s.y) - 1, 1, 3);
      }
    }
    ctx.globalAlpha = 1;

    if (this.shooting) {
      const s = this.shooting;
      for (let i = 0; i < 8; i++) {
        ctx.globalAlpha = (1 - i / 8) * Math.min(1, s.life * 3);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(s.x - (s.vx / 60) * i * 0.5), Math.round(s.y - (s.vy / 60) * i * 0.5), 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    // sun + glow
    if (this.sun) {
      const r = this.sun.width / 2;
      const glow = ctx.createRadialGradient(this.sunX + r, this.sunY + r, r * 0.6, this.sunX + r, this.sunY + r, r * 2.4);
      glow.addColorStop(0, "rgba(244,114,182,0.35)");
      glow.addColorStop(1, "rgba(244,114,182,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(this.sunX - r * 2, this.sunY - r * 2, r * 6, r * 6);
      ctx.drawImage(this.sun, this.sunX, this.sunY);
    }

    // far mountains
    const hz = this.horizon;
    for (let x = 0; x < W; x++) {
      const wx = x + this.camX * 0.12;
      const h = Math.sin(wx * 0.013) * 13 + Math.sin(wx * 0.031 + 1.7) * 7 + Math.sin(wx * 0.071 + 4) * 3;
      const top = Math.round(hz - 16 + h);
      ctx.fillStyle = "#2b1458";
      ctx.fillRect(x, top, 1, H - top);
      ctx.fillStyle = "#4c2a8a";
      ctx.fillRect(x, top, 1, 1);
    }

    // city skyline
    const slot = 26;
    const off = this.camX * 0.3;
    const base = hz + 24;
    for (let i = Math.floor(off / slot) - 1; i * slot - off < W + slot; i++) {
      const bw = 12 + Math.floor(hash(i) * 12);
      const bh = 14 + Math.floor(hash(i + 99) * 40);
      const bx = Math.round(i * slot - off + hash(i + 7) * (slot - bw));
      const by = base - bh;
      ctx.fillStyle = "#170a36";
      ctx.fillRect(bx, by, bw, H - by);
      if (hash(i + 3) > 0.7) ctx.fillRect(bx + Math.floor(bw / 2), by - 5, 1, 5);
      for (let wy = 3; wy < bh - 2; wy += 4) {
        for (let wx = 2; wx < bw - 2; wx += 3) {
          const hv = hash(i * 131 + wy * 7 + wx * 13);
          if (hv < 0.68) continue;
          const flick = hash(hv * 1000 + Math.floor(this.time * 0.4 + hv * 10)) > 0.15;
          if (!flick) continue;
          ctx.fillStyle = hv > 0.93 ? "#67e8f9" : "#fbbf24";
          ctx.globalAlpha = 0.55 + (hv - 0.68);
          ctx.fillRect(bx + wx, by + wy, 1, 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = this.hazeGrad ?? "transparent";
    ctx.fillRect(0, hz - 10, W, H - hz + 10);

    // platforms
    for (const pl of this.plats) {
      const x = Math.round(pl.x) - cam;
      if (x > W || x + pl.w < 0) continue;
      if (pl.solid) this.drawPillar(x, pl.y, pl.w);
      else this.drawLedge(x, pl.y, pl.w);
    }

    // coins
    const widths = [6, 4, 2, 4];
    for (const c of this.coins) {
      if (!c.alive) continue;
      const cx = Math.round(c.x) - cam;
      if (cx < -6 || cx > W + 6) continue;
      const cy = Math.round(c.y + Math.sin(this.time * 4 + c.phase) * 1.2);
      const w = widths[Math.floor(this.time * 8 + c.phase) % 4];
      const x0 = cx - w / 2;
      ctx.fillStyle = "#b45309";
      ctx.fillRect(x0, cy - 3, w, 6);
      if (w > 2) {
        ctx.fillStyle = "#facc15";
        ctx.fillRect(x0 + 1, cy - 2, w - 2, 4);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(x0 + 1, cy - 2, 1, 3);
      } else {
        ctx.fillStyle = "#fde047";
        ctx.fillRect(x0, cy - 2, w, 4);
      }
    }

    // bugs
    for (const b of this.bugs) {
      const bx = Math.round(b.x) - cam;
      if (bx < -12 || bx > W + 12) continue;
      if (!b.alive) {
        if (b.dead <= 0) continue;
        ctx.fillStyle = "#a3e635";
        ctx.fillRect(bx, b.y + BUG_H - 2, BUG_W, 2);
        ctx.fillStyle = "#1a2e05";
        ctx.fillRect(bx + 1, b.y + BUG_H - 3, BUG_W - 2, 1);
        continue;
      }
      const img = this.sprites.bug[Math.floor(this.time * 6) % 2];
      ctx.save();
      if (b.vx > 0) {
        ctx.translate(bx + BUG_W, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, Math.round(b.y));
      } else {
        ctx.drawImage(img, bx, Math.round(b.y));
      }
      ctx.restore();
    }

    // player
    const p = this.p;
    const blink = p.hurt > 0 && Math.floor(p.hurt * 20) % 2 === 0;
    if (!blink) {
      // scarf
      this.scarf.forEach((n, i) => {
        if (i === 0) return;
        ctx.fillStyle =
          this.rainbow > 0 ? `hsl(${(i * 50 + this.time * 400) % 360},90%,62%)` : i === this.scarf.length - 1 ? "#f9a8d4" : i % 2 ? "#f472b6" : "#db2777";
        ctx.fillRect(Math.round(n.x) - cam - 1, Math.round(n.y) - 1, 2, 2);
      });

      let frame: HeroFrame = "idle";
      if (!p.onGround) frame = p.vy < 0 ? "jump" : "fall";
      else if (Math.abs(p.vx) > 8) frame = RUN_CYCLE[Math.floor(p.anim * 10) % 4];
      const s = this.sprites.hero[frame][p.facing > 0 ? "r" : "l"];
      const bob = frame === "run2" ? 1 : 0;
      ctx.drawImage(s, Math.round(p.x) - cam - 2, Math.round(p.y) + bob);
    }

    for (const pt of this.particles) {
      ctx.globalAlpha = Math.min(1, (pt.life / pt.max) * 1.5);
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x) - cam, Math.round(pt.y), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    for (const t of this.texts) {
      const x = Math.round(t.x) - cam;
      const y = Math.round(t.y);
      ctx.globalAlpha = Math.min(1, t.life * 3);
      ctx.fillStyle = "#140c2b";
      ctx.fillText(t.text, x + 1, y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, x, y);
    }
    ctx.globalAlpha = 1;
  }

  private drawPillar(x: number, y: number, w: number) {
    const { ctx, H } = this;
    ctx.fillStyle = "#1b0f3f";
    ctx.fillRect(x, y, w, H - y);
    // bricks
    ctx.fillStyle = "#2a1760";
    for (let row = 0, by = y + 5; by < H; row++, by += 7) {
      ctx.fillRect(x, by, w, 1);
      for (let bx = (row % 2) * 7 + 3; bx < w; bx += 14) ctx.fillRect(x + bx, by + 1, 1, 6);
    }
    // edges
    ctx.fillStyle = "#3b2385";
    ctx.fillRect(x, y, 1, H - y);
    ctx.fillStyle = "#120a2c";
    ctx.fillRect(x + w - 1, y, 1, H - y);
    // neon cap
    ctx.fillStyle = "rgba(34,211,238,0.25)";
    ctx.fillRect(x, y - 1, w, 1);
    ctx.fillStyle = "#a5f3fc";
    ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(x, y + 1, w, 2);
    ctx.fillStyle = "#0e7490";
    ctx.fillRect(x, y + 3, w, 1);
    // little drips under the cap
    ctx.fillStyle = "#0e7490";
    for (let i = 4; i < w - 2; i += 9) ctx.fillRect(x + i, y + 4, 1, 1 + ((i * 7) % 3));
  }

  private drawLedge(x: number, y: number, w: number) {
    const { ctx } = this;
    ctx.fillStyle = "rgba(244,114,182,0.25)";
    ctx.fillRect(x, y - 1, w, 1);
    ctx.fillStyle = "#fbcfe8";
    ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = "#f472b6";
    ctx.fillRect(x, y + 1, w, 2);
    ctx.fillStyle = "#4c1d95";
    ctx.fillRect(x, y + 3, w, LEDGE_H - 3);
    ctx.fillStyle = "#2e1065";
    ctx.fillRect(x + 1, y + LEDGE_H, w - 2, 1);
    // hover thrusters
    const flick = Math.floor(this.time * 12) % 2;
    ctx.fillStyle = "#fde047";
    ctx.fillRect(x + 3, y + LEDGE_H + 1, 2, 1 + flick);
    ctx.fillRect(x + w - 5, y + LEDGE_H + 1, 2, 2 - flick);
  }
}
