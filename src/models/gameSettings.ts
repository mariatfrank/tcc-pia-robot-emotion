import type { Difficulty, GameSettings } from "./types";

const KEY = "pia_robot_game_settings_v1";

export const ALLOWED_DURATION_SEC = [10, 30, 60] as const;

const DEFAULTS: GameSettings = {
  difficulty: "EASY",
  durationSec: 10,
  soundEnabled: true,
};

export function normalizeDurationSec(n: number): number {
  let match: number | undefined;
  for (const t of ALLOWED_DURATION_SEC) {
    if (t === n) match = t;
  }
  if (match !== undefined) return match;
  const arr = [...ALLOWED_DURATION_SEC];
  return arr.reduce((best, t) =>
    Math.abs(t - n) < Math.abs(best - n) ? t : best
  );
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const p = JSON.parse(raw) as Partial<GameSettings>;
    const rawDur =
      typeof p.durationSec === "number" ? p.durationSec : DEFAULTS.durationSec;
    return {
      difficulty: p.difficulty ?? DEFAULTS.difficulty,
      durationSec: normalizeDurationSec(rawDur),
      soundEnabled:
        typeof p.soundEnabled === "boolean" ? p.soundEnabled : DEFAULTS.soundEnabled,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveGameSettings(s: GameSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function difficultyLabel(d: Difficulty): string {
  switch (d) {
    case "EASY":
      return "Fácil";
    case "NORMAL":
      return "Médio";
    case "HARD":
      return "Difícil";
  }
}

export function targetScalePercent(d: Difficulty): number {
  switch (d) {
    case "EASY":
      return 100;
    case "NORMAL":
      return 72;
    case "HARD":
      return 48;
  }
}

