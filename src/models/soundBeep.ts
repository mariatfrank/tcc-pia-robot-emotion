let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function beep(freq: number, durSec: number) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = 0.08;
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + durSec);
}
