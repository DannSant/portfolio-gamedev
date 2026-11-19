import { useSyncExternalStore } from "react";

export type ScoreSnapshot = { score: number; coins: number; hi: number; bugs: number };

const HI_KEY = "ns-portfolio-hiscore";

function loadHi(): number {
  try {
    return Number(localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

let snapshot: ScoreSnapshot = { score: 0, coins: 0, hi: loadHi(), bugs: 0 };
const listeners = new Set<() => void>();

export const scoreStore = {
  add(points: number, kind: "coin" | "bug" | "bonus") {
    const score = snapshot.score + points;
    const hi = Math.max(snapshot.hi, score);
    snapshot = {
      score,
      hi,
      coins: snapshot.coins + (kind === "coin" ? 1 : 0),
      bugs: snapshot.bugs + (kind === "bug" ? 1 : 0),
    };
    if (hi > loadHi()) {
      try {
        localStorage.setItem(HI_KEY, String(hi));
      } catch {
        /* storage unavailable: high score just won't persist */
      }
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => snapshot,
};

export function useScore() {
  return useSyncExternalStore(scoreStore.subscribe, scoreStore.get, scoreStore.get);
}
