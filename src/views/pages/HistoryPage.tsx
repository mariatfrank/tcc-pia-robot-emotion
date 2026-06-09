import { useEffect, useMemo, useState } from "react";
import { sessionsApi } from "../../models/api";
import { difficultyLabel } from "../../models/gameSettings";
import type { SessionResponse } from "../../models/types";
import { PageBack } from "../components/PageBack";

type SortKey = "date" | "score" | "difficulty";
type Dir = "asc" | "desc";
const PAGE_SIZE = 10;

function dateKey(iso: string) {
  return new Date(iso).getTime();
}

function toLocalDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export function HistoryPage({ backTo }: { backTo: string }) {
  const [rows, setRows] = useState<SessionResponse[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [dir, setDir] = useState<Dir>("desc");
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    async function loadHistory() {
      try {
        await sessionsApi.claimUnowned();
        const r = await sessionsApi.listHistory();
        if (!on) return;
        setRows(r);
        setErr(null);
      } catch (e) {
        if (on) setErr(e instanceof Error ? e.message : "Erro");
      }
    }
    void loadHistory();
    return () => {
      on = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let r = [...rows];
    if (filterDate) {
      r = r.filter((x) => {
        const d = new Date(x.startedAt);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}` === filterDate;
      });
    }
    const mul = dir === "asc" ? 1 : -1;
    r.sort((a, b) => {
      if (sortKey === "date") {
        return (dateKey(a.startedAt) - dateKey(b.startedAt)) * mul;
      }
      if (sortKey === "score") {
        return (a.score - b.score) * mul;
      }
      return difficultyLabel(a.difficulty).localeCompare(
        difficultyLabel(b.difficulty),
        "pt"
      ) * mul;
    });
    return r;
  }, [rows, filterDate, sortKey, dir]);

  useEffect(() => {
    setPage(1);
  }, [filterDate, sortKey, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function headerClick(key: SortKey) {
    if (sortKey === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("asc");
    }
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to={backTo} />
        <h1>Histórico de partidas</h1>
        <div className="field">
          <label htmlFor="fd">Filtrar por data</label>
          <input
            id="fd"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        {err && <p className="error">{err}</p>}
        <div style={{ overflowX: "auto" }}>
          <label htmlFor="fd">Histórico</label>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => headerClick("date")}>
                  Data {sortKey === "date" ? (dir === "asc" ? " ↑" : " ↓") : ""}
                </th>
                <th onClick={() => headerClick("score")}>
                  Pontuação
                  {sortKey === "score" ? (dir === "asc" ? " ↑" : " ↓") : ""}
                </th>
                <th onClick={() => headerClick("difficulty")}>
                  Dificuldade
                  {sortKey === "difficulty" ? (dir === "asc" ? " ↑" : " ↓") : ""}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.id}>
                  <td>{toLocalDate(s.startedAt)}</td>
                  <td>{s.score}</td>
                  <td>{difficultyLabel(s.difficulty)}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > PAGE_SIZE && (
          <div className="pagination-actions" aria-label="Paginação do histórico">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Página anterior
            </button>
            <span className="muted">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima página
            </button>
          </div>
        )}
        {filtered.length === 0 && !err && (
          <p className="muted">Nenhuma partida finalizada registrada.</p>
        )}
      </div>
    </div>
  );
}
