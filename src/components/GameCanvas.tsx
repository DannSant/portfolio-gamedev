import { useEffect, useRef, type RefObject } from "react";
import { PlatformerGame, type GameKey, type GameMode } from "../game/engine";

const KEYMAP: Record<string, GameKey> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "jump",
  KeyW: "jump",
};

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

type Props = {
  sectionRef: RefObject<HTMLElement | null>;
  zoneRef: RefObject<HTMLElement | null>;
  onMode: (mode: GameMode) => void;
};

export default function GameCanvas({ sectionRef, zoneRef, onMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const zone = zoneRef.current;
    if (!canvas || !section || !zone) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = new PlatformerGame(canvas, onMode);
    const fit = () => {
      game.resize(section.clientWidth, section.clientHeight, zone.offsetTop);
      if (reduced) game.renderOnce();
    };
    fit();
    // The canvas text uses the pixel font; repaint once it's ready.
    document.fonts?.load('8px "Press Start 2P"').then(() => reduced && game.renderOnce());

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(fit, 120);
    });
    ro.observe(section);

    if (reduced) {
      return () => {
        ro.disconnect();
        window.clearTimeout(resizeTimer);
      };
    }

    // Only run (and only steal keys) while the hero is on screen.
    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.intersectionRatio >= 0.35;
        game.setRunning(e.isIntersecting);
        if (!inView) game.releaseAll();
      },
      { threshold: [0, 0.35] },
    );
    io.observe(section);

    let konami = 0;
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      konami = e.code === KONAMI[konami] ? konami + 1 : e.code === KONAMI[0] ? 1 : 0;
      if (konami === KONAMI.length) {
        konami = 0;
        game.cheat();
      }
      const k = KEYMAP[e.code];
      if (!k || !inView) return;
      e.preventDefault();
      if (!e.repeat) game.key(k, true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = KEYMAP[e.code];
      if (k) game.key(k, false);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      game.tap();
    };
    const onBlur = () => game.releaseAll();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    section.addEventListener("click", onClick);

    return () => {
      game.destroy();
      ro.disconnect();
      io.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      section.removeEventListener("click", onClick);
    };
  }, [sectionRef, zoneRef, onMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute left-0 top-0 -z-10 select-none [image-rendering:pixelated]"
    />
  );
}
