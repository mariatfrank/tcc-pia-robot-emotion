import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { devicesApi, sessionsApi } from "../../models/api";
import { isDeviceActiveStatus } from "../../models/deviceUtils";
import { createPairingId } from "../../models/pairingId";
import { resolveQrOriginBase } from "../../models/resolveQrOrigin";
import { isLocalhostHostname } from "../../models/lanOriginGuess";
import { getSession } from "../../models/authLocal";
import type { DeviceType } from "../../models/types";
import { PageBack } from "../components/PageBack";

function initialQrBase(): string | null {
  if (typeof window === "undefined") return null;
  return isLocalhostHostname(window.location.hostname) ? null : window.location.origin;
}

export function RegisterDevicePage({ type }: { type: DeviceType }) {
  const label = type === "EYES_PHONE" ? "celular " : "tablet para jogo";
  const [hasActiveDevice, setHasActiveDevice] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [qrBaseUrl, setQrBaseUrl] = useState<string | null>(initialQrBase);
  const [linkedSessionId, setLinkedSessionId] = useState<string | null>(null);
  const [pairingId] = useState(() => createPairingId());
  const ownerEmail = getSession()?.email;

  useEffect(() => {
    Promise.all([devicesApi.list(), sessionsApi.listActive()])
      .then(([list, sessions]) => {
        const has = list.some(
          (d) => d.type === type && isDeviceActiveStatus(d.status)
        );
        setHasActiveDevice(has);
        const activeSession = sessions.find((s) => s.status === "ACTIVE");
        setLinkedSessionId(activeSession?.id ?? null);
        if (activeSession) {
          sessionStorage.setItem("pia_robot_last_session_id", activeSession.id);
        } else {
          sessionStorage.removeItem("pia_robot_last_session_id");
        }
        setErr(null);
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Erro ao verificar dispositivos.");
      })
      .finally(() => setChecking(false));
  }, [type]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLocalhostHostname(window.location.hostname)) {
      setQrBaseUrl(window.location.origin);
      return;
    }
    let cancelled = false;
    void resolveQrOriginBase().then((base) => {
      if (!cancelled) setQrBaseUrl(base);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scanUrl = useMemo(() => {
    const base = qrBaseUrl?.replace(/\/+$/, "") ?? "";
    if (!base || !ownerEmail) return "";
    if (type === "EYES_PHONE") {
      const q = new URLSearchParams({ ownerEmail, pairingId });
      return `${base}/olhos?${q.toString()}`;
    }
    const q = new URLSearchParams({ ownerEmail, pairingId });
    return `${base}/tablet?${q.toString()}`;
  }, [qrBaseUrl, type, linkedSessionId, ownerEmail, pairingId]);

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/app" />
        <h1>Cadastrar {label}</h1>

        {checking ? (
          <p className="muted">Verificando…</p>
        ) : (
          <>
            {err && <p className="error">{err}</p>}
            {hasActiveDevice ? (
              <p className="muted" style={{ marginTop: "1rem" }}>
                Já existe um dispositivo ativo deste tipo. 
                Para remover, acesse{" "}
                <Link to="/app/dispositivos">Gerenciar dispositivos</Link>.
              </p>
            ) : (
              <>
                {!ownerEmail && (
                  <p className="error">Faça login no painel para gerar o QR Code.</p>
                )}
                <div
                  style={{
                    textAlign: "center",
                    margin: "1.5rem 0",
                    minHeight: scanUrl ? "292px" : "auto",
                  }}
                >
                  {scanUrl ? (
                    <div
                      style={{
                        margin: "0 auto",
                        padding: "1rem",
                        background: "var(--panel-inset)",
                        borderRadius: "8px",
                        display: "inline-block",
                      }}
                    >
                      <QRCodeSVG value={scanUrl} size={260} level="M" includeMargin />
                    </div>
                  ) : (
                    <p className="muted">
                      Aguardando endereço da rede local para gerar o QR Code…
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
