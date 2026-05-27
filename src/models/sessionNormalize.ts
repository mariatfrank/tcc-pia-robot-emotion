import type { EmotionType, SessionResponse } from "./types";

const KNOWN: EmotionType[] = [
  "IDLE",
  "FOCUSED",
  "HAPPY",
  "SAD",
  "SURPRISED",
  "CELEBRATING",
];

export function parseEmotion(raw: unknown): EmotionType {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");
  if (KNOWN.includes(s as EmotionType)) return s as EmotionType;
  return "IDLE";
}

export function normalizeSessionResponse(s: SessionResponse): SessionResponse {
  const raw = s as SessionResponse & {
    currentEmotion?: unknown;
    playStarted?: unknown;
  };
  return {
    ...s,
    playStarted: Boolean(raw.playStarted),
    currentEmotion: parseEmotion(raw.currentEmotion),
  };
}
