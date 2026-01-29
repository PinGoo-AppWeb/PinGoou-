import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/pdv-data";
import { Download, FileText, PieChart, Bike, Loader2, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useFilteredStats, FilterPeriod } from "@/hooks/use-filtered-stats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MascotHeader } from "@/components/pdv/MascotHeader";

const PERIOD_LABELS: Record<FilterPeriod, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  month: "Este Mês",
  year: "Este Ano",
  custom: "Personalizado"
};

export default function Reports() {
  const [period, setPeriod] = useState<FilterPeriod>("month");
  const {
    totalRevenue,
    totalSales,
    ticketAverage,
    deliveryCosts,
    cardFees,
    paymentMix,
    loading: loadingStats
  } = useFilteredStats(period);

  const { profile, loading: loadingProfile } = useProfile();

  if (loadingProfile || loadingStats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <MascotHeader />
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Visão detalhada do seu negócio.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-semibold h-9">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {PERIOD_LABELS[period]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => setPeriod("today")}>Hoje</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("yesterday")}>Ontem</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("month")}>Este Mês</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPeriod("year")}>Este Ano</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="mt-4 grid gap-3">
        {/* Resumo Rápido */}
        <div className="grid grid-cols-2 gap-3">
          <ColorCard tone="purple">
            <div className="p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/80">Faturamento</p>
              <p className="text-lg font-black text-foreground mt-1 tracking-tight">{formatBRL(totalRevenue)}</p>
            </div>
          </ColorCard>
          <ColorCard tone="purple">
            <div className="p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/80">Ticket Médio</p>
              <p className="text-lg font-black text-foreground mt-1 tracking-tight">{formatBRL(ticketAverage)}</p>
            </div>
          </ColorCard>
        </div>

        <ColorCard tone="lime">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Despesas Operacionais</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Custos estimados no período selecionado.</p>
            <div className="mt-3 rounded-2xl border bg-background/50 p-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Taxas Cartão</span>
                <span className="font-bold text-destructive">-{formatBRL(cardFees)}</span>
              </div>
              <Separator className="my-2 bg-border/40" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Entregadores</span>
                <span className="font-bold text-destructive">-{formatBRL(deliveryCosts)}</span>
              </div>
              <Separator className="my-3 bg-border/40" />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-medium">Lucro Líquido Est.</p>
                <p className="text-base font-bold text-primary">{formatBRL(totalRevenue - (cardFees + deliveryCosts))}</p>
              </div>
            </div>
          </div>
        </ColorCard>

        <ColorCard tone="orange">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Mix de Pagamentos</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Distribuição de vendas por método.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Crédito</p>
                <p className="mt-1 text-base font-bold text-primary">{paymentMix.credit}%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Débito</p>
                <p className="mt-1 text-base font-bold text-primary">{paymentMix.debit}%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">PIX</p>
                <p className="mt-1 text-base font-bold text-primary">{paymentMix.pix}%</p>
              </div>
              <div className="rounded-2xl border bg-background/50 p-3 text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Caixa</p>
                <p className="mt-1 text-base font-bold text-primary">{paymentMix.cash}%</p>
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
              Baixe um relatório completo deste período.
            </p>
            <Button className="mt-4 w-full h-12 rounded-2xl shadow-soft" variant="hero">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV ({PERIOD_LABELS[period]})
            </Button>
          </div>
        </ColorCard>
      </section>
    </main>
  );
}
