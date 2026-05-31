import { useCallback, useEffect, useState } from "react";
import { manualEmotionApi, sessionsApi } from "../../models/api";
import type { EmotionType } from "../../models/types";
import { PageBack } from "../components/PageBack";

const LAST_SESSION = "pia_robot_last_session_id";

const OPTIONS: { value: EmotionType; label: string }[] = [
  { value: "HAPPY", label: "Feliz" },
  { value: "SAD", label: "Triste" },
  { value: "IDLE", label: "Neutro" },
];

export function ManualEmotionPage() {
  const [sessionId, setSessionId] = useState("");
  const [emotion, setEmotion] = useState<EmotionType>("IDLE");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void sessionsApi
      .listActive()
      .then((l) => {
        const fromStore = sessionStorage.getItem(LAST_SESSION)?.trim() ?? "";
        const preferStore = fromStore && l.some((s) => s.id === fromStore);
        setSessionId(preferStore ? fromStore : l[0]?.id ?? "");
      })
      .catch(() => setSessionId(""));
  }, []);

  const applyEmotion = useCallback(async (emo: EmotionType) => {
    setErr(null);
    setMsg(null);
    try {
      await manualEmotionApi.update(emo);
      if (sessionId) {
        await sessionsApi.setEmotion(sessionId, emo);
      }
      setMsg(
        sessionId
          ? "Emoção aplicada. "
          : "Emoção aplicada."
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Erro");
    }
  }, [sessionId]);

  function pickEmotion(emo: EmotionType) {
    setEmotion(emo);
    void applyEmotion(emo);
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Modificar emoção</h1>

        <div className="field">
          <label>Emoção</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`btn btn-secondary${emotion === o.value ? " selected-diff" : ""}`}
                onClick={() => pickEmotion(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="error">{err}</p>}
        {msg && <p className="success">{msg}</p>}
      </div>
    </div>
  );
}
