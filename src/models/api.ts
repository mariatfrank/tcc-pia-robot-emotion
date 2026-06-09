import type {
  ApiErrorBody,
  ConnectionTestResult,
  SessionLiveResponse,
  DeviceResponse,
  DeviceType,
  Difficulty,
  EmotionType,
  GameEventResponse,
  GameEventType,
  GameSettings,
  ManualEmotionResponse,
  SessionResponse,
  UserProfile,
} from "./types";
import { ownerEmailHeader } from "./ownerHeaders";
import { getSession } from "./authLocal";
import { normalizeSessionResponse, parseEmotion } from "./sessionNormalize";

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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
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
  listForOwner: (ownerEmail: string) =>
    apiFetch<DeviceResponse[]>("/api/devices", {
      headers: ownerEmailHeader(ownerEmail),
    }),
  get: (id: string) =>
    apiFetch<DeviceResponse>(`/api/devices/${encodeURIComponent(id)}`),
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
  listActiveForOwner: (ownerEmail: string) =>
    apiFetch<SessionResponse[]>("/api/sessions", {
      headers: ownerEmailHeader(ownerEmail),
    }).then(normalizeSessions),
  listHistory: () =>
    apiFetch<SessionResponse[]>("/api/sessions/history").then(normalizeSessions),
  get: (id: string) =>
    apiFetch<SessionResponse>(`/api/sessions/${encodeURIComponent(id)}`).then(
      normalizeSessionResponse
    ),
  getLive: (id: string) =>
    apiFetch<SessionLiveResponse>(
      `/api/sessions/${encodeURIComponent(id)}/live`
    ).then((s) => ({
      ...s,
      currentEmotion: parseEmotion(s.currentEmotion),
    })),
  getCurrentLive: async (ownerEmail: string): Promise<SessionLiveResponse | null> => {
    const res = await apiFetchRaw("/api/sessions/current-live", {
      headers: ownerEmailHeader(ownerEmail),
    });
    if (res.status === 204) return null;
    const body = await parseJson(res);
    if (!res.ok) {
      const err = body as ApiErrorBody | null;
      throw new Error(err?.message ?? `Erro HTTP ${res.status}`);
    }
    const s = body as SessionLiveResponse;
    return {
      ...s,
      currentEmotion: parseEmotion(s.currentEmotion),
    };
  },
  create: (gameCode: string, difficulty: Difficulty, ownerEmail?: string) =>
    apiFetch<SessionResponse>("/api/sessions", {
      method: "POST",
      headers: ownerEmailHeader(ownerEmail),
      body: JSON.stringify({ gameCode, difficulty }),
    }).then(normalizeSessionResponse),
  claimUnowned: (ownerEmail?: string) =>
    apiFetch<void>("/api/sessions/claim-unowned", {
      method: "POST",
      headers: ownerEmailHeader(ownerEmail),
    }),
  listEvents: (sessionId: string) =>
    apiFetch<GameEventResponse[]>(`/api/sessions/${sessionId}/events`),
  postEvent: (
    sessionId: string,
    type: GameEventType,
    points: number,
    ownerEmail?: string
  ) =>
    apiFetch<GameEventResponse>(`/api/sessions/${sessionId}/events`, {
      method: "POST",
      headers: ownerEmailHeader(ownerEmail),
      body: JSON.stringify({ type, points }),
    }),
  setEmotion: (sessionId: string, emotion: EmotionType) =>
    apiFetch<SessionResponse>(`/api/sessions/${sessionId}/emotion`, {
      method: "POST",
      body: JSON.stringify({ emotion }),
    }).then(normalizeSessionResponse),
};

export const healthApi = {
  health: () => apiFetch<{ status: string }>("/actuator/health"),
};

export const gameSettingsApi = {
  get: () => apiFetch<GameSettings>("/api/game-settings"),
  getForOwner: (ownerEmail: string) =>
    apiFetch<GameSettings>("/api/game-settings", {
      headers: { "X-Pia-User-Email": ownerEmail },
    }),
  update: (settings: GameSettings) =>
    apiFetch<GameSettings>("/api/game-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
};

export const manualEmotionApi = {
  get: () => apiFetch<ManualEmotionResponse>("/api/manual-emotion"),
  getForOwner: (ownerEmail: string) =>
    apiFetch<ManualEmotionResponse>("/api/manual-emotion", {
      headers: { "X-Pia-User-Email": ownerEmail },
    }),
  update: (emotion: EmotionType) =>
    apiFetch<ManualEmotionResponse>("/api/manual-emotion", {
      method: "POST",
      body: JSON.stringify({ emotion }),
    }),
};

export const infoApi = {
  info: () =>
    apiFetch<{ app?: { name?: string; version?: string; description?: string } }>(
      "/actuator/info"
    ),
};

