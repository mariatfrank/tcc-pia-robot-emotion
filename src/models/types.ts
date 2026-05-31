export type DeviceType = "GAME_TABLET" | "EYES_PHONE";
export type DeviceStatus = "ACTIVE" | "INACTIVE";
export type Difficulty = "EASY" | "NORMAL" | "HARD";
export type SessionStatus = "ACTIVE" | "FINISHED";
export type GameEventType = "GAME_STARTED" | "HIT" | "MISS" | "GAME_FINISHED";
export type EmotionType = "IDLE" | "FOCUSED" | "HAPPY" | "SAD" | "SURPRISED" | "CELEBRATING";

export interface DeviceResponse {
  id: string;
  name: string;
  ownerEmail?: string | null;
  sessionId?: string | null;
  type: DeviceType;
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  id: string;
  gameCode: string;
  ownerEmail?: string | null;
  difficulty: Difficulty;
  status: SessionStatus;
  playStarted: boolean;
  currentEmotion: EmotionType;
  score: number;
  hits: number;
  misses: number;
  startedAt: string;
  finishedAt: string | null;
}

export interface SessionLiveResponse {
  id: string;
  status: SessionStatus;
  playStarted: boolean;
  currentEmotion: EmotionType;
  score: number;
  hits: number;
  misses: number;
}

export interface GameSettings {
  difficulty: Difficulty;
  durationSec: number;
  soundEnabled: boolean;
}

export interface ManualEmotionResponse {
  emotion: EmotionType;
}

export interface GameEventResponse {
  id: string;
  sessionId: string;
  type: GameEventType;
  points: number;
  createdAt: string;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionTestResult {
  backendOk: boolean;
  backendMessage: string;
  eyesPhoneConnected: boolean;
  eyesPhoneMessage: string;
  gameTabletConnected: boolean;
  gameTabletMessage: string;
  summary: string;
}

