import { FormEvent, useState } from "react";
import { useAuth } from "../../controllers/AuthContext";
import { usersApi } from "../../models/api";
import { getSessionPassword, setSessionPassword } from "../../models/authLocal";
import { PageBack } from "../components/PageBack";
import { PasswordField } from "../components/PasswordField";
import { PasswordToggle } from "../components/PasswordToggle";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Inclua pelo menos uma letra maiúscula.";
  if (!/[0-9]/.test(password)) return "Inclua pelo menos um número.";
  return null;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [showReset, setShowReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const storedPassword = getSessionPassword();
  const passwordDisplay = storedPassword ?? "••••••••";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!user) return;
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErr(passwordError);
      return;
    }
    if (password !== confirm) {
      setErr("As senhas não coincidem.");
      return;
    }
    if (!currentPassword) {
      setErr("Informe a senha atual.");
      return;
    }
    setBusy(true);
    try {
      await usersApi.updatePassword(currentPassword, password);
      setSessionPassword(password);
      setShowStoredPassword(false);
      setCurrentPassword("");
      setPassword("");
      setConfirm("");
      setShowReset(false);
      setOk("Senha atualizada com sucesso.");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Não foi possível atualizar a senha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="card profile-card">
        <PageBack to="/app" />
        <h1>Perfil</h1>

        <dl className="profile-details">
          <div>
            <dt>Nome</dt>
            <dd>{user?.name ?? user?.email}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Senha</dt>
            <dd className="profile-password-value">
              <div className="password-input-wrap profile-password-input-wrap">
                <input
                  id="profile-stored-password"
                  type={showStoredPassword ? "text" : "password"}
                  value={passwordDisplay}
                  readOnly
                  aria-label="Senha cadastrada"
                />
                <PasswordToggle
                  visible={showStoredPassword}
                  onToggle={() => setShowStoredPassword((v) => !v)}
                />
              </div>
              {!storedPassword && showStoredPassword && (
                <p className="profile-password-hint">
                  A senha só pode ser exibida nesta sessão após login ou cadastro.
                </p>
              )}
            </dd>
          </div>
        </dl>

        {ok && <p className="success profile-message">{ok}</p>}

        {!showReset ? (
          <div className="auth-actions">
            <button
              className="btn btn-primary auth-submit"
              type="button"
              onClick={() => {
                setOk(null);
                setShowReset(true);
              }}
            >
              Redefinir senha
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="profile-form">
            <PasswordField
              id="profile-current-password"
              label="Senha atual"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <PasswordField
              id="profile-password"
              label="Nova senha"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordField
              id="profile-confirm"
              label="Confirmar senha"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            {err && <p className="error">{err}</p>}
            <div className="auth-actions">
              <button
                className="btn btn-primary auth-submit"
                type="submit"
                disabled={busy}
              >
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
