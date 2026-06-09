import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthContext";
import { PageBack } from "../components/PageBack";
import { PasswordField } from "../components/PasswordField";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setErr("Preencha todos os campos obrigatórios.");
      return;
    }
    if (password !== confirm) {
      setErr("As senhas não coincidem.");
      return;
    }
    try {
      await register(name, email, password);
      nav("/app", { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Falha no cadastro.");
    }
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/" label="Início" />
        <h1>Criar conta</h1>
        <p className="eyebrow">Bem vindo! Vamos configurar seu Primeiro acesso</p>
        
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <PasswordField
            id="password"
            label="Senha"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm"
            label="Confirmar senha"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
          {err && <p className="error">{err}</p>}
          <br /><div className="auth-actions">
            <button className="btn btn-primary auth-submit" type="submit">
              Cadastrar
            </button>
          </div>
        </form>
        <p className="auth-links">
          <Link to="/login">Já tenho conta</Link>
        </p>
      </div>
    </div>
  );
}
