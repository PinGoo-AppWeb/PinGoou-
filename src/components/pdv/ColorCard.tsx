import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { ReactNode } from "react";

type Tone = "lime" | "indigo" | "orange";

type Props = {
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

const toneClass: Record<Tone, string> = {
  lime: "bg-card-lime shadow-glow-lime",
  indigo: "bg-card-indigo shadow-glow-indigo",
  orange: "bg-card-orange shadow-glow-orange",
};

/**
 * Cards coloridos (estilo referência): gradiente + glow leve, grandes e bem arredondados.
 */
export const ColorCard = React.forwardRef<HTMLDivElement, Props>(
  ({ tone = "lime", className, style, children }, ref) => (
    <Card
      ref={ref}
      style={style}
      className={cn(
        "relative overflow-hidden rounded-3xl border-0 shadow-card",
        toneClass[tone],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="relative">{children}</div>
    </Card>
  ),
);
ColorCard.displayName = "ColorCard";
