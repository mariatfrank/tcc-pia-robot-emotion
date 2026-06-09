const AUTH = "pia_robot_auth_session_v1";
const AUTH_PASSWORD = "pia_robot_auth_password_v1";

export interface AuthSession {
  email: string;
  name: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSession(): AuthSession | null {
  return readJson<AuthSession | null>(AUTH, null);
}

export function setSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(AUTH);
    return;
  }
  writeJson(AUTH, session);
}

export function getSessionPassword(): string | null {
  try {
    return localStorage.getItem(AUTH_PASSWORD);
  } catch {
    return null;
  }
}

export function setSessionPassword(password: string | null) {
  if (!password) {
    localStorage.removeItem(AUTH_PASSWORD);
    return;
  }
  localStorage.setItem(AUTH_PASSWORD, password);
}
