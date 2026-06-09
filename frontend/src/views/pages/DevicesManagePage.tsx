import { useEffect, useMemo, useState } from "react";
import { devicesApi } from "../../models/api";
import { isDeviceActiveStatus } from "../../models/deviceUtils";
import type { DeviceResponse } from "../../models/types";
import { PageBack } from "../components/PageBack";

export function DevicesManagePage() {
  const [list, setList] = useState<DeviceResponse[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      setList(await devicesApi.list());
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao listar.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function remove(id: string) {
    try {
      await devicesApi.deactivate(id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  }

  const activeOnly = useMemo(
    () => {
      const byType = new Map<string, DeviceResponse>();
      for (const device of list) {
        if (!isDeviceActiveStatus(device.status)) continue;
        if (!byType.has(device.type)) {
          byType.set(device.type, device);
        }
      }
      return [...byType.values()];
    },
    [list]
  );

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Gerenciar dispositivos</h1>
        
        {err && <p className="error">{err}</p>}
        {activeOnly.length === 0 ? (
          <p>Nenhum dispositivo ativo.</p>
        ) : (
          <ul style={{ paddingLeft: "1.1rem", listStyle: "none" }}>
            {activeOnly.map((d) => (
              <li
                key={d.id}
                style={{
                  marginBottom: "0.85rem",
                  padding: "0.75rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(14, 14, 82, 0.1)",
                  background: "rgba(123, 201, 80, 0.12)",
                }}
              >
                <strong>{d.name}</strong> — {d.type}{" "}
                <span className="muted">
                  — <span style={{ color: "var(--moss-dark)", fontWeight: 700 }}>ATIVO</span>
                </span>
                <div style={{ marginTop: "0.35rem" }}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => void remove(d.id)}
                  >
                    Excluir dispositivo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
