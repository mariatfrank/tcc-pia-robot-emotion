import { useCallback, useEffect, useMemo, useState } from "react";
import { connectionTestApi, devicesApi } from "../../models/api";
import { isDeviceActiveStatus } from "../../models/deviceUtils";
import type { DeviceResponse } from "../../models/types";
import { PageBack } from "../components/PageBack";

export function ConnectionTestPage() {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [phoneLine, setPhoneLine] = useState("");
  const [tabletLine, setTabletLine] = useState("");
  const [tested, setTested] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [busy, setBusy] = useState(false);

  const refreshDevices = useCallback(async () => {
    setLoadingDevices(true);
    try {
      const list = await devicesApi.list();
      setDevices(list);
    } catch {
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  const activeDevices = useMemo(
    () => devices.filter((d) => isDeviceActiveStatus(d.status)),
    [devices]
  );
  const hasActiveDevices = activeDevices.length > 0;

  async function runTest() {
    if (!hasActiveDevices) return;
    setTested(true);
    setBusy(true);
    setPhoneLine("");
    setTabletLine("");
    try {
      const result = await connectionTestApi.run();
      if (!result.backendOk) {
        setPhoneLine(result.backendMessage || "API indisponível.");
        setTabletLine("Tablet (jogo): verifique Docker e backend na porta 8080.");
        return;
      }
      const list = await devicesApi.list();
      setDevices(list);
      setPhoneLine(result.eyesPhoneMessage);
      setTabletLine(result.gameTabletMessage);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro desconhecido";
      setPhoneLine(`Celular (olhos): falha na API (${msg}).`);
      setTabletLine("Tablet (jogo): falha na API. Confira se o backend está rodando.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Testar conexão</h1>
        <div className="connection-test-panels">
          <div className="connection-test-panel">
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Celular (olhos)</h2>
            <p className="muted" style={{ margin: 0, minHeight: "3rem" }}>
              {tested ? phoneLine : ""}
            </p>
          </div>
          <div className="connection-test-panel">
            <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Tablet (jogo)</h2>
            <p className="muted" style={{ margin: 0, minHeight: "3rem" }}>
              {tested ? tabletLine : ""}
            </p>
          </div>
        </div>
        <div className="connection-test-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || loadingDevices || !hasActiveDevices}
            onClick={() => void runTest()}
          >
            Testar conexão
          </button>
        </div>
      </div>
    </div>
  );
}
