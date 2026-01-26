const STORAGE_KEY = "pdv:lastSaleAt";

export function getLastSaleAt(): number {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n > 0) return n;

  // Primeira execução: considera "agora" como última venda para evitar acenar imediatamente.
  const now = Date.now();
  window.localStorage.setItem(STORAGE_KEY, String(now));
  return now;
}

export function setLastSaleNow() {
  const now = Date.now();
  window.localStorage.setItem(STORAGE_KEY, String(now));
  window.dispatchEvent(new CustomEvent("pdv:last-sale", { detail: { at: now } }));
}
