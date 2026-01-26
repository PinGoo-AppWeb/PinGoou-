import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  current: number; // 0-based
  total: number;
  stepsLabels: string[];
  canBack?: boolean;
  onBack?: () => void;
  className?: string;
};

export function SalesFlowStepper({
  title,
  current,
  total,
  stepsLabels,
  canBack = true,
  onBack,
  className,
}: Props) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <header className={cn("grid gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          disabled={!canBack}
          aria-label="Voltar"
        >
          <ArrowLeft />
        </Button>

        <div className="min-w-0 text-center">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">Fluxo de venda</p>
          <p className="truncate text-base font-semibold tracking-tight">{title}</p>
        </div>

        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
          {current + 1}/{total}
        </span>
      </div>

      {/* Stepper forte: trilho + preenchimento + dots com ênfase na etapa atual */}
      <div className="grid gap-2">
        <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-between px-2" aria-hidden="true">
            {stepsLabels.map((_, i) => {
              const isDone = i < current;
              const isActive = i === current;
              return (
                <span
                  key={i}
                  className={cn(
                    "rounded-full transition-[transform,background-color,opacity]",
                    isActive ? "h-3 w-3 bg-primary-foreground scale-110" : "h-2 w-2",
                    isDone ? "bg-primary-foreground/90" : "bg-muted-foreground/35",
                  )}
                />
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs font-medium tracking-wide text-muted-foreground">
          {stepsLabels[current] ?? ""}
        </p>
      </div>
    </header>
  );
}
