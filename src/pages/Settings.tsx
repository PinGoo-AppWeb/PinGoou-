import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { BookOpen, CreditCard, Percent, Truck, User2, Vibrate, Loader2, Calendar as CalendarIcon, Camera, Trash, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MonthlyRevenueGoalCard } from "@/components/settings/MonthlyRevenueGoalCard";
import { useProfile } from "@/hooks/use-profile";
import { useDeliveryTracking } from "@/hooks/use-delivery-tracking";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { formatBRL } from "@/lib/pdv-data";
import { cn } from "@/lib/utils";


export default function Settings() {
  const navigate = useNavigate();
  const { profile, loading: loadingProfile, updateProfile } = useProfile();
  const { workedDays, toggleDay, loading: loadingDelivery } = useDeliveryTracking();

  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("6.00");
  const [deliveryDailyCost, setDeliveryDailyCost] = useState("120.00");
  const [cardRateCredit, setCardRateCredit] = useState("2.99");
  const [cardRateDebit, setCardRateDebit] = useState("1.99");
  const [mascotSleepSeconds, setMascotSleepSeconds] = useState("10");
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [cardRatesOpen, setCardRatesOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [resetDataOpen, setResetDataOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setStoreName(profile.store_name || "");
      setDeliveryFee(profile.delivery_fee_brl.toString());
      setDeliveryDailyCost(profile.delivery_daily_cost_brl.toString());
      setCardRateCredit(profile.card_rate_credit.toString());
      setCardRateDebit(profile.card_rate_debit.toString());
      setMascotSleepSeconds(profile.mascot_sleep_seconds.toString());
    }
  }, [profile]);

  const parseNumber = (val: string) => {
    // Replace comma with dot and remove other characters except numbers and dot
    const cleaned = val.replace(",", ".");
    return parseFloat(cleaned);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim() || !storeName.trim()) {
      toast.error("Preencha todos os campos do perfil.");
      return;
    }
    setIsSaving(true);
    const success = await updateProfile({
      full_name: fullName,
      store_name: storeName,
    });
    if (success) toast.success("Perfil atualizado!");
    else toast.error("Erro ao atualizar perfil.");
    setIsSaving(false);
  };

  const handleSaveCardRates = async () => {
    const cred = parseNumber(cardRateCredit);
    const deb = parseNumber(cardRateDebit);

    if (isNaN(cred) || isNaN(deb)) {
      toast.error("Informe taxas válidas.");
      return;
    }

    setIsSaving(true);
    const success = await updateProfile({
      card_rate_credit: cred,
      card_rate_debit: deb,
    });
    if (success) {
      toast.success("Taxas de cartão atualizadas!");
      setCardRatesOpen(false);
    } else toast.error("Erro ao salvar taxas.");
    setIsSaving(false);
  };

  const handleSaveDeliverySettings = async () => {
    const fee = parseNumber(deliveryFee);
    const dCost = parseNumber(deliveryDailyCost);

    if (isNaN(fee) || isNaN(dCost)) {
      toast.error("Informe valores válidos para delivery.");
      return;
    }

    setIsSaving(true);
    const success = await updateProfile({
      delivery_fee_brl: fee,
      delivery_daily_cost_brl: dCost,
    });
    if (success) {
      toast.success("Configurações de delivery salvas!");
      setDeliveryOpen(false);
    } else toast.error("Erro ao salvar delivery.");
    setIsSaving(false);
  };

  const handleSaveGeneralSettings = async () => {
    const sleep = parseInt(mascotSleepSeconds);
    if (isNaN(sleep)) {
      toast.error("Informe um tempo válido.");
      return;
    }

    setIsSaving(true);
    const success = await updateProfile({
      mascot_sleep_seconds: sleep,
    });
    if (success) toast.success("Preferências gerais salvas!");
    else toast.error("Erro ao salvar preferências.");
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const success = await updateProfile({ avatar_url: publicUrl });
      if (success) toast.success("Foto atualizada!");
    } catch (error: any) {
      toast.error("Erro ao carregar foto: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      setIsSaving(true);
      console.log("Iniciando limpeza total de dados (Políticas Corrigidas)");

      // 1. Buscar vendas
      const { data: vSales, error: fError } = await supabase
        .from("sales")
        .select("id")
        .eq("user_id", user.id);

      if (fError) throw fError;
      const vSaleIds = vSales?.map(s => s.id) || [];

      // 2. Limpar itens de venda (Ordem crítica para FK)
      if (vSaleIds.length > 0) {
        console.log("Deletando itens de venda...");
        const { error: e1 } = await supabase.from("sale_items").delete().in("sale_id", vSaleIds);
        if (e1) throw e1;
      }

      // 3. Limpar vendas
      console.log("Deletando vendas...");
      const { error: e2 } = await supabase.from("sales").delete().eq("user_id", user.id);
      if (e2) throw e2;

      // 4. Limpar produtos
      console.log("Deletando produtos...");
      const { error: e3 } = await supabase.from("products").delete().eq("user_id", user.id);
      if (e3) throw e3;

      // 5. Limpar histórico de delivery
      console.log("Deletando histórico de delivery...");
      const { error: e4 } = await supabase.from("delivery_work_days").delete().eq("user_id", user.id);
      if (e4) throw e4;

      toast.success("Limpeza concluída! O app está como novo.");
      setResetDataOpen(false);
      setResetConfirmText("");

      // Cache-busting reload
      setTimeout(() => {
        window.location.href = window.location.origin + "/dashboard?reset=true";
      }, 1000);

    } catch (error: any) {
      console.error("ERRO NO RESET:", error);
      toast.error("Erro inesperado: " + (error.message || "Verifique sua conexão"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      setIsSaving(true);
      // In a real production app, we would use a service role or edge function 
      // to delete from auth.users. Here we delete the database profile and logout.
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      toast.success("Conta excluída.");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Erro ao excluir conta.");
    } finally {
      setIsSaving(false);
      setDeleteAccountOpen(false);
    }
  };

  if (loadingProfile || loadingDelivery) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Sua conta e taxas do negócio.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive font-bold rounded-xl">
          Sair
        </Button>
      </header>

      <section className="mt-6 flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full border-4 border-background shadow-hero overflow-hidden bg-secondary flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User2 className="h-10 w-10 text-muted-foreground" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-transform">
            <Camera className="h-4 w-4" />
            <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={isUploading} />
          </label>
        </div>
        <div className="text-center">
          <p className="font-bold">{profile?.full_name || "Seu Nome"}</p>
          <p className="text-xs text-muted-foreground font-medium">{profile?.store_name || "Sua Loja"}</p>
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        <MonthlyRevenueGoalCard />



        <ColorCard tone="lime">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Perfil da Loja</p>
            </div>
            <div className="mt-3 grid gap-2">
              <Input
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-2xl bg-background/50 border-none"
              />
              <Input
                placeholder="Nome da sua loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-12 rounded-2xl bg-background/50 border-none"
              />
              <Button variant="hero" className="w-full h-12 rounded-2xl" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Dados"}
              </Button>
            </div>
          </div>
        </ColorCard>

        <section className="grid grid-cols-2 gap-3">
          {/* Card Rates Dialog */}
          <Dialog open={cardRatesOpen} onOpenChange={setCardRatesOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-start gap-2 p-4 rounded-3xl bg-orange/10 border border-orange/20 text-left transition-all active:scale-95">
                <Percent className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-bold">Taxas Cartão</p>
                  <p className="text-[10px] text-muted-foreground">Configurar %</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Taxas de Cartão (%)</DialogTitle>
                <DialogDescription>Taxas descontadas automaticamente nas vendas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Taxa Crédito (%)</Label>
                  <Input
                    type="number" step="0.01"
                    value={cardRateCredit} onChange={(e) => setCardRateCredit(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Taxa Débito (%)</Label>
                  <Input
                    type="number" step="0.01"
                    value={cardRateDebit} onChange={(e) => setCardRateDebit(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="hero" className="w-full h-12 rounded-2xl" onClick={handleSaveCardRates} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Taxas"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delivery Settings Dialog */}
          <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-start gap-2 p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-left transition-all active:scale-95">
                <Truck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-bold">Delivery</p>
                  <p className="text-[10px] text-muted-foreground">Taxas e Diárias</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto border-none bg-background/95 backdrop-blur-xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Custos de Delivery</DialogTitle>
                <DialogDescription>Taxa do cliente e custo de operação.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Taxa fixa por entrega (R$)</Label>
                  <Input
                    type="number" step="0.01"
                    value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Custo diário do entregador (R$)</Label>
                  <Input
                    type="number" step="0.01"
                    value={deliveryDailyCost} onChange={(e) => setDeliveryDailyCost(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-none"
                  />
                </div>

                <Separator className="my-2" />

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">Dias de Trabalho</Label>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {workedDays.length} DIAS
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Selecione os dias em que houve custo operacional de entregador.
                  </p>
                  <div className="flex justify-center bg-secondary/30 rounded-3xl p-2">
                    <Calendar
                      mode="multiple"
                      selected={workedDays}
                      onSelect={(days) => {
                        // Logic to find which day was toggled
                        // Calendar returns the whole array, but my hook handles single toggle
                        // For simplicity I'll compare or just fix the hook if needed
                        // Let's just use a simple click handler if possible
                        // But Calendar is cleaner UI.
                      }}
                      onDayClick={toggleDay}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="hero" className="w-full h-12 rounded-2xl" onClick={handleSaveDeliverySettings} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirmar Configurações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <ColorCard tone="indigo">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Vibrate className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Preferências Gerais</p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-xs text-muted-foreground">Tempo p/ mascote dormir (segundos)</Label>
                <Input
                  type="number"
                  value={mascotSleepSeconds}
                  onChange={(e) => setMascotSleepSeconds(e.target.value)}
                  className="h-12 rounded-2xl bg-background/50 border-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border bg-background/50 p-4">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold tracking-tight">Haptics (Vibração)</p>
                    <p className="text-[10px] text-muted-foreground">Feedback tátil no app.</p>
                  </div>
                </div>
                <Switch
                  checked={profile?.haptics_enabled ?? true}
                  onCheckedChange={(v) => updateProfile({ haptics_enabled: v })}
                />
              </div>

              <Button variant="hero" className="w-full h-12 rounded-2xl" onClick={handleSaveGeneralSettings} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Preferências"}
              </Button>
            </div>
          </div>
        </ColorCard>

        <ColorCard tone="indigo">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold tracking-tight">Ajuda</p>
            </div>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" className="w-full h-12 rounded-2xl bg-background/50 border-none justify-start px-4 text-sm font-medium">
                Como configurar meu PDV?
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-2xl bg-background/50 border-none justify-start px-4 text-sm font-medium">
                Dúvidas sobre taxas e lucros
              </Button>
            </div>
          </div>
        </ColorCard>

        <Dialog open={resetDataOpen} onOpenChange={(val) => {
          setResetDataOpen(val);
          if (!val) setResetConfirmText("");
        }}>
          <DialogTrigger asChild>
            <button className="mt-8 mb-2 w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground/50 hover:text-destructive transition-colors">
              <Trash className="h-3 w-3" />
              Zerar todos os dados do app
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Zerar Dados Permanentemente?
              </DialogTitle>
              <DialogDescription>
                Esta ação <span className="font-bold text-destructive">não pode ser desfeita</span>. Todas as vendas, produtos e histórico de delivery serão apagados. Seu perfil e configurações de taxas serão mantidos.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <Label className="text-xs text-muted-foreground">Para confirmar, digite <span className="font-bold text-foreground">ZERAR</span> no campo abaixo:</Label>
              <Input
                placeholder="Digite ZERAR"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                className="h-12 rounded-2xl bg-secondary/50 border-none text-center font-bold tracking-widest"
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setResetDataOpen(false)}>Cancelar</Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-2xl"
                onClick={handleResetData}
                disabled={isSaving || resetConfirmText !== "ZERAR"}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Sim, zerar dados"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
          <DialogTrigger asChild>
            <button className="mb-4 w-full flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground/30 hover:text-destructive transition-colors">
              <Trash className="h-3 w-3" />
              Excluir minha conta permanentemente
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-destructive">Excluir Conta?</DialogTitle>
              <DialogDescription>
                Esta ação é permanente e você perderá todos os seus dados de vendas e configurações.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setDeleteAccountOpen(false)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1 rounded-2xl" onClick={handleDeleteAccount} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : "Sim, excluir tudo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}
