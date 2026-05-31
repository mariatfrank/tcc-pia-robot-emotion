import { useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { sessionsApi } from "../../models/api";
import { pickActivePlayingSession } from "../../models/sessionSync";
import {
  ensurePairedDeviceActive,
  pairScannedDevice,
  readPairedOwnerEmail,
} from "../../models/devicePairing";
import { IconHistory, IconInfo, IconPlay } from "../components/ActionIcons";

export type TabletGameSummaryState = {
  score: number;
  hits: number;
  misses: number;
};

export function TabletHomePage({ disconnected = false }: { disconnected?: boolean }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const summary = (loc.state as { gameSummary?: TabletGameSummaryState } | null)
    ?.gameSummary;
  const ownerEmail =
    params.get("ownerEmail")?.trim() || readPairedOwnerEmail("GAME_TABLET") || undefined;
  const pairingId = params.get("pairingId")?.trim() || "";
  const linkedSessionId = params.get("sessionId")?.trim() || "";
  const isNewPairing = Boolean(pairingId && !linkedSessionId);

  useEffect(() => {
    if (!summary) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [summary]);

  function closeGameSummary() {
    navigate("/tablet", { replace: true, state: {} });
  }

  useEffect(() => {
    if (!ownerEmail || !pairingId) return;
    let on = true;
    async function pairAndWatch() {
      try {
        await pairScannedDevice("GAME_TABLET", pairingId, ownerEmail, linkedSessionId || undefined);
      } catch {
        }
      const poll = async () => {
        if (!on) return;
        try {
          const active = await ensurePairedDeviceActive("GAME_TABLET");
          if (!active && on) {
            navigate("/tablet/desconectado", { replace: true });
          }
        } catch {
          }
      };
      await poll();
      const id = window.setInterval(() => void poll(), 1000);
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
  }, [ownerEmail, pairingId, linkedSessionId, navigate]);

  useEffect(() => {
    if (!linkedSessionId && !ownerEmail) return;
    let on = true;
    let firstOwnerPoll = true;
    let skippedStartedSessionId: string | null = null;
    const poll = async () => {
      try {
        let s;
        if (linkedSessionId) {
          s = await sessionsApi.get(linkedSessionId);
        } else {
          const list = await sessionsApi.listActiveForOwner(ownerEmail!);
          s =
            pickActivePlayingSession(list) ??
            list.find((x) => x.status === "ACTIVE");
        }
        if (!linkedSessionId && firstOwnerPoll) {
          firstOwnerPoll = false;
          if (isNewPairing && s?.status === "ACTIVE" && s.playStarted) {
            skippedStartedSessionId = s.id;
            return;
          }
        }
        if (!s) return;
        if (skippedStartedSessionId === s.id && s.playStarted) return;
        if (on && s.status === "ACTIVE" && s.playStarted) {
          const ownerQuery = ownerEmail
            ? `&ownerEmail=${encodeURIComponent(ownerEmail)}`
            : "";
          navigate(
            `/tablet/jogo?sessionId=${encodeURIComponent(s.id)}${ownerQuery}`,
            { replace: true }
          );
        }
      } catch {
        }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 120);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [linkedSessionId, ownerEmail, isNewPairing, navigate]);

  return (
    <div className="app-shell app-shell--tablet-home">
      <div className="card">
        <h1>Piá Robot Emotion: tablet para jogo</h1>
        {disconnected && (
          <p className="error">
            Este dispositivo foi desconectado no painel. Escaneie um novo QR Code para conectar novamente.
          </p>
        )}
        <div className="grid-actions">
          <Link
            className="btn dashboard-menu-tile dashboard-menu-play"
            to={
              ownerEmail
                ? `/tablet/jogo?novo=1&ownerEmail=${encodeURIComponent(ownerEmail)}`
                : "/tablet/jogo?novo=1"
            }
          >
            <IconPlay /> Nova partida
          </Link>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-history"
            to="/tablet/historico"
          >
            <IconHistory /> Histórico de partidas
          </Link>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-about"
            to="/tablet/sobre"
          >
            <IconInfo /> Sobre
          </Link>
        </div>
      </div>

      {summary && (
        <div
          className="tablet-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tablet-game-over-title"
        >
          <div className="tablet-modal">
            <button
              type="button"
              className="tablet-modal-close"
              onClick={closeGameSummary}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 id="tablet-game-over-title" className="tablet-modal-title">
              Fim de jogo
            </h2>
            <p className="tablet-modal-body">
              Pontuação total: <strong>{summary.score}</strong>
              <br />
              Acertos: <strong>{summary.hits}</strong> · Erros:{" "}
              <strong>{summary.misses}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

