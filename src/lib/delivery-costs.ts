import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";

import { DELIVERY_DAILY_COST_STORAGE_KEY } from "@/components/settings/DeliveryDailyCostCard";

export const DELIVERY_WORKED_DAYS_STORAGE_KEY = "pdv.delivery_worked_days_iso";

function readStoredNumber(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readStoredDeliveryDailyCostSafe(): number {
  return readStoredNumber(DELIVERY_DAILY_COST_STORAGE_KEY) ?? 0;
}

export function readStoredWorkedDaysISO(): string[] {
  try {
    const raw = window.localStorage.getItem(DELIVERY_WORKED_DAYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === "string");
  } catch {
    return [];
  }
}

export function writeStoredWorkedDaysISO(dates: Date[]) {
  const unique = Array.from(
    new Set(
      dates
        .filter(Boolean)
        .map((d) => format(d, "yyyy-MM-dd"))
        .filter((s) => typeof s === "string" && s.length === 10),
    ),
  ).sort();
  window.localStorage.setItem(DELIVERY_WORKED_DAYS_STORAGE_KEY, JSON.stringify(unique));
}

export function parseWorkedDays(isoDays: string[]): Date[] {
  // YYYY-MM-DD -> Date (local). Validamos formato simples.
  return isoDays
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s))
    .map((s) => {
      const [y, m, d] = s.split("-").map(Number);
      return new Date(y, m - 1, d);
    })
    .filter((d) => Number.isFinite(d.getTime()));
}

export type CostFilter = "dia" | "mes" | "ano";

export function countWorkedDaysFor(filter: CostFilter, workedDates: Date[], now = new Date()): number {
  if (filter === "dia") return workedDates.some((d) => isSameDay(d, now)) ? 1 : 0;
  if (filter === "mes") return workedDates.filter((d) => isSameMonth(d, now) && isSameYear(d, now)).length;
  return workedDates.filter((d) => isSameYear(d, now)).length;
}

export function computeDeliveryCostFor(filter: CostFilter, now = new Date()): { days: number; dailyCost: number; total: number } {
  const dailyCost = readStoredDeliveryDailyCostSafe();
  const worked = parseWorkedDays(readStoredWorkedDaysISO());
  const days = countWorkedDaysFor(filter, worked, now);
  return { days, dailyCost, total: dailyCost * days };
}
