import type {
  ApiErrorBody,
  ConnectionTestResult,
  DeviceResponse,
  DeviceType,
  SessionResponse,
  UserProfile,
} from "./types";
import { ownerEmailHeader } from "./ownerHeaders";
import { getSession } from "./authLocal";
import { normalizeSessionResponse } from "./sessionNormalize";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function sessionHeaders(): Record<string, string> {
  const user = getSession();
  return user?.email ? { "X-Pia-User-Email": user.email } : {};
}

async function apiFetchRaw(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...sessionHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetchRaw(path, init);
  const body = await parseJson(res);
  if (!res.ok) {
    const err = body as ApiErrorBody | null;
    const msg =
      err?.message ??
      (typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `Erro HTTP ${res.status}`);
    throw new Error(msg);
  }
  return body as T;
}

export const usersApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<UserProfile>("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<UserProfile>("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<UserProfile>("/api/users/me"),
  updatePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<void>("/api/users/me/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  forgotPassword: (email: string) =>
    apiFetch<void>("/api/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

export const connectionTestApi = {
  run: () =>
    apiFetch<ConnectionTestResult>("/api/connection-test", { method: "POST" }),
};

export const devicesApi = {
  list: () => apiFetch<DeviceResponse[]>("/api/devices"),
  register: (
    name: string,
    type: DeviceType,
    sessionId?: string,
    ownerEmail?: string
  ) =>
    apiFetch<DeviceResponse>("/api/devices", {
      method: "POST",
      body: JSON.stringify({ name, type, sessionId, ownerEmail }),
    }),
  deactivate: (id: string) =>
    apiFetch<void>(`/api/devices/${id}`, { method: "DELETE" }),
};

function normalizeSessions(list: SessionResponse[]): SessionResponse[] {
  return list.map((s) => normalizeSessionResponse(s));
}

export const sessionsApi = {
  listActive: () =>
    apiFetch<SessionResponse[]>("/api/sessions").then(normalizeSessions),
  claimUnowned: (ownerEmail?: string) =>
    apiFetch<void>("/api/sessions/claim-unowned", {
      method: "POST",
      headers: ownerEmailHeader(ownerEmail),
    }),
};
