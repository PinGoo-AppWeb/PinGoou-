import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { paymentMethods, formatBRL } from "@/lib/pdv-data";
import { Check, CheckCircle2, CreditCard, Minus, Plus, Receipt, Trash2, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OnboardingStepCard } from "@/components/pdv/OnboardingStepCard";
import { ColorCard } from "@/components/pdv/ColorCard";
import { cn } from "@/lib/utils";
import { SalesFlowStepper } from "@/components/pdv/SalesFlowStepper";
import { useProducts } from "@/hooks/use-products";
import { useSales } from "@/hooks/use-sales";
import { useProfile } from "@/hooks/use-profile";
import { setLastSaleNow } from "@/lib/sale-activity";
import { SaleDateSelector } from "@/components/pdv/SaleDateSelector";

type Item = {
  productId: string;
  qty: number;
};

type Step = "produto" | "quantidade" | "pagamento" | "delivery" | "data" | "confirmar";

function toneForStep(step: Step) {
  if (step === "produto") return "lime" as const;
  if (step === "quantidade") return "indigo" as const;
  if (step === "pagamento") return "orange" as const;
  if (step === "delivery") return "indigo" as const;
  if (step === "data") return "indigo" as const;
  return "lime" as const;
}

function stepLabel(step: Step) {
  if (step === "produto") return "Produto";
  if (step === "quantidade") return "Quantidade";
  if (step === "pagamento") return "Pagamento";
  if (step === "delivery") return "Delivery";
  if (step === "data") return "Data";
  return "Confirmar";
}

function stepIndex(step: Step) {
  return ["produto", "quantidade", "pagamento", "delivery", "data", "confirmar"].indexOf(step);
}

