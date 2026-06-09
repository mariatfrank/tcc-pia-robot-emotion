import type { DeviceType } from "./types";

export function isDeviceActiveStatus(status: unknown): boolean {
  return String(status).toUpperCase() === "ACTIVE";
}

export const REGISTER_DEVICE_NAME: Record<DeviceType, string> = {
  EYES_PHONE: "Eyes Phone",
  GAME_TABLET: "Game Tablet",
};
