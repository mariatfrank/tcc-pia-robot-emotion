import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { devicesApi, sessionsApi, usersApi } from "../models/api";
import {
  getSession,
  setSession,
  setSessionPassword,
  type AuthSession,
} from "../models/authLocal";

interface AuthContextValue {
  user: AuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const LAST_SESSION_KEY = "pia_robot_last_session_id";

function clearLastSessionLink() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(LAST_SESSION_KEY);
  }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "Inclua pelo menos uma letra mai?scula.";
  if (!/[0-9]/.test(password)) return "Inclua pelo menos um n?mero.";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(() => getSession());

  const login = useCallback(async (email: string, password: string) => {
    const profile = await usersApi.login(email, password);
    const session: AuthSession = { email: profile.email, name: profile.name };
    clearLastSessionLink();
    setSession(session);
    setSessionPassword(password);
    try {
      await sessionsApi.claimUnowned();
    } catch {
      return;
    }
    setUser(session);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const em = email.trim().toLowerCase();
    if (!name.trim()) throw new Error("Informe o nome.");
    if (!validateEmail(em)) throw new Error("E-mail inv?lido.");
    const pwErr = validatePasswordStrength(password);
    if (pwErr) throw new Error(pwErr);
    const profile = await usersApi.register(name, email, password);
    const session: AuthSession = { email: profile.email, name: profile.name };
    clearLastSessionLink();
    setSession(session);
    setSessionPassword(password);
    setUser(session);
  }, []);

  const logout = useCallback(async () => {
    try {
      const list = await devicesApi.list();
      for (const d of list) {
        if (d.status === "ACTIVE") {
          try {
            await devicesApi.deactivate(d.id);
          } catch {
            return;
          }
        }
      }
    } catch {
      return;
    }
    clearLastSessionLink();
    setSession(null);
    setSessionPassword(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth fora de AuthProvider");
  return v;
}
