import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Wallet, TrendingDown, Users, Loader2, Pencil, Trash2, History, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/pdv-data";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useSales, type Sale } from "@/hooks/use-sales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EditSaleModal } from "@/components/pdv/EditSaleModal";
import { useProducts } from "@/hooks/use-products";

type Filter = "dia" | "mes" | "ano";

function makeSeries(filter: Filter) {
  if (filter === "dia") {
    return Array.from({ length: 10 }).map((_, i) => ({ x: `${8 + i}h`, y: 20 + i * 7 + (i % 3) * 5 }));
  }
  if (filter === "mes") {
    return Array.from({ length: 12 }).map((_, i) => ({ x: `S${i + 1}`, y: 120 + i * 18 + (i % 4) * 9 }));
  }
  return Array.from({ length: 12 }).map((_, i) => ({ x: `M${i + 1}`, y: 900 + i * 55 + (i % 4) * 35 }));
}

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>("dia");
  const { faturamentoHoje, totalMes, vendasHoje, ticketMedio, custosMes, lucroMes, loading: loadingStats, refresh: refreshStats } = useDashboardStats();
  const { fetchSales, deleteSale, loading: loadingSales } = useSales();
  const { products } = useProducts();

  const [sales, setSales] = useState<Sale[]>([]);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

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
    const success = await deleteSale(id);
    if (success) {
      toast.success("Venda excluída");
      loadSales();
      refreshStats();
    } else {
      toast.error("Erro ao excluir venda");
    }
  };

  const handleSaveEdit = () => {
    toast.success("Venda atualizada com sucesso!");
    setEditingSale(null);
    loadSales();
    refreshStats();
  };

  const data = useMemo(() => makeSeries(filter), [filter]);

  const cards = useMemo(
    () => [
      { label: "Faturamento hoje", value: formatBRL(faturamentoHoje), icon: Wallet },
      { label: "Vendas hoje", value: vendasHoje.toString(), icon: ShoppingBag },
      { label: "Custos (mês)", value: formatBRL(custosMes), icon: Users },
      {
        label: "Lucro (mês)",
        value: formatBRL(lucroMes),
        icon: TrendingDown,
      },
    ],
    [faturamentoHoje, vendasHoje, custosMes, lucroMes]
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
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="bg-secondary/50 border-none">
            <TabsTrigger value="dia" className="rounded-xl data-[state=active]:bg-primary">Hoje</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      <section className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((c, idx) => (
            <Card key={c.label} className="rounded-3xl shadow-card border-none bg-background/50 backdrop-blur-md">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-xl font-extrabold tracking-tight font-mono-numbers">{c.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl shadow-card border-none bg-background/50 backdrop-blur-md">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Performance diária</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                ESTIMATIVA
              </span>
            </div>
            <div className="mt-3 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="x" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "none",
                      background: "hsl(var(--background))",
                      boxShadow: "var(--shadow-card)",
                    }}
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

          <Card className="rounded-3xl shadow-card border-none bg-background/50 backdrop-blur-md overflow-hidden">
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
                        <p className="text-sm font-extrabold font-mono-numbers">{formatBRL(sale.total)}</p>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingSale(sale)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
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
          open={!!editingSale}
          onClose={() => setEditingSale(null)}
          onSave={handleSaveEdit}
          products={products}
        />
      </section>
    </main>
  );
}

