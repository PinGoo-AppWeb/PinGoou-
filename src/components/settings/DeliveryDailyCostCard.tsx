import { useEffect, useMemo, useState } from "react";

import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/pdv-data";
import { Bike } from "lucide-react";
import { z } from "zod";

export const DELIVERY_DAILY_COST_STORAGE_KEY = "pdv.delivery_daily_cost_brl";

const costSchema = z
  .number({ invalid_type_error: "Informe um número" })
  .finite("Valor inválido")
  .min(0, "O custo não pode ser negativo")
  .max(1_000_000_000, "Custo muito alto");

export function readStoredDeliveryDailyCost(): number | null {
  try {
    const raw = window.localStorage.getItem(DELIVERY_DAILY_COST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function DeliveryDailyCostCard() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [costInput, setCostInput] = useState<string>("");
  const [savedCost, setSavedCost] = useState<number | null>(null);

  useEffect(() => {
    const existing = readStoredDeliveryDailyCost();
    setSavedCost(existing);
    setCostInput(existing == null ? "" : String(existing));
  }, []);

  const preview = useMemo(() => {
    const n = Number(costInput);
    return Number.isFinite(n) ? n : null;
  }, [costInput]);

  const handleSave = () => {
    const asNumber = Number(costInput);
    const parsed = costSchema.safeParse(asNumber);

    if (!parsed.success) {
      toast({
        title: "Valor inválido",
        description: parsed.error.issues[0]?.message ?? "Confira o valor informado.",
        variant: "destructive",
      });
      return;
    }

    try {
      window.localStorage.setItem(DELIVERY_DAILY_COST_STORAGE_KEY, String(parsed.data));
      setSavedCost(parsed.data);
      toast({
        title: "Custo salvo!",
        description: `Custo diário definido em ${formatBRL(parsed.data)}.`,
      });
      setDialogOpen(false);
    } catch {
      toast({
        title: "Não foi possível salvar",
        description: "Seu navegador bloqueou o armazenamento local.",
        variant: "destructive",
      });
    }
  };

  return (
    <ColorCard tone="lime">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Bike className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold tracking-tight">Custo diário do entregador</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Defina quanto custa manter o entregador por dia.</p>
        <Separator className="my-3" />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full rounded-2xl border bg-background/70 p-3 text-left transition-colors hover:bg-background/90 active:scale-[0.98]">
              <p className="text-[11px] text-muted-foreground">Custo atual</p>
              <p className="mt-1 text-base font-semibold">
                {savedCost == null ? "Não definido" : formatBRL(savedCost)}
              </p>
              {preview != null && preview !== savedCost ? (
                <p className="mt-1 text-xs text-muted-foreground">Prévia: {formatBRL(preview)}</p>
              ) : null}
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Custo diário do entregador</DialogTitle>
              <DialogDescription>Informe o custo por dia (em R$).</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-daily-cost">Custo (R$ / dia)</Label>
                <Input
                  id="delivery-daily-cost"
                  type="number"
                  step="0.01"
                  min={0}
                  inputMode="decimal"
                  placeholder="120"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ColorCard>
  );
}
