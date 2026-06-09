import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const olharAssetsRoot = path.resolve(
  __dirname,
  "eyesOlharEmocional/OlharEmocional/assets"
);

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

function scoreLanIp(ip: string): number {
  const [a, b] = ip.split(".").map((x) => Number(x));
  if (a === 192 && b === 168) return 300;
  if (a === 10) return 280;
  if (a === 172 && b >= 16 && b <= 31) return 20;
  return 50;
}

function pickLanIPv4(): string | null {
  const ifs = os.networkInterfaces();
  const scored: { ip: string; score: number }[] = [];
  for (const addrs of Object.values(ifs)) {
    if (!addrs) continue;
    for (const a of addrs) {
      const fam = a.family;
      const v4 = fam === "IPv4" || fam === 4;
      if (!v4 || a.internal) continue;
      const ip = a.address;
      if (ip.startsWith("169.254.")) continue;
      if (!isPrivateIPv4(ip)) continue;
      scored.push({ ip, score: scoreLanIp(ip) });
    }
  }
  scored.sort((x, y) => y.score - x.score);
  if (scored.length > 0) return scored[0]!.ip;
  for (const addrs of Object.values(ifs)) {
    if (!addrs) continue;
    for (const a of addrs) {
      const fam = a.family;
      const v4 = fam === "IPv4" || fam === 4;
      if (!v4 || a.internal) continue;
      return a.address;
    }
  }
  return null;
}

function httpListenPort(
  httpServer: { address(): string | AddressInfo | null } | null | undefined,
  fallback: number
): number {
  const addr = httpServer?.address();
  if (addr && typeof addr === "object" && "port" in addr) return addr.port;
  return fallback;
}

function piaLanOriginPlugin(): Plugin {
  return {
    name: "pia-lan-origin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split("?")[0] ?? "";
        if (req.method !== "GET" || pathOnly !== "/__pia_lan_origin") {
          next();
          return;
        }
        const port = httpListenPort(
          server.httpServer,
          server.config.server.port ?? 5173
        );
        const ip = pickLanIPv4();
        const host = ip ?? "127.0.0.1";
        const origin = `http://${host}:${port}`;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ origin }));
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split("?")[0] ?? "";
        if (req.method !== "GET" || pathOnly !== "/__pia_lan_origin") {
          next();
          return;
        }
        const port = httpListenPort(
          server.httpServer,
          server.config.preview?.port ?? 4173
        );
        const ip = pickLanIPv4();
        const host = ip ?? "127.0.0.1";
        const origin = `http://${host}:${port}`;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ origin }));
      });
    },
  };
}

function contentType(filePath: string): string {
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function olharEmocionalAssetsPlugin(): Plugin {
  return {
    name: "olhar-emocional-assets",
    configureServer(server) {
      server.middlewares.use("/olhar-emocional-assets", (req, res, next) => {
        const raw = req.url?.split("?")[0] ?? "/";
        const rel = decodeURIComponent(
          raw.replace(/^\/olhar-emocional-assets\/?/, "") || ""
        );
        if (!rel || rel.includes("..")) {
          res.statusCode = 400;
          res.end("Bad path");
          return;
        }
        const abs = path.join(olharAssetsRoot, rel);
        if (!abs.startsWith(olharAssetsRoot)) {
          res.statusCode = 403;
          res.end();
          return;
        }
        fs.stat(abs, (err, st) => {
          if (err || !st?.isFile()) {
            next();
            return;
          }
          res.setHeader("Content-Type", contentType(abs));
          fs.createReadStream(abs).pipe(res);
        });
      });
    },
    closeBundle() {
      const videosSrc = path.join(olharAssetsRoot, "videos");
      const out = path.resolve(__dirname, "dist/olhar-emocional-assets/videos");
      if (fs.existsSync(videosSrc)) {
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.cpSync(videosSrc, out, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [piaLanOriginPlugin(), react(), olharEmocionalAssetsPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, ".")],
    },
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/actuator": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
});