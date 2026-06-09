import { useEffect, useState } from "react";
import { gameSettingsApi } from "../../models/api";
import {
  ALLOWED_DURATION_SEC,
  difficultyLabel,
  loadGameSettings,
  saveGameSettings,
} from "../../models/gameSettings";
import type { Difficulty, GameSettings } from "../../models/types";
import { PageBack } from "../components/PageBack";

const DIFFS: Difficulty[] = ["EASY", "NORMAL", "HARD"];

export function GameSettingsPage() {
  const [s, setS] = useState<GameSettings>(() => loadGameSettings());
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    void gameSettingsApi
      .get()
      .then((settings) => {
        if (!on) return;
        saveGameSettings(settings);
        setS(settings);
        setErr(null);
      })
      .catch((e) => {
        if (on) setErr(e instanceof Error ? e.message : "Erro ao carregar configurações.");
      });
    return () => {
      on = false;
    };
  }, []);

  function patch(updater: (p: GameSettings) => GameSettings) {
    setS((p) => {
      const next = updater(p);
      saveGameSettings(next);
      void gameSettingsApi
        .update(next)
        .then((saved) => {
          saveGameSettings(saved);
          setS(saved);
          setErr(null);
        })
        .catch((e) =>
          setErr(e instanceof Error ? e.message : "Erro ao salvar configurações.")
        );
      return next;
    });
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Configurações de jogo</h1>
        {err && <p className="error">{err}</p>}

        <div>
          <fieldset>
            <legend>Dificuldade (tamanho do alvo)</legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {DIFFS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn btn-secondary${s.difficulty === d ? " selected-diff" : ""}`}
                  onClick={() => patch((p) => ({ ...p, difficulty: d }))}
                >
                  {difficultyLabel(d)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset style={{ marginTop: "1rem" }}>
            <legend>Tempo da partida (segundos)</legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {ALLOWED_DURATION_SEC.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-secondary${s.durationSec === t ? " selected-diff" : ""}`}
                  onClick={() => patch((p) => ({ ...p, durationSec: t }))}
                >
                  {t}s
                </button>
              ))}
            </div>
          </fieldset>
          <div className="field" style={{ marginTop: "1rem" }}>
         
          </div>
        </div>
      </div>
    </div>
  );
}
