function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((x) => Number(x));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }
  const a = parts[0]!;
  const b = parts[1]!;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function guessLanHttpOrigin(port: string): Promise<string | null> {
  const safePort = port || "5173";
  return new Promise((resolve) => {
    let finished = false;
    const finish = (url: string | null) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(t);
      pc.onicecandidate = null;
      try {
        pc.close();
      } catch {
        }
      resolve(url);
    };

    const t = window.setTimeout(() => finish(null), 4000);

    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection({ iceServers: [] });
    } catch {
      finish(null);
      return;
    }

    const seen = new Set<string>();
    pc.onicecandidate = (ev) => {
      const raw = ev.candidate?.candidate;
      if (!raw) return;
      const m = raw.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
      if (!m) return;
      const ip = m[0];
      if (!isPrivateIPv4(ip) || seen.has(ip)) return;
      seen.add(ip);
      if (ip.startsWith("172.")) {
        seen.add(ip);
        return;
      }
      finish(`http://${ip}:${safePort}`);
    };

    try {
      pc.createDataChannel("");
    } catch {
      finish(null);
      return;
    }

    void pc
      .createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => finish(null));
  });
}

export function isLocalhostHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

