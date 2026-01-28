import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MascotAnimated } from "@/components/pdv/MascotAnimated";
import { Crown, Check } from "lucide-react";
import { ColorCard } from "@/components/pdv/ColorCard";

interface PremiumUpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export function PremiumUpgradeModal({
    open,
    onOpenChange,
    title = "Limite Freemium Atingido!",
    description = "Você já utilizou sua cota de ações gratuitas. Faça o upgrade para continuar."
}: PremiumUpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-0 overflow-hidden">

                {/* Header Hero */}
                <div className="bg-gradient-to-br from-primary via-primary/90 to-orange-500 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                    <div className="relative z-10 scale-125 mb-2 filter drop-shadow-xl">
                        <MascotAnimated mood="waving" />
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight relative z-10 flex items-center gap-2">
                        {title}
                    </h2>
                    <p className="text-white/90 text-sm font-medium mt-1 max-w-[80%] relative z-10">
                        {description}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <ColorCard tone="indigo">
                        <div className="p-4 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                <Crown className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-indigo-900">Plano PRO PinGoou</h3>
                                <p className="text-xs text-indigo-700/80 mt-1">
                                    Desbloqueie todo o potencial do seu negócio!
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-indigo-800">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Zerar dados ilimitadamente</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-indigo-800">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Gestão de múltiplos produtos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-indigo-800">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>Relatórios avançados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ColorCard>

                    <Button
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-orange-500 border-none"
                        onClick={() => onOpenChange(false)}
                    >
                        Quero ser PRO agora! 🚀
                    </Button>

                    <button
                        className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => onOpenChange(false)}
                    >
                        Agora não, obrigado
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
