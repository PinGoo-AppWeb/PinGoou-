import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Font Loader Component
 * Garante que as fontes estejam carregadas antes de renderizar o app
 * Previne FOUT (Flash of Unstyled Text) no mobile
 */

interface FontLoaderProps {
    children: React.ReactNode;
}

export const FontLoader = ({ children }: FontLoaderProps) => {
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            try {
                if (!('fonts' in document)) {
                    // Se a API não estiver disponível, renderizar mesmo assim
                    console.warn('⚠️ Font Loading API não suportada, renderizando sem esperar');
                    setFontsLoaded(true);
                    return;
                }

                // Aguardar todas as fontes carregarem (com timeout de 3 segundos)
                const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        console.warn('⏱️ Timeout ao carregar fontes, renderizando mesmo assim');
                        setLoadingTimeout(true);
                        resolve('timeout');
                    }, 3000);
                });

                const fontsPromise = document.fonts.ready.then(() => {
                    console.log('✅ Todas as fontes carregadas!');
                    return 'loaded';
                });

                await Promise.race([fontsPromise, timeoutPromise]);
                setFontsLoaded(true);
            } catch (error) {
                console.error('❌ Erro ao carregar fontes:', error);
                // Em caso de erro, renderizar mesmo assim
                setFontsLoaded(true);
            }
        };

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Carregando fontes...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
