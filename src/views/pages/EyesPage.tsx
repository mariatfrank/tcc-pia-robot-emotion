import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { idleOlharVideo, videoSrcForEmotion } from "../../models/emotionOlharModel";
import { fetchEyesLiveState } from "../../models/eyesLiveSync";
import { manualEmotionApi } from "../../models/api";
import {
  ensurePairedDeviceActive,
  pairScannedDevice,
  readPairedOwnerEmail,
} from "../../models/devicePairing";
import type { EmotionType } from "../../models/types";

const EYES_POLL_MS = 50;
const MANUAL_POLL_MS = 200;

function isSessionPlaying(live: { playStarted: boolean; hits: number; misses: number }) {
  return live.playStarted || live.hits > 0 || live.misses > 0;
}
const DEVICE_POLL_MS = 2000;

export function EyesPage() {
  const [params] = useSearchParams();
  const ownerEmail =
    params.get("ownerEmail")?.trim().toLowerCase() ||
    readPairedOwnerEmail("EYES_PHONE")?.toLowerCase() ||
    undefined;
  const pairingId = params.get("pairingId")?.trim() ?? "";
  const [inGame, setInGame] = useState(false);
  const [emotion, setEmotion] = useState<EmotionType>("IDLE");
  const videoRef = useRef<HTMLVideoElement>(null);
  const emotionRef = useRef<EmotionType>("IDLE");
  const lastVideoSrcRef = useRef("");
  const [err, setErr] = useState<string | null>(null);
  const [deviceActive, setDeviceActive] = useState(true);

  useEffect(() => {
    emotionRef.current = emotion;
    const el = videoRef.current;
    if (!el) return;
    const nextSrc = videoSrcForEmotion(emotion) || idleOlharVideo();
    if (lastVideoSrcRef.current === nextSrc) return;
    lastVideoSrcRef.current = nextSrc;
    el.src = nextSrc;
    el.load();
    void el.play().catch(() => undefined);
  }, [emotion]);

  useEffect(() => {
    if (!ownerEmail || !deviceActive) return;

    let on = true;
    const tick = async () => {
      try {
        const live = await fetchEyesLiveState(ownerEmail);
        if (!on) return;
        if (live && live.status === "ACTIVE" && isSessionPlaying(live)) {
          setInGame(true);
          if (live.currentEmotion !== emotionRef.current) {
            setEmotion(live.currentEmotion);
          }
          setErr(null);
          return;
        }
        setInGame(false);
      } catch (e) {
        if (on) {
          setErr(e instanceof Error ? e.message : "Erro de conexão com a API");
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), EYES_POLL_MS);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [ownerEmail, deviceActive]);

  useEffect(() => {
    if (inGame || !ownerEmail || !deviceActive) return;
    let on = true;
    const poll = async () => {
      try {
        const manual = await manualEmotionApi.getForOwner(ownerEmail);
        if (!on) return;
        if (manual.emotion !== emotionRef.current) {
          setEmotion(manual.emotion);
        }
        setErr(null);
      } catch {
        /* ignore */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), MANUAL_POLL_MS);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [inGame, ownerEmail, deviceActive]);

  useEffect(() => {
    if (!ownerEmail || !pairingId) return;
    let on = true;
    async function pairAndWatch() {
      try {
        await pairScannedDevice("EYES_PHONE", pairingId, ownerEmail);
      } catch (e) {
        if (on) setErr(e instanceof Error ? e.message : "Erro ao parear celular.");
      }
      const poll = async () => {
        if (!on) return;
        try {
          const active = await ensurePairedDeviceActive("EYES_PHONE");
          if (!active && on) {
            setDeviceActive(false);
            setEmotion("IDLE");
            setInGame(false);
            setErr("Este celular foi desconectado no painel.");
          }
        } catch {
          /* ignore */
        }
      };
      await poll();
      const id = window.setInterval(() => void poll(), DEVICE_POLL_MS);
      return () => window.clearInterval(id);
    }
    let cleanup: void | (() => void);
    void pairAndWatch().then((fn) => {
      cleanup = fn;
    });
    return () => {
      on = false;
      cleanup?.();
    };
  }, [ownerEmail, pairingId]);

  return (
    <div className="eyes-fullscreen" role="img" aria-label="Olhos do Piá Robot Emotion">
      <video
        ref={videoRef}
        className="eyes-fullscreen-video"
        src={idleOlharVideo()}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      {err && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            color: "#ed254e",
            fontSize: 12,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {err}
        </div>
      )}
    </div>
  );
}
