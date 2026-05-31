import { useCallback, useEffect, useState } from "react";
import { sessionsApi } from "../../models/api";
import { loadGameSettings } from "../../models/gameSettings";
import type { SessionResponse } from "../../models/types";
import { PageBack } from "../components/PageBack";

const LAST = "pia_robot_last_session_id";
const POLL_MS = 1000;

function pickActiveSessions(list: SessionResponse[]) {
  return list.filter((x) => x.status === "ACTIVE");
}

export function StartSessionPage() {
  const [loading, setLoading] = useState(true);
  const [pollErr, setPollErr] = useState<string | null>(null);
  const [inPlay, setInPlay] = useState<SessionResponse | null>(null);
  const [waiting, setWaiting] = useState<SessionResponse | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        const list = await sessionsApi.listActive();
        if (!on) return;
        setPollErr(null);
        const actives = pickActiveSessions(list);
        const playing = actives.find((x) => x.playStarted) ?? null;
        const pending = actives.find((x) => !x.playStarted) ?? null;
        setInPlay(playing);
        setWaiting(playing ? null : pending);
      } catch (e) {
        if (on)
          setPollErr(e instanceof Error ? e.message : "Erro ao atualizar.");
      } finally {
        if (on) setLoading(false);
      }
    };
    void tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, []);

  const createSession = useCallback(async () => {
    setActionBusy(true);
    setActionErr(null);
    try {
      const gs = loadGameSettings();
      const sess = await sessionsApi.create("TARGET_HIT", gs.difficulty);
      await sessionsApi.setEmotion(sess.id, "IDLE");
      sessionStorage.setItem(LAST, sess.id);
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Erro ao criar sessão.");
    } finally {
      setActionBusy(false);
    }
  }, []);

  const startGameOnSession = useCallback(async (sessionUuid: string) => {
    setActionBusy(true);
    setActionErr(null);
    try {
      await sessionsApi.postEvent(sessionUuid, "GAME_STARTED", 0);
    } catch (e) {
      setActionErr(
        e instanceof Error ? e.message : "Erro ao iniciar a partida."
      );
    } finally {
      setActionBusy(false);
    }
  }, []);

  const showIdle = !loading && !inPlay && !waiting;

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Iniciar partida</h1>

        {loading && !inPlay && !waiting && (
          <p className="muted">Carregando…</p>
        )}
        {pollErr && <p className="error">{pollErr}</p>}
        {showIdle && (
          <>
            <p style={{ marginTop: "1rem", fontSize: "1.05rem" }}>
              Não há partidas ativas.
            </p>
            {actionErr && <p className="error">{actionErr}</p>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              disabled={actionBusy}
              onClick={() => void createSession()}
            >
              {actionBusy ? "Aguarde…" : "Iniciar partida"}
            </button>
          </>
        )}
        {!loading && waiting && !inPlay && (
          <div style={{ marginTop: "1rem" }}>


            {actionErr && <p className="error">{actionErr}</p>}
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              disabled={actionBusy}
              onClick={() => void startGameOnSession(waiting.id)}
            >
              {actionBusy ? "Aguarde…" : "Iniciar partida"}
            </button>
          </div>
        )}
        {inPlay && (
          <div style={{ marginTop: "1rem" }}>
            <p
              style={{
                color: "#15803d",
                fontWeight: 700,
                fontSize: "1.25rem",
                margin: "0 0 1rem",
              }}
            >
              Partida ativa
            </p>
            <dl className="stats-grid">
              <div>
                <dt>Acertos</dt>
                <dd>{inPlay.hits}</dd>
              </div>
              <div>
                <dt>Erros</dt>
                <dd>{inPlay.misses}</dd>
              </div>
              <div>
                <dt>Pontos</dt>
                <dd>{inPlay.score}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

