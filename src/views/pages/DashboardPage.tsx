import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthContext";
import {
  IconDevices,
  IconPhone,
  IconTablet,
  IconUser,
  IconWifi,
} from "../components/ActionIcons";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [confirmOut, setConfirmOut] = useState(false);

  async function doLogout() {
    await logout();
    setConfirmOut(false);
    nav("/login", { replace: true });
  }

  useEffect(() => {
    if (!confirmOut) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [confirmOut]);

  return (
    <div className="app-shell app-shell--dashboard">
      <div className="card">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 0.35rem" }}>Piá Robot Emotion</h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span className="user-badge" title={user?.email}>
              <IconUser size={20} />
              {user?.name ?? user?.email}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmOut(true)}
            >
              Logout
            </button>
          </div>
        </header>
        <div className="grid-actions" style={{ marginTop: "1.25rem" }}>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-phone"
            to="/app/dispositivos/celular"
          >
            <IconPhone /> Cadastrar celular
          </Link>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-tablet"
            to="/app/dispositivos/tablet"
          >
            <IconTablet /> Cadastrar tablet para jogo
          </Link>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-devices"
            to="/app/dispositivos"
          >
            <IconDevices /> Gerenciar dispositivos conectados
          </Link>
          <Link
            className="btn dashboard-menu-tile dashboard-menu-wifi"
            to="/app/dispositivos/teste"
          >
            <IconWifi /> Testar conexão entre dispositivos
          </Link>
          <Link className="btn dashboard-menu-tile dashboard-menu-profile" to="/app/perfil">
            <IconUser /> Perfil
          </Link>
        </div>
      </div>

      {confirmOut && (
        <div
          className="tablet-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onClick={() => setConfirmOut(false)}
        >
          <div className="tablet-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="logout-title" className="tablet-modal-title">
              Encerrar sessão?
            </h2>
            <p className="muted tablet-modal-body" style={{ marginTop: 0 }}>
              Ao confirmar, sua sessão será encerrada e os dispositivos cadastrados serão
              desativados.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void doLogout()}
              >
                Confirmar logout
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmOut(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
