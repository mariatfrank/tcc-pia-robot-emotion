import { beep } from "./soundBeep";

export function playHit(sound: boolean) {
  if (sound) beep(880, 0.06);
}

export function playMiss(sound: boolean) {
  if (sound) beep(220, 0.12);
}
