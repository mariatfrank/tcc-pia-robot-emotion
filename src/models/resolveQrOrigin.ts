import { guessLanHttpOrigin, isLocalhostHostname } from "./lanOriginGuess";

function originReferencesLocalhost(origin: string): boolean {
  try {
    const h = new URL(origin).hostname.toLowerCase();
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  } catch {
    return true;
  }
}

export async function resolveQrOriginBase(): Promise<string> {
  if (typeof window === "undefined") return "";
  if (!isLocalhostHostname(window.location.hostname)) {
    return window.location.origin.replace(/\/+$/, "");
  }
  const port = window.location.port || "5173";
  try {
    const r = await fetch("/__pia_lan_origin");
    if (r.ok) {
      const j = (await r.json()) as { origin?: string };
      const o = j.origin?.replace(/\/+$/, "") ?? "";
      if (o && !originReferencesLocalhost(o)) return o;
    }
  } catch {
    }
  const lan = await guessLanHttpOrigin(port);
  if (lan) return lan.replace(/\/+$/, "");
  const envRaw = import.meta.env.VITE_DEV_LAN_ORIGIN?.trim();
  if (envRaw) return envRaw.replace(/\/+$/, "");
  return window.location.origin.replace(/\/+$/, "");
}

