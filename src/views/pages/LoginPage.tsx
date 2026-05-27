import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthContext";
import { PageBack } from "../components/PageBack";
import { PasswordField } from "../components/PasswordField";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Preencha e-mail e senha.");
      return;
    }
    try {
      await login(email, password);
      nav("/app", { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Falha no login.");
    }
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/" label="Início" />
        <h1>Login</h1>
        <p className="eyebrow">Bem-vindo! Faça Login para acessar o sistema</p>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <PasswordField
            id="password"
            label="Senha"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {err && <p className="error">{err}</p>}
          <br /><div className="auth-actions">
            <button className="btn btn-primary auth-submit" type="submit">
              Login
            </button>
          </div>
        </form>
        <p className="auth-links">
          <Link to="/recuperar-senha">Esqueci minha senha</Link>
          <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
