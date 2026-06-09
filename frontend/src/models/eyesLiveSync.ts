import { devicesApi, sessionsApi } from "./api";
import { isDeviceActiveStatus } from "./deviceUtils";
import type { SessionLiveResponse } from "./types";

function isActiveLive(s: SessionLiveResponse | null): s is SessionLiveResponse {
  return s != null && s.status === "ACTIVE";
}

export async function fetchEyesLiveState(
  ownerEmail: string
): Promise<SessionLiveResponse | null> {
  let current: SessionLiveResponse | null = null;
  try {
    current = await sessionsApi.getCurrentLive(ownerEmail);
  } catch {
    current = null;
  }
  if (isActiveLive(current)) {
    return current;
  }

  try {
    const devices = await devicesApi.listForOwner(ownerEmail);
    const eyes = devices.find(
      (d) => d.type === "EYES_PHONE" && isDeviceActiveStatus(d.status)
    );
    if (eyes?.sessionId) {
      const fromDevice = await sessionsApi.getLive(eyes.sessionId);
      if (isActiveLive(fromDevice)) {
        return fromDevice;
      }
    }
  } catch {
    /* ignore */
  }

  return isActiveLive(current) ? current : null;
}
