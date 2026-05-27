import type { EmotionType } from "./types";

const V = "/olhar-emocional-assets/videos";

const FILE = {
  neutro: `${V}/Neutro.mp4`,
  alegria: `${V}/Alegria_audio.mp4`,
  medo: `${V}/Medo_audio.mp4`,
  surpresa: `${V}/Surpresa_audio.mp4`,
  raiva: `${V}/Raiva_audio.mp4`,
} as const;

export function videoSrcForEmotion(emotion: EmotionType): string {
  switch (emotion) {
    case "IDLE":
      return FILE.neutro;
    case "HAPPY":
    case "CELEBRATING":
      return FILE.alegria;
    case "SAD":
      return FILE.medo;
    case "SURPRISED":
      return FILE.surpresa;
    case "FOCUSED":
      return FILE.neutro;
    default:
      return FILE.neutro;
  }
}

export function idleOlharVideo(): string {
  return FILE.neutro;
}

export function happyOlharVideo(): string {
  return FILE.alegria;
}
