import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sessionsApi } from "../../models/api";
import type { SessionResponse } from "../../models/types";
import { PageBack } from "../components/PageBack";

export function LiveScorePage() {
  const { sessionId: sessionIdParam } = useParams<{ sessionId?: string }>();
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const t = sessionIdParam?.trim();
    return t || null;
  });
  const [s, setS] = useState<SessionResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [resolveErr, setResolveErr] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = sessionIdParam?.trim() ?? "";
    if (fromUrl) {
      setSessionId(fromUrl);
      setResolveErr(null);
      return;
    }
    let on = true;
    setSessionId(null);
    setResolveErr(null);
    setS(null);
    void sessionsApi
      .listActive()
      .then((list) => {
        if (!on) return;
        const active = list.find((x) => x.status === "ACTIVE");
        if (active) setSessionId(active.id);
        else
          setResolveErr(
            "Nenhuma partida ativa. Use Iniciar partida no painel primeiro."
          );
      })
      .catch((e) => {
        if (on)
          setResolveErr(
            e instanceof Error ? e.message : "Erro ao listar sessões."
          );
      });
    return () => {
      on = false;
    };
  }, [sessionIdParam]);

  useEffect(() => {
    if (!sessionId) return;
    let on = true;
    const tick = () => {
      void sessionsApi
        .get(sessionId)
        .then((r) => {
          if (on) {
            setS(r);
            setErr(null);
          }
        })
        .catch((e) => {
          if (on) setErr(e instanceof Error ? e.message : "Erro");
        });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      on = false;
      window.clearInterval(id);
    };
  }, [sessionId]);

  const headline =
    s?.status === "FINISHED"
      ? "Partida encerrada"
      : s?.status === "ACTIVE" && s.playStarted
        ? "Partida ativa"
        : s?.status === "ACTIVE"
          ? "Aguardando início da partida"
          : "Partida";

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        {resolveErr && !sessionId && (
          <p className="error">{resolveErr}</p>
        )}
        {sessionId && (
          <>
            <p className="eyebrow">Ao vivo</p>
            <h1>{headline}</h1>
            <p className="muted">
              {s?.status === "ACTIVE" && s && !s.playStarted
                ? "A rodada começa quando alguém inicia o jogo no tablet. Depois disso, acertos e erros atualizam a cada segundo."
                : "Acertos e erros são atualizados automaticamente a cada segundo."}
            </p>
            {err && <p className="error">{err}</p>}
            {s &&
              (s.status === "FINISHED" ||
                (s.status === "ACTIVE" && s.playStarted)) && (
              <dl className="stats-grid">
                <div>
                  <dt>Acertos</dt>
                  <dd>{s.hits}</dd>
                </div>
                <div>
                  <dt>Erros</dt>
                  <dd>{s.misses}</dd>
                </div>
                <div>
                  <dt>Pontos</dt>
                  <dd>{s.score}</dd>
                </div>
                <div>
                  <dt>Emoção</dt>
                  <dd style={{ fontSize: "1rem" }}>{s.currentEmotion}</dd>
                </div>
              </dl>
            )}
            {s?.status === "ACTIVE" && !s.playStarted && (
              <p className="muted" style={{ marginTop: "0.5rem" }}>
                Nenhum acerto ou erro ainda — o cronômetro do tablet ainda não
                começou.
              </p>
            )}
            {!s && !err && <p className="muted">Carregando…</p>}
          </>
        )}
      </div>
    </div>
  );
}
