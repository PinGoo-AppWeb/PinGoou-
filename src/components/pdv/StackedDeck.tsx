import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

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

type Props = {
  className?: string;
  /** Cards (já prontos) */
  children: React.ReactNode[] | React.ReactNode;
  /** Espaçamento quando aberto */
  expandedGap?: number;
  /** Offset do empilhamento quando fechado */
  collapsedOffset?: number;
  /** Altura base do card quando fechado (para evitar “pulo”) */
  collapsedCardHeight?: number;
  /** Callback quando o estado expandido muda */
  onExpandedChange?: (expanded: boolean) => void;
};

/**
 * Deck vertical: cards empilhados e desalinhados (tipo baralho).
 * - Desktop: abre no hover
 * - Mobile: abre ao tocar
 */
export function StackedDeck({
  className,
  children,
  expandedGap = 12,
  collapsedOffset = 18,
  collapsedCardHeight = 190,
  onExpandedChange,
}: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const items = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [expanded, setExpanded] = useState(false);

  // abre/fecha apenas no toque/clique
  const onToggle = () => {
    setExpanded((v) => {
      const newValue = !v;
      onExpandedChange?.(newValue);
      return newValue;
    });
  };

  // container height in collapsed mode (so it doesn't jump)
  const collapsedHeight = collapsedCardHeight + (items.length - 1) * collapsedOffset;

  return (
    <div className={cn("select-none", className)}>
      <div
        className={cn("relative", expanded ? "" : "cursor-pointer")}
        style={{ minHeight: expanded ? undefined : collapsedHeight }}
        onClick={() => {
          onToggle();
        }}
        role="group"
        aria-label="Menu em formato de baralho"
      >
        {items.map((node, i) => {
          const isTop = i === 0;
          const rotate = i % 2 === 0 ? -1.2 : 1.2;
          const x = i % 2 === 0 ? -6 : 6;
          const y = i * collapsedOffset;
          const z = items.length - i;
          // deixa o baralho “mais de fundo” no modo fechado
          const scale = Math.max(0.92, 0.96 - i * 0.01);

          return (
            <div
              key={i}
              className={cn(
                "transition-[transform,opacity,filter] duration-300",
                reduceMotion && "transition-none",
                expanded ? "relative" : "absolute left-0 right-0",
              )}
              style={
                expanded
                  ? {
                      zIndex: 1,
                      marginTop: i === 0 ? 0 : expandedGap,
                    }
                  : {
                      zIndex: z,
                      transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
                      filter: isTop ? "saturate(0.95)" : "saturate(0.88)",
                      opacity: isTop ? 0.98 : 0.96,
                      pointerEvents: "auto",
                    }
              }
            >
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
