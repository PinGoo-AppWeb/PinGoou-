import { useEffect, useState } from "react";
import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Target, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { formatBRL } from "@/lib/pdv-data";
import { toast } from "sonner";

export function MonthlyRevenueGoalCard() {
  const { profile, updateProfile } = useProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalInput, setGoalInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.monthly_revenue_goal_brl) {
      setGoalInput(profile.monthly_revenue_goal_brl.toString());
    }
  }, [profile]);

  const handleSave = async () => {
    const cleaned = goalInput.replace(",", ".");
    const asNumber = parseFloat(cleaned);

    if (isNaN(asNumber)) {
      toast.error("Informe um valor válido.");
      return;
    }

    setIsSaving(true);
    const success = await updateProfile({
      monthly_revenue_goal_brl: asNumber,
    });

    if (success) {
      toast.success("Meta atualizada!");
      setDialogOpen(false);
    } else {
      toast.error("Erro ao salvar meta.");
    }
    setIsSaving(false);
  };

  return (
    <ColorCard tone="lime">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold tracking-tight">Meta mensal de faturamento</p>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">O valor que você pretende faturar no mês.</p>
        <Separator className="my-3" />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full rounded-2xl border bg-background/50 p-4 text-left transition-all hover:bg-background/80 active:scale-[0.98]">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Meta atual</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {profile?.monthly_revenue_goal_brl ? formatBRL(profile.monthly_revenue_goal_brl) : "Não definida"}
              </p>
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Meta Mensal</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Informe o faturamento total pretendido para este mês.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="monthly-goal" className="text-sm font-semibold">Valor da Meta (R$)</Label>
                <Input
                  id="monthly-goal"
                  type="number"
                  placeholder="Ex: 10000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-2xl">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-primary shadow-soft">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Meta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ColorCard>
  );
}

