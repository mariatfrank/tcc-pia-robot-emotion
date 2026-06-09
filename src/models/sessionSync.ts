import type { SessionResponse } from "./types";

export function pickActivePlayingSession(
  list: SessionResponse[]
): SessionResponse | null {
  const playing = list.filter(
    (s) => s.status === "ACTIVE" && s.playStarted
  );
  if (playing.length === 0) return null;
  return playing.sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )[0]!;
}
