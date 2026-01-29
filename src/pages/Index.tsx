import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ColorCard } from "@/components/pdv/ColorCard";
import { StackedDeck } from "@/components/pdv/StackedDeck";
import { Hand, TrendingUp, Loader2 } from "lucide-react";
import { formatBRL } from "@/lib/pdv-data";
import { NavLink, useLocation } from "react-router-dom";
import { MascotAnimated } from "@/components/pdv/MascotAnimated";
import { cn } from "@/lib/utils";
import { useSaleInactivity } from "@/hooks/use-sale-inactivity";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/use-profile";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useMascotMood } from "@/contexts/MascotContext";

const Index = () => {
  const location = useLocation();
  const { profile, loading: loadingProfile } = useProfile();
  const { faturamentoHoje, totalMes, vendasHoje, ticketMedio, loading: loadingStats, refresh: refreshStats } = useDashboardStats();
  const { setMood } = useMascotMood(); // Hook para sincronizar mood

  const [cardsExpanded, setCardsExpanded] = useState(false);
  const sleepSeconds = profile?.mascot_sleep_seconds || 10;
  const { inactive, msSince } = useSaleInactivity({ inactivityMs: sleepSeconds * 1000, pollMs: 1000 });

  // Forçamos o mascote a começar feliz na primeira carga da sessão
  const [firstLoad, setFirstLoad] = useState(() => {
    const sessionSeen = sessionStorage.getItem("pingoou:session-seen");
    if (!sessionSeen) {
      sessionStorage.setItem("pingoou:session-seen", "true");
      return true;
    }
    return false;
  });

  const isHappy = (!inactive && msSince < 8000) || firstLoad;
  const currentMood = isHappy ? "happy" : (inactive ? "sleep" : "active");

  // Sincronizar mood com contexto global
  useEffect(() => {
    setMood(currentMood);
  }, [currentMood, setMood]);

  useEffect(() => {
    if (firstLoad) {
      const timer = setTimeout(() => setFirstLoad(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [firstLoad]);

  // 🔄 Recarregar stats sempre que a rota mudar (ex: voltar de /venda/nova)
  useEffect(() => {
    refreshStats();
  }, [location.pathname, refreshStats]);

  // 🔄 Recarregar stats quando a página volta ao foco (após registrar venda)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStats();
      }
    };

    const handleFocus = () => {
      refreshStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshStats]);

  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);

  useEffect(() => {
    if (profile) {
      setMonthlyGoal(profile.monthly_revenue_goal_brl);
    }
  }, [profile]);

  const targetPct = useMemo(() => {
    if (monthlyGoal == null || monthlyGoal === 0) return null;
    const pct = (totalMes / monthlyGoal) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [monthlyGoal, totalMes]);

  if (loadingProfile || loadingStats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative px-4 pb-64 pt-6 animate-fade-in">
      <div className="pointer-events-none fixed inset-x-0 bottom-12 z-40">
        <div className="flex w-full justify-center">
          <NavLink
            to="/venda/nova"
            aria-label="Registrar nova venda"
            className="pointer-events-auto block"
          >
            <div className="relative flex h-44 w-[min(320px,100vw)] items-end justify-center overflow-visible">
              <MascotAnimated
                className={cn(
                  "relative z-10 h-full w-full origin-bottom transition-transform duration-500 ease-in-out animate-slide-in-bottom-scaled-centered",
                  cardsExpanded ? "translate-y-[90vh] scale-[0.9]" : "translate-y-0 scale-[0.9]",
                )}
                mode={currentMood}
                title="Nova venda"
              />
            </div>
          </NavLink>
        </div>
      </div>

      <section className="my-4 pt-2">
        <Card className="mx-auto max-w-md overflow-hidden rounded-3xl border bg-background shadow-card">
          <div className="relative p-7 text-left">
            <p className="text-xs font-medium tracking-wide text-muted-foreground">Faturamento de hoje</p>
            <h1 className="mt-3 text-[44px] font-semibold leading-[1] tracking-tight font-mono-numbers">{formatBRL(faturamentoHoje)}</h1>
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Realtime
            </span>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">KPIs (toque para abrir)</p>
        <StackedDeck
          className="mt-1 mx-auto w-full max-w-md"
          collapsedCardHeight={210}
          expandedGap={14}
          collapsedOffset={20}
          onExpandedChange={setCardsExpanded}
        >
          <ColorCard tone="lime">
            <div className="min-h-[160px] p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">Faturamento (mês)</p>
                {!cardsExpanded && (
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary shadow-sm text-muted-foreground">
                    <Hand className="h-4 w-4" />
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono-numbers text-3xl font-semibold leading-[1] tracking-tight">{formatBRL(totalMes)}</p>
              <div className="mt-4 rounded-2xl border bg-background/70 p-3">
                <p className="text-[11px] text-muted-foreground">Meta</p>
                {monthlyGoal == null ? (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">Não definida</p>
                ) : (
                  <div className="mt-1 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">{Math.round(targetPct ?? 0)}%</p>
                      <p className="text-[11px] text-muted-foreground">{formatBRL(totalMes)} / {formatBRL(monthlyGoal)}</p>
                    </div>
                    <Progress value={targetPct || 0} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </ColorCard>
          <ColorCard tone="indigo">
            <div className="min-h-[160px] p-6">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">Vendas (hoje)</p>
              <p className="mt-2 font-mono-numbers text-3xl font-semibold leading-[1] tracking-tight">{vendasHoje}</p>
              <p className="mt-1 text-sm text-muted-foreground">pedidos realizados hoje</p>
            </div>
          </ColorCard>
          <ColorCard tone="orange">
            <div className="min-h-[160px] p-6">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">Ticket Médio (hoje)</p>
              <p className="mt-2 font-mono-numbers text-3xl font-semibold leading-[1] tracking-tight">{formatBRL(ticketMedio)}</p>
              <p className="mt-1 text-sm text-muted-foreground">valor médio por pedido</p>
            </div>
          </ColorCard>
        </StackedDeck>
      </section>
    </main>
  );
};

export default Index;