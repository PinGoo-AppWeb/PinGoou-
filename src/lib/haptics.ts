const KEY = "pdv_haptics_enabled";

export function getHapticsEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setHapticsEnabled(enabled: boolean) {
  try {
    localStorage.setItem(KEY, enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function vibrateLight() {
  try {
    if (typeof navigator === "undefined") return;
    if (!getHapticsEnabled()) return;
    // short + subtle
    navigator.vibrate?.(18);
  } catch {
    // ignore
  }
}
