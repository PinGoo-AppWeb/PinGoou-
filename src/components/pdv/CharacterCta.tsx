import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type React from "react";

type Props = {
  to: string;
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * Signature moment: o personagem "30" com olhos que acompanham o toque/mouse (leve e acessível).
 */
export function CharacterCta({ to, className }: Props) {
  const nav = useNavigate();
  const ref = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      el.style.setProperty("--eye-x", String(clamp(x) * 5));
      el.style.setProperty("--eye-y", String(clamp(y) * 3));
    };
    const onLeave = () => {
      el.style.setProperty("--eye-x", "0");
      el.style.setProperty("--eye-y", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => nav(to)}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-primary px-4 py-5 text-primary-foreground shadow-soft transition active:translate-y-px",
        !reduceMotion && "animate-float-y",
        className,
      )}
      style={{ "--eye-x": "0", "--eye-y": "0" } as React.CSSProperties}
      aria-label="Registrar nova venda"
    >
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-primary-foreground/90">Toque para vender</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Nova venda</p>
        </div>

        <div className="relative flex h-16 w-28 items-center justify-center rounded-xl bg-primary-foreground/12">
          {/* bubble highlight */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary-foreground/12 blur-xl" />

          {/* Character */}
          <div className="relative flex items-center gap-2">
            <div className="text-3xl font-black tracking-tighter">30</div>
            <div className="relative mt-1 flex items-center gap-2">
              {/* eyes */}
              <div className="relative h-6 w-6 rounded-full bg-background/95">
                <div
                  className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                  style={{
                    transform:
                      "translate(calc(-50% + var(--eye-x) * 1px), calc(-50% + var(--eye-y) * 1px))",
                  }}
                />
              </div>
              <div className="relative h-6 w-6 rounded-full bg-background/95">
                <div
                  className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                  style={{
                    transform:
                      "translate(calc(-50% + var(--eye-x) * 1px), calc(-50% + var(--eye-y) * 1px))",
                  }}
                />
              </div>

              {/* little tear */}
              <span
                className={cn(
                  "absolute -right-2 -top-1 block h-3 w-2 rotate-12 rounded-full bg-accent",
                  !reduceMotion && "animate-wiggle",
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
