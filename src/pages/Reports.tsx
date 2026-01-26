import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/pdv-data";
import { Download, FileText, PieChart, Bike, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useDeliveryTracking } from "@/hooks/use-delivery-tracking";

export default function Reports() {
  const { profile, loading: loadingProfile } = useProfile();
  const { loading: loadingStats } = useDashboardStats();
  const { workedDays, loading: loadingDelivery } = useDeliveryTracking();

  const delivery = useMemo(() => {
    if (!profile) return { dailyCost: 0, total: 0, days: 0 };
    const days = workedDays.length;
    return {
      dailyCost: profile.delivery_daily_cost_brl,
      days,
      total: profile.delivery_daily_cost_brl * days
    };
  }, [profile, workedDays]);

  if (loadingProfile || loadingStats || loadingDelivery) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <section>
        <h1 className="text-base font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Visão detalhada do seu negócio.</p>
      </section>

      <section className="mt-4 grid gap-3">
        <ColorCard tone="lime">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Custo do entregador</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Custo total baseado nos dias marcados.</p>
            <div className="mt-3 rounded-2xl border bg-background/50 p-4">
              <div className="flex justify-between items-center text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <span>Diária</span>
                <span>Dias Marcados</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm font-bold">{formatBRL(delivery.dailyCost)}</p>
                <p className="text-sm font-bold text-primary">{delivery.days}</p>
              </div>
              <Separator className="my-3 bg-border/40" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">Total Acumulado</p>
                <p className="text-base font-bold text-primary">{formatBRL(delivery.total)}</p>
              </div>
            </div>
          </div>
        </ColorCard>

        <ColorCard tone="indigo">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Exportar Dados</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Gere um relatório detalhado de todas as suas vendas.
            </p>
            <Button className="mt-4 w-full h-12 rounded-2xl shadow-soft" variant="hero">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </ColorCard>

        <ColorCard tone="orange">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Mix de Pagamentos</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Distribuição estimada de recebimentos.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Crédito</p>
                <p className="mt-1 text-base font-bold text-primary">--%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Débito</p>
                <p className="mt-1 text-base font-bold text-primary">--%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">PIX</p>
                <p className="mt-1 text-base font-bold text-primary">--%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Caixa</p>
                <p className="mt-1 text-base font-bold text-primary">--%</p>
              </div>
            </div>
          </div>
        </ColorCard>
      </section>
    </main>
  );
}
