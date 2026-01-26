import { useEffect, useMemo, useState } from "react";
import { getLastSaleAt } from "@/lib/sale-activity";

type Options = {
  inactivityMs?: number;
  pollMs?: number;
};

export function useSaleInactivity(options: Options = {}) {
  const inactivityMs = options.inactivityMs ?? 5 * 60 * 1000;
  const pollMs = options.pollMs ?? 15 * 1000;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, pollMs);
    const onSale = () => tick();

    window.addEventListener("pdv:last-sale", onSale);
    window.addEventListener("storage", onSale);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("pdv:last-sale", onSale);
      window.removeEventListener("storage", onSale);
    };
  }, [pollMs]);

  const lastSaleAt = useMemo(() => getLastSaleAt(), [now]);
  const msSince = Math.max(0, now - lastSaleAt);
  const inactive = msSince >= inactivityMs;

  return { inactive, msSince, lastSaleAt };
}
