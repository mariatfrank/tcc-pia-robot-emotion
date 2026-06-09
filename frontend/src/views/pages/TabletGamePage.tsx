import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gameSettingsApi, manualEmotionApi, sessionsApi } from "../../models/api";
import {
  ensurePairedDeviceActive,
  readPairedOwnerEmail,
} from "../../models/devicePairing";
import { createGameEventQueue } from "../../models/gameEventQueue";
import {
  difficultyLabel,
  loadGameSettings,
  saveGameSettings,
  targetScalePercent,
} from "../../models/gameSettings";
import { playHit, playMiss } from "../../models/sound";

const LAST_SESSION = "pia_robot_last_session_id";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function resolveLinkedSessionId(
  urlParam: string,
  ignoreStored: boolean
): string {
  const fromUrl = urlParam.trim();
  if (fromUrl) return fromUrl;
  if (ignoreStored) return "";
  if (typeof sessionStorage !== "undefined") {
    const fromStore = sessionStorage.getItem(LAST_SESSION)?.trim() ?? "";
    if (fromStore) return fromStore;
  }
  return "";
}

function persistSessionId(id: string) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(LAST_SESSION, id);
  }
}

const REMOTE_START_POLL_MS = 100;
const TARGET_RESPAWN_DELAY_MS = 400;
const DEVICE_POLL_MS = 2000;

type Phase = "setup" | "play";

