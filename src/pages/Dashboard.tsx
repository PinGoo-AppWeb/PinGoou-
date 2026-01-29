import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, DollarSign, TrendingDown, TrendingUp, Loader2, Pencil, Trash2, History, AlertCircle, Calendar, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/pdv-data";
import { useFilteredStats, FilterPeriod } from "@/hooks/use-filtered-stats"; // Use o novo hook
import { useSales, type Sale } from "@/hooks/use-sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditSaleModal } from "@/components/pdv/EditSaleModal";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
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

export default function Dashboard() {
  const [period, setPeriod] = useState<FilterPeriod>("today"); // Default para Hoje no Dashboard

  // Usar o hook filtrado em vez do estático
  const {
    totalRevenue,
    totalSales,
    ticketAverage,
    totalCosts,
    netProfit,
    loading: loadingStats,
    refresh: refreshStats
  } = useFilteredStats(period);

  const { fetchSales, deleteSale, loading: loadingSales } = useSales();
  const { products } = useProducts();

  const [sales, setSales] = useState<Sale[]>([]);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadSales = async () => {
    const data = await fetchSales();
    setSales(data);
  };

  useEffect(() => {
    loadSales();
  }, []);

  // 🔄 Recarregar dados quando a página volta ao foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadSales();
        refreshStats();
      }
    };

    const handleFocus = () => {
      loadSales();
      refreshStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshStats]);

  const handleDelete = async (id: string) => {
    console.log("🗑️ Tentando excluir venda:", id);
    const success = await deleteSale(id);
    if (success) {
      console.log("✅ Venda excluída com sucesso");
      toast.success("Venda excluída");
      loadSales();
      refreshStats();
    } else {
      console.error("❌ Falha ao excluir venda");
      toast.error("Erro ao excluir venda. Verifique o console para mais detalhes.");
    }
  };

  const handleSaveEdit = () => {
    toast.success("Venda atualizada com sucesso!");
    setIsEditModalOpen(false);
    loadSales();
    refreshStats();
  };

  // Gerar dados reais do gráfico baseado nas vendas filtradas por período
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) {
      // Se não há vendas, retornar array vazio ou dados zerados
      return Array.from({ length: 24 }).map((_, i) => ({
        x: `${i}h`,
        y: 0
      }));
    }

    // Filtrar vendas pelo período selecionado
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
        break;
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
    }

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Agrupar vendas por hora
    const salesByHour = new Map<number, number>();

    filteredSales.forEach(sale => {
      const hour = new Date(sale.created_at).getHours();
      const currentTotal = salesByHour.get(hour) || 0;
      salesByHour.set(hour, currentTotal + Number(sale.total));
    });

    // Criar array de 24 horas com os totais
    return Array.from({ length: 24 }).map((_, hour) => ({
      x: `${hour}h`,
      y: salesByHour.get(hour) || 0
    }));
  }, [sales, period]);

  const cards = useMemo(
    () => [
      {
        label: "Faturamento",
        value: formatBRL(totalRevenue),
        icon: DollarSign,
        iconColor: "text-primary",
        valueColor: "text-foreground"
      },
      {
        label: "Vendas",
        value: totalSales.toString(),
        icon: Receipt,
        iconColor: "text-blue-500",
        valueColor: "text-foreground"
      },
      {
        label: "Custos",
        value: formatBRL(totalCosts),
        icon: TrendingDown,
        iconColor: "text-red-500",
        valueColor: "text-foreground"
      },
      {
        label: "Lucro Líquido",
        value: formatBRL(netProfit),
        icon: TrendingUp,
        iconColor: netProfit >= 0 ? "text-green-500" : "text-red-500",
        valueColor: "text-foreground"
      },
    ],
    [totalRevenue, totalSales, totalCosts, netProfit]
  );

  if (loadingStats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Estatísticas</h1>
          <p className="text-sm text-muted-foreground">Dados reais do seu PDV.</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-semibold h-9 bg-secondary/50 border-none">
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
        {totalSales === 0 && !loadingStats && (
          <Card className="rounded-3xl shadow-card dark:shadow-card-dark border-none bg-background/50 backdrop-blur-md p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-1">Nenhuma venda neste período</h3>
            <p className="text-xs text-muted-foreground">
              Não há vendas registradas para "{PERIOD_LABELS[period]}". Tente selecionar outro período.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c, idx) => (
            <Card key={c.label} className="rounded-3xl shadow-card dark:shadow-card-dark border-none bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  <c.icon className={cn("h-5 w-5", c.iconColor)} />
                </div>
                <p className={cn(
                  "mt-2 text-xl tracking-tight font-mono-numbers font-bold",
                  c.valueColor
                )}>
                  {c.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl shadow-card dark:shadow-card-dark border-none bg-background/50 backdrop-blur-md">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Performance diária</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                TEMPO REAL
              </span>
            </div>
            <div className="mt-3 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      background: "hsl(var(--background))",
                      boxShadow: "var(--shadow-card)",
                    }}
                    formatter={(value: number) => [formatBRL(value), "Vendas"]}
                    labelFormatter={(label) => `Horário: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Histórico de Vendas */}
        <section className="mt-2">
          <div className="flex items-center gap-2 mb-3 px-1">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-tight">Histórico de Vendas</h2>
          </div>

          <Card className="rounded-3xl shadow-card dark:shadow-card-dark border-none bg-background/50 backdrop-blur-md overflow-hidden">
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
              {sales.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-xs">Nenhuma venda registrada.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {sales.map((sale) => (
                    <div key={sale.id} className="p-4 flex items-center justify-between gap-3 group active:bg-secondary/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {format(new Date(sale.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold truncate">{sale.payment_method}</span>
                          {sale.is_delivery && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">DELIVERY</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold font-mono-numbers">{formatBRL(sale.total)}</p>

                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingSale(sale);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-destructive">
                                  <AlertCircle className="h-5 w-5" />
                                  Excluir Venda?
                                </DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja remover esta venda de {formatBRL(sale.total)}?
                                  Os relatórios serão recalculados.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-2xl">Cancelar</Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 rounded-2xl"
                                  onClick={() => handleDelete(sale.id)}
                                >
                                  Excluir
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Modal de Edição Completo */}
        <EditSaleModal
          sale={editingSale}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
          products={products}
        />
      </section>
    </main>
  );
}

