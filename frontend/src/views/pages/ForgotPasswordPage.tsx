import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../../models/api";
import { PageBack } from "../components/PageBack";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    const em = email.trim().toLowerCase();
    if (!em) {
      setErr("Informe o e-mail.");
      return;
    }
    setBusy(true);
    try {
      await usersApi.forgotPassword(em);
      setOk("E-mail de redefinição enviado. Verifique também a caixa de spam.");
    } catch (ex) {
      setErr(
        ex instanceof Error
          ? ex.message
          : "Não foi possível enviar o e-mail de redefinição."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="card">
        <PageBack to="/login" />
        <h1>Recuperar senha</h1>
        <p className="eyebrow">Opa! Precisamos configurar uma nova senha</p>
        <form onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label htmlFor="email">E-mail cadastrado</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {err && <p className="error">{err}</p>}
          {ok && <p className="success">{ok}</p>}
          <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
            {busy ? "Enviando…" : "Enviar e-mail"}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
