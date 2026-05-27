import fs from "node:fs";
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
  plugins: [react(), olharEmocionalAssetsPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/actuator": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
