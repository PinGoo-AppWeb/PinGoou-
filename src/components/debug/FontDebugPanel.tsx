import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { clearFontCache, checkFontsLoaded, reloadGoogleFonts } from '@/utils/font-cache-cleaner';
import { toast } from 'sonner';

/**
 * Font Debug Panel
 * Componente para debug e limpeza de cache de fontes
 * Adicione temporariamente em Settings ou Dashboard para testar
 */
export const FontDebugPanel = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [fontsStatus, setFontsStatus] = useState<boolean | null>(null);

    const handleCheckFonts = async () => {
        setIsChecking(true);
        try {
            const status = await checkFontsLoaded();
            setFontsStatus(status);

            if (status) {
                toast.success('✅ Todas as fontes estão carregadas!');
            } else {
                toast.warning('⚠️ Algumas fontes não estão carregadas');
            }
        } catch (error) {
            toast.error('❌ Erro ao verificar fontes');
        } finally {
            setIsChecking(false);
        }
    };

    const handleClearCache = async () => {
        toast.info('🧹 Limpando cache de fontes...');
        await clearFontCache();
        // A página será recarregada automaticamente
    };

    const handleReloadFonts = () => {
        reloadGoogleFonts();
        toast.success('🔄 Fontes recarregadas! Aguarde alguns segundos.');

        // Verificar novamente após 2 segundos
        setTimeout(() => {
            handleCheckFonts();
        }, 2000);
    };

    return (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                    <RefreshCw className="h-5 w-5" />
                    Debug de Tipografia
                </CardTitle>
                <CardDescription>
                    Ferramentas para resolver problemas de fontes no mobile
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status das Fontes */}
                <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-white p-3">
                    <div>
                        <p className="text-sm font-medium">Status das Fontes</p>
                        <p className="text-xs text-muted-foreground">Inter & Outfit</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {fontsStatus === null ? (
                            <span className="text-xs text-muted-foreground">Não verificado</span>
                        ) : fontsStatus ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="grid gap-2">
                    <Button
                        onClick={handleCheckFonts}
                        disabled={isChecking}
                        variant="outline"
                        className="w-full"
                    >
                        {isChecking ? 'Verificando...' : 'Verificar Fontes'}
                    </Button>

                    <Button
                        onClick={handleReloadFonts}
                        variant="outline"
                        className="w-full"
                    >
                        Recarregar Fontes
                    </Button>

                    <Button
                        onClick={handleClearCache}
                        variant="destructive"
                        className="w-full"
                    >
                        Limpar Cache & Recarregar
                    </Button>
                </div>

                {/* Instruções */}
                <div className="rounded-lg bg-orange-50 p-3 text-xs space-y-2">
                    <p className="font-semibold text-orange-900">📱 Como usar no celular:</p>
                    <ol className="list-decimal list-inside space-y-1 text-orange-800">
                        <li>Clique em "Verificar Fontes" primeiro</li>
                        <li>Se aparecer ❌, clique em "Recarregar Fontes"</li>
                        <li>Se ainda não funcionar, use "Limpar Cache"</li>
                        <li>Após limpar cache, o app recarregará automaticamente</li>
                    </ol>
                </div>

                {/* Fontes Exemplo */}
                <div className="space-y-2 rounded-lg border border-orange-100 bg-white p-3">
                    <p className="text-xs font-semibold text-orange-900">Preview das Fontes:</p>
                    <p style={{ fontFamily: 'Inter, sans-serif' }} className="text-sm">
                        Inter: The quick brown fox jumps over the lazy dog
                    </p>
                    <p style={{ fontFamily: 'Outfit, sans-serif' }} className="text-sm font-semibold">
                        Outfit: The quick brown fox jumps over the lazy dog
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