export function TabletGamePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const presetSession = params.get("sessionId")?.trim() ?? "";
  const ignoreStoredSession = params.get("novo") === "1";
  const ownerEmail =
    params.get("ownerEmail")?.trim() || readPairedOwnerEmail("GAME_TABLET") || undefined;

  const [sessionId, setSessionId] = useState("");
  const [phase, setPhase] = useState<Phase>("setup");
  const [settings, setSettings] = useState(() => loadGameSettings());
  const [settingsReady, setSettingsReady] = useState(!ownerEmail);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const [remaining, setRemaining] = useState(10);
  const [target, setTarget] = useState({ x: 20, y: 20 });
  const [targetVisible, setTargetVisible] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deviceDisconnected, setDeviceDisconnected] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const playEnteredRef = useRef(false);
  const bootStartedRef = useRef(false);
  const respawnTimerRef = useRef<number | null>(null);
  const eventQueueRef = useRef(createGameEventQueue());

  const reportEventError = useCallback((ex: unknown) => {
    setErr(ex instanceof Error ? ex.message : "Erro ao sincronizar com o servidor.");
  }, []);

  const enqueueEvent = useCallback(
    (type: "GAME_STARTED" | "HIT" | "MISS" | "GAME_FINISHED", points: number) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      void eventQueueRef.current.enqueue(
        () => sessionsApi.postEvent(sid, type, points, ownerEmail),
        reportEventError
      );
    },
    [reportEventError, ownerEmail]
  );

  const placeTarget = useCallback(() => {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 12;
    const tw = Math.min(120, rect.width * 0.25);
    const x = rand(margin, Math.max(margin, rect.width - tw - margin));
    const y = rand(margin, Math.max(margin, rect.height - tw - margin));
    setTarget({ x, y });
    setTargetVisible(true);
  }, []);

  const scheduleTargetRespawn = useCallback(
    (delayMs: number) => {
      setTargetVisible(false);
      if (respawnTimerRef.current !== null) {
        window.clearTimeout(respawnTimerRef.current);
      }
      respawnTimerRef.current = window.setTimeout(() => {
        respawnTimerRef.current = null;
        if (phaseRef.current === "play" && !finishedRef.current) {
          placeTarget();
        }
      }, delayMs);
    },
    [placeTarget]
  );

  const enterPlay = useCallback(
    (sid: string) => {
      if (playEnteredRef.current) return;
      playEnteredRef.current = true;
      finishedRef.current = false;
      persistSessionId(sid);
      setSessionId(sid);
      setRemaining(settings.durationSec);
      setPhase("play");
      setTargetVisible(false);
      requestAnimationFrame(() => scheduleTargetRespawn(80));
    },
    [scheduleTargetRespawn, settings.durationSec]
  );

  useEffect(() => {
    if (!ownerEmail) {
      setSettingsReady(true);
      return;
    }
    let on = true;
    setSettingsReady(false);
    void gameSettingsApi
      .getForOwner(ownerEmail)
      .then((remoteSettings) => {
        if (!on) return;
        saveGameSettings(remoteSettings);
        setSettings(remoteSettings);
      })
      .catch(() => undefined)
      .finally(() => {
        if (on) setSettingsReady(true);
      });
    return () => {
      on = false;
    };
  }, [ownerEmail]);

  useEffect(() => {
    if (!settingsReady || bootStartedRef.current) return;
    bootStartedRef.current = true;

    let cancelled = false;
    async function boot() {
      setErr(null);
      const linked = resolveLinkedSessionId(presetSession, ignoreStoredSession);

      if (!linked) {
        try {
          finishedRef.current = false;
          if (ownerEmail) {
            await sessionsApi.claimUnowned(ownerEmail).catch(() => undefined);
          }
          const sid = (
            await sessionsApi.create(
              "TARGET_HIT",
              settings.difficulty,
              ownerEmail
            )
          ).id;
          if (cancelled) return;
          persistSessionId(sid);
          await sessionsApi.postEvent(sid, "GAME_STARTED", 0, ownerEmail);
          enterPlay(sid);
        } catch (e) {
          if (!cancelled) {
            bootStartedRef.current = false;
            setErr(e instanceof Error ? e.message : "Erro ao iniciar");
          }
        }
        return;
      }

      try {
        const s = await sessionsApi.get(linked);
        if (cancelled) return;
        if (s.status !== "ACTIVE") {
          bootStartedRef.current = false;
          setErr("Sessão precisa estar ativa para jogar.");
          return;
        }
        persistSessionId(linked);
        if (s.playStarted) {
          enterPlay(linked);
        }
      } catch (e) {
        if (!cancelled) {
          bootStartedRef.current = false;
          setErr(e instanceof Error ? e.message : "Erro ao carregar a sessão.");
        }
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [
    presetSession,
    ignoreStoredSession,
    enterPlay,
    settings.difficulty,
    settingsReady,
    enqueueEvent,
  ]);

  useEffect(() => {
    let on = true;
    const poll = async () => {
      try {
        const active = await ensurePairedDeviceActive("GAME_TABLET");
        if (on && !active) {
          setDeviceDisconnected(true);
          setPhase("setup");
          playEnteredRef.current = false;
          setErr("Este tablet foi desconectado no painel.");
        }
      } catch {
        /* ignore */
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), DEVICE_POLL_MS);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (phase !== "play" || deviceDisconnected) return;
    const id = window.setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, deviceDisconnected]);

  useEffect(() => {
    if (phase !== "play" || deviceDisconnected || remaining !== 0 || !sessionId) return;
    if (finishedRef.current) return;
    finishedRef.current = true;
    setTargetVisible(false);
    if (respawnTimerRef.current !== null) {
      window.clearTimeout(respawnTimerRef.current);
      respawnTimerRef.current = null;
    }
    void (async () => {
      try {
        await eventQueueRef.current.enqueue(() =>
          sessionsApi.postEvent(sessionId, "GAME_FINISHED", 0, ownerEmail)
        );
        if (ownerEmail) {
          await manualEmotionApi.update("IDLE").catch(() => undefined);
        }
        const s = await sessionsApi.get(sessionId);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem(LAST_SESSION);
        }
        playEnteredRef.current = false;
        bootStartedRef.current = false;
        navigate("/tablet", {
          replace: true,
          state: {
            gameSummary: {
              score: s.score,
              hits: s.hits,
              misses: s.misses,
            },
          },
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Erro ao finalizar");
        finishedRef.current = false;
      }
    })();
  }, [phase, remaining, sessionId, ownerEmail, navigate, deviceDisconnected]);

  useEffect(() => {
    return () => {
      if (respawnTimerRef.current !== null) {
        window.clearTimeout(respawnTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "setup" || !settingsReady) return;
    const linked = resolveLinkedSessionId(presetSession, ignoreStoredSession);
    if (!linked) return;

    let on = true;
    const poll = async () => {
      if (!on || phaseRef.current !== "setup") return;
      try {
        const s = await sessionsApi.get(linked);
        if (!on || phaseRef.current !== "setup") return;
        if (s.status === "ACTIVE" && s.playStarted) {
          enterPlay(linked);
        }
      } catch {
        /* ignore */
      }
    };

    void poll();
    const id = window.setInterval(() => void poll(), REMOTE_START_POLL_MS);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [phase, presetSession, ignoreStoredSession, enterPlay, settingsReady]);

  function onHit(e: React.MouseEvent) {
    e.stopPropagation();
    if (phase !== "play" || !sessionId) return;
    if (deviceDisconnected) return;
    if (!targetVisible) return;
    setTargetVisible(false);
    playHit(settings.soundEnabled);
    enqueueEvent("HIT", 1);
    scheduleTargetRespawn(TARGET_RESPAWN_DELAY_MS);
  }

  function onBoardClick() {
    if (phase !== "play" || !sessionId) return;
    if (deviceDisconnected) return;
    if (!targetVisible) return;
    playMiss(settings.soundEnabled);
    enqueueEvent("MISS", 0);
    scheduleTargetRespawn(TARGET_RESPAWN_DELAY_MS);
  }

  const scale = targetScalePercent(settings.difficulty) / 100;

  if (phase === "play") {
    return (
      <div className="tablet-game-only">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: "10px 16px",
            background:
              "linear-gradient(180deg, rgba(14,14,82,0.92) 0%, transparent)",
            color: "#ecf8f8",
            fontWeight: 700,
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          {remaining}s · {difficultyLabel(settings.difficulty)}
        </div>
        <div
          ref={boardRef}
          onClick={onBoardClick}
          style={{
            position: "absolute",
            inset: 0,
            background: "#0e0e52",
            overflow: "hidden",
            touchAction: "manipulation",
          }}
        >
          {targetVisible && (
            <button
              type="button"
              onClick={onHit}
              style={{
                position: "absolute",
                left: target.x,
                top: target.y,
                width: 72 * scale,
                height: 72 * scale,
                borderRadius: "50%",
                border: "4px solid #ff8833",
                background:
                  "radial-gradient(circle at 30% 30%, #ecf8f8, #ed254e)",
                cursor: "pointer",
                transition: "left 0.2s ease, top 0.2s ease",
                touchAction: "manipulation",
              }}
              aria-label="Alvo"
            />
          )}
        </div>
        {err && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              color: "#ed254e",
              textAlign: "center",
              fontSize: 13,
              zIndex: 3,
            }}
          >
            {err}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="tablet-game-only"
      style={{
        background: "#0e0e52",
        color: "#ecf8f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      {err ? (
        <>
          <p style={{ margin: 0, maxWidth: 360 }}>{err}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/tablet", { replace: true })}
          >
            Ir ao início
          </button>
        </>
      ) : (
        <p style={{ margin: 0 }}>Carregando partida…</p>
      )}
    </div>
  );
}
