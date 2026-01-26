import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PartyPopper, Sparkles, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Step = "produto" | "quantidade" | "pagamento" | "delivery" | "confirmar";

type Props = {
  step: Step;
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

export function OnboardingStepCard({ step, className }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const [dismissed, setDismissed] = useState(false);

  // show again on each step
  useEffect(() => setDismissed(false), [step]);

  const content = useMemo(() => {
    switch (step) {
      case "produto":
        return {
          icon: Sparkles,
          title: "Escolha rapidinho",
          text: "Toque no card do produto e pronto — sem menus escondidos.",
        };
      case "quantidade":
        return {
          icon: Wand2,
          title: "Aperta e vai",
          text: "Use + e −. O número gigante é pra não errar no corre do dia.",
        };
      case "pagamento":
        return {
          icon: Sparkles,
          title: "Pagou? Seleciona!",
          text: "PIX, cartão ou dinheiro — um toque e já era.",
        };
      case "delivery":
        return {
          icon: Wand2,
          title: "Vai de motoboy?",
          text: "Se for delivery, a taxa entra sozinha no total.",
        };
      case "confirmar":
      default:
        return {
          icon: PartyPopper,
          title: "Bora finalizar",
          text: "Confere o extrato e finaliza. O PDV 30 comemora com você.",
        };
    }
  }, [step]);

  if (dismissed) return null;

  const Icon = content.icon;
  return (
    <Card
      className={cn(
        // banner discreto: menos brilho, mais contraste e menor competição com o fluxo
        "relative overflow-hidden rounded-3xl border bg-background/70 shadow-card backdrop-blur supports-[backdrop-filter]:bg-background/60",
        !reduceMotion && "animate-pop",
        className,
      )}
    >
      <div className="relative p-3">
        {/* remove glows fortes pra não competir com os cards */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-secondary">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">{content.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{content.text}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Fechar dica"
            className="-mr-2 -mt-2"
            onClick={() => setDismissed(true)}
          >
            <X />
          </Button>
        </div>
      </div>
    </Card>
  );
}
