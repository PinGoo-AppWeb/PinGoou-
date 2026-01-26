import { z } from "zod";

export const MASCOT_SLEEP_SECONDS_STORAGE_KEY = "pdv.mascot_sleep_seconds";

// Limites para evitar valores absurdos/bugados.
export const mascotSleepSecondsSchema = z
  .number({ invalid_type_error: "Informe um número" })
  .int("Use um número inteiro")
  .finite("Valor inválido")
  .min(3, "Mínimo: 3s")
  .max(600, "Máximo: 600s");

export function readMascotSleepSeconds(defaultSeconds = 10): number {
  try {
    const raw = window.localStorage.getItem(MASCOT_SLEEP_SECONDS_STORAGE_KEY);
    if (!raw) return defaultSeconds;
    const parsed = Number(raw);
    const validated = mascotSleepSecondsSchema.safeParse(parsed);
    return validated.success ? validated.data : defaultSeconds;
  } catch {
    return defaultSeconds;
  }
}

export function writeMascotSleepSeconds(seconds: number) {
  window.localStorage.setItem(MASCOT_SLEEP_SECONDS_STORAGE_KEY, String(seconds));
}