export default function NewSale() {
  const navigate = useNavigate();
  const { products, loading: loadingProducts } = useProducts();
  const { createSale, loading: isSaving } = useSales();
  const { profile } = useProfile();
  const [step, setStep] = useState<Step>("produto");
  const [items, setItems] = useState<Item[]>([]);
  const [payment, setPayment] = useState(paymentMethods[0]);
  const [delivery, setDelivery] = useState(false);
  const [saleDate, setSaleDate] = useState<Date>(new Date());

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const p = productsById.get(it.productId);
      return acc + (p ? p.price * it.qty : 0);
    }, 0);
  }, [items, productsById]);
  const taxaDelivery = useMemo(() => (delivery ? 6 : 0), [delivery]);
  const total = useMemo(() => subtotal + taxaDelivery, [subtotal, taxaDelivery]);

  const steps: Step[] = useMemo(() => ["produto", "quantidade", "pagamento", "delivery", "data", "confirmar"], []);
  const current = stepIndex(step);
  const canNext = useMemo(() => {
    if (step === "produto") return items.length > 0;
    if (step === "quantidade") return items.length > 0 && items.every((it) => it.qty >= 1);
    if (step === "pagamento") return Boolean(payment);
    if (step === "delivery") return true;
    if (step === "data") return Boolean(saleDate);
    return true;
  }, [step, items, payment, saleDate]);

  const [enterFromRight, setEnterFromRight] = useState(false);
  const [enterKey, setEnterKey] = useState(0);

  const navActionRef = useRef<"next" | "back" | "jump">("jump");

  const vibrate = (pattern: number | number[]) => {
    if (profile?.haptics_enabled && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const goBack = () => {
    const i = stepIndex(step);
    if (i <= 0) return;
    vibrate(10);
    navActionRef.current = "back";
    setEnterFromRight(false);
    setStep(steps[i - 1]);
  };

  const goNext = () => {
    const i = stepIndex(step);
    if (i >= steps.length - 1) return;
    vibrate(15);
    navActionRef.current = "next";
    setEnterFromRight(true);
    setEnterKey((k) => k + 1);
    setStep(steps[i + 1]);
  };

  const bottomStack = useMemo(() => steps.slice(0, current), [steps, current]);

  const BOTTOM_PEEK = 18;
  const BOTTOM_Y_SPREAD = 8;

  const prevStepRef = useRef<Step>(step);
  const [leavingStep, setLeavingStep] = useState<Step | null>(null);
  const [leavingPhase, setLeavingPhase] = useState<"rest" | "left" | "down">("rest");
  const [enterAtRest, setEnterAtRest] = useState(true);

  useEffect(() => {
    const prev = prevStepRef.current;
    if (prev === step) return;

    setLeavingStep(prev);
    setLeavingPhase("rest");

    const isNext = navActionRef.current === "next";

    const raf = requestAnimationFrame(() => {
      setLeavingPhase(isNext ? "left" : "down");
    });

    const LEFT_MS = 220;
    const TOTAL_MS = 820;

    const t1 = isNext
      ? window.setTimeout(() => {
        setLeavingPhase("down");
      }, LEFT_MS)
      : undefined;

    const t2 = window.setTimeout(() => {
      setLeavingStep(null);
      setLeavingPhase("rest");
      navActionRef.current = "jump";
    }, TOTAL_MS);

    prevStepRef.current = step;
    return () => {
      cancelAnimationFrame(raf);
      if (t1) window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [step]);

  useEffect(() => {
    if (!enterFromRight) {
      setEnterAtRest(true);
      return;
    }

    setEnterAtRest(false);
    const raf = requestAnimationFrame(() => setEnterAtRest(true));
    const t = window.setTimeout(() => setEnterFromRight(false), 520);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [enterFromRight, setEnterFromRight]);

  const handleFinishSale = async () => {
    const saleItems = items.map(it => {
      const p = productsById.get(it.productId);
      return {
        product_id: it.productId,
        qty: it.qty,
        price_at_sale: p?.price || 0
      };
    });

    const result = await createSale({
      total,
      subtotal,
      taxa_delivery: taxaDelivery,
      payment_method: payment,
      is_delivery: delivery,
      items: saleItems,
      sale_date: saleDate,
    });

    if (result) {
      setLastSaleNow();
      toast.success("Venda finalizada com sucesso!");
      navigate("/");
    } else {
      toast.error("Erro ao salvar venda.");
    }
  };

  const renderStepContent = (s: Step) => {
    if (s === "produto") {
      return (
        <ColorCard tone="lime">
          <div className="p-4">
            <h1 className="text-base font-semibold tracking-tight">Escolha o produto</h1>
            <p className="mt-1 text-sm text-muted-foreground">Toque para adicionar ao carrinho.</p>
            <div className="mt-4 grid gap-2 max-h-[300px] overflow-y-auto pr-1">
              {loadingProducts ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-8 border rounded-2xl bg-muted/20">
                  <p className="text-sm">Nenhum produto cadastrado.</p>
                  <Button variant="link" onClick={() => navigate("/produtos")}>Cadastrar agora</Button>
                </div>
              ) : (
                products.map((p) => {
                  const qtyInCart = items.find((it) => it.productId === p.id)?.qty ?? 0;
                  const active = qtyInCart > 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        vibrate(5);
                        setItems((prev) => {
                          const idx = prev.findIndex((it) => it.productId === p.id);
                          if (idx >= 0) {
                            const next = [...prev];
                            next[idx] = { ...next[idx], qty: Math.min(999, next[idx].qty + 1) };
                            return next;
                          }
                          return [...prev, { productId: p.id, qty: 1 }];
                        });
                      }}
                      className={cn(
                        "w-full rounded-2xl border bg-background/90 p-4 text-left transition",
                        active ? "bg-secondary ring-2 ring-primary" : "hover:bg-secondary/60"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold tracking-tight leading-snug">{p.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatBRL(p.price)}</p>
                        </div>
                        {active && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                            {qtyInCart}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 rounded-2xl border bg-background/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Subtotal</p>
                  <p className="font-mono text-sm font-semibold">{formatBRL(subtotal)}</p>
                </div>
              </div>
            )}
          </div>
        </ColorCard>
      );
    }

    if (s === "quantidade") {
      return (
        <ColorCard tone="indigo">
          <div className="p-4">
            <h1 className="text-base font-semibold tracking-tight">Quantidade</h1>
            <div className="mt-4 grid gap-2">
              {items.map((it) => {
                const p = productsById.get(it.productId);
                if (!p) return null;
                return (
                  <div key={it.productId} className="rounded-2xl border bg-background/70 p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold truncate flex-1 pr-2">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => {
                        setItems(prev => prev.map(x => x.productId === it.productId ? { ...x, qty: Math.max(0, x.qty - 1) } : x).filter(x => x.qty > 0));
                      }}><Minus className="h-4 w-4" /></Button>
                      <span className="w-6 text-center font-mono font-bold">{it.qty}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => {
                        setItems(prev => prev.map(x => x.productId === it.productId ? { ...x, qty: x.qty + 1 } : x));
                      }}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ColorCard>
      );
    }

    if (s === "pagamento") {
      return (
        <ColorCard tone="orange">
          <div className="p-4">
            <h1 className="text-base font-semibold tracking-tight">Pagamento</h1>
            <div className="mt-4 grid gap-2">
              {paymentMethods.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    vibrate(10);
                    setPayment(m);
                  }}
                  className={cn(
                    "w-full rounded-2xl border bg-background/70 p-4 text-left flex items-center justify-between",
                    payment === m && "bg-secondary ring-2 ring-primary"
                  )}
                >
                  <span className="text-sm font-semibold">{m}</span>
                  {payment === m && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </ColorCard>
      );
    }

    if (s === "delivery") {
      return (
        <ColorCard tone="indigo">
          <div className="p-4">
            <h1 className="text-base font-semibold tracking-tight">Delivery?</h1>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => setDelivery(false)} className={cn("rounded-2xl border p-4 text-center", !delivery && "bg-secondary ring-2 ring-primary")}>Não</button>
              <button onClick={() => setDelivery(true)} className={cn("rounded-2xl border p-4 text-center", delivery && "bg-secondary ring-2 ring-primary")}>Sim</button>
            </div>
          </div>
        </ColorCard>
      );
    }

    if (s === "data") {
      return (
        <SaleDateSelector
          selectedDate={saleDate}
          onDateChange={(date) => date && setSaleDate(date)}
          onUseToday={() => setSaleDate(new Date())}
        />
      );
    }

    return (
      <ColorCard tone="lime">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Resumo</h2>
            <span className="font-mono text-lg font-bold">{formatBRL(total)}</span>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Método</span><span className="text-foreground font-medium">{payment}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Tipo</span><span className="text-foreground font-medium">{delivery ? "Delivery" : "Balcão"}</span></div>
          </div>
          {/* Ocultamos o botão do card no resumo se for a tela final para evitar duplicidade, 
              mas o usuário quer apenas 1 botão na tela toda. 
              Removeremos o botão de Continuar global e deixamos este apenas. */}
          <Button className="mt-6 w-full h-14" variant="hero" disabled={isSaving} onClick={() => {
            vibrate([10, 50, 10]);
            handleFinishSale();
          }}>
            {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
            Confirmar e finalizar
          </Button>
        </div>
      </ColorCard>
    );
  };

  const summaryFor = (s: Step) => {
    if (s === "produto") return `${items.length} prod.`;
    if (s === "quantidade") return `${items.reduce((a, b) => a + b.qty, 0)} itens`;
    if (s === "pagamento") return payment;
    if (s === "delivery") return delivery ? "Sim" : "Não";
    if (s === "data") {
      const today = new Date();
      const isToday = saleDate.toDateString() === today.toDateString();
      return isToday ? "Hoje" : saleDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    }
    return formatBRL(total);
  };

  const isLastStep = step === "confirmar";

  return (
    <main className="px-4 pb-28 pt-6 overflow-hidden animate-fade-in">
      <section className="flex flex-col gap-3">
        <OnboardingStepCard step={step} />
        <SalesFlowStepper title={stepLabel(step)} current={current} total={steps.length} stepsLabels={steps.map(stepLabel)} canBack={current !== 0} onBack={goBack} />

        <div className="relative min-h-[600px] overflow-hidden">
          {bottomStack.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 overflow-hidden">
              <div className="relative h-full">
                {bottomStack.map((s, i) => {
                  const depth = bottomStack.length - 1 - i;
                  const y = `calc(100% - ${BOTTOM_PEEK + depth * BOTTOM_Y_SPREAD}px)`;
                  return (
                    <div key={`bottom-${s}`} className="absolute inset-x-0 bottom-0" style={{ transform: `translate3d(0, ${y}, 0) scale(${1 - depth * 0.03})`, zIndex: 20 + i, opacity: 0.9 - depth * 0.1 }}>
                      <div className="mx-auto w-full max-w-md px-1">
                        <ColorCard tone={toneForStep(s)} className="rounded-3xl shadow-sm">
                          <div className="p-3">
                            <p className="text-[10px] text-muted-foreground">{stepLabel(s)}</p>
                            <p className="text-xs font-semibold">{summaryFor(s)}</p>
                          </div>
                        </ColorCard>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 z-30">
            <div className="mx-auto w-full max-w-md">
              <div key={step} className={cn("transition-all duration-500", enterFromRight ? "animate-slide-in-right" : "animate-fade-in")}>
                {renderStepContent(step)}
              </div>
            </div>
          </div>
        </div>

        {!isLastStep && (
          <div className="pt-2">
            <Button
              className="w-full h-16 rounded-3xl text-lg shadow-hero active:scale-95 transition-all"
              variant="hero"
              disabled={!canNext}
              onClick={goNext}
            >
              {`Continuar · ${formatBRL(total)}`}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

