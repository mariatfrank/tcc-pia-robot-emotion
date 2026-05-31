import { devicesApi } from "./api";
import { REGISTER_DEVICE_NAME, isDeviceActiveStatus } from "./deviceUtils";
import type { DeviceResponse, DeviceType } from "./types";

const DEVICE_ID_PREFIX = "pia_robot_device_id";
const PAIRING_ID_PREFIX = "pia_robot_pairing_id";
const OWNER_EMAIL_PREFIX = "pia_robot_owner_email";

function deviceIdKey(type: DeviceType) {
  return `${DEVICE_ID_PREFIX}_${type}`;
}

function pairingIdKey(type: DeviceType) {
  return `${PAIRING_ID_PREFIX}_${type}`;
}

function ownerEmailKey(type: DeviceType) {
  return `${OWNER_EMAIL_PREFIX}_${type}`;
}

export function createPairingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readPairedDeviceId(type: DeviceType): string | null {
  return localStorage.getItem(deviceIdKey(type));
}

export function readPairedOwnerEmail(type: DeviceType): string | null {
  return localStorage.getItem(ownerEmailKey(type));
}

export async function pairScannedDevice(
  type: DeviceType,
  pairingId: string,
  ownerEmail?: string,
  sessionId?: string
): Promise<DeviceResponse> {
  const storedPairing = localStorage.getItem(pairingIdKey(type));
  const storedDeviceId = localStorage.getItem(deviceIdKey(type));

  if (storedPairing === pairingId && storedDeviceId) {
    try {
      const existing = await devicesApi.get(storedDeviceId);
      if (isDeviceActiveStatus(existing.status)) {
        if (ownerEmail) {
          localStorage.setItem(ownerEmailKey(type), ownerEmail.trim().toLowerCase());
        }
        return existing;
      }
    } catch {
      localStorage.removeItem(deviceIdKey(type));
      localStorage.removeItem(pairingIdKey(type));
    }
  }

  const device = await devicesApi.register(
    REGISTER_DEVICE_NAME[type],
    type,
    sessionId,
    ownerEmail
  );
  localStorage.setItem(pairingIdKey(type), pairingId);
  localStorage.setItem(deviceIdKey(type), device.id);
  if (ownerEmail) {
    localStorage.setItem(ownerEmailKey(type), ownerEmail.trim().toLowerCase());
  }
  return device;
}

export async function ensurePairedDeviceActive(
  type: DeviceType
): Promise<boolean> {
  const id = readPairedDeviceId(type);
  if (!id) return true;
  const device = await devicesApi.get(id);
  return isDeviceActiveStatus(device.status);
}
