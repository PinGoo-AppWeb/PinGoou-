/**
 * Font Cache Cleaner
 * Limpa o cache de fontes do Service Worker e força reload
 * Use quando as fontes não atualizarem no mobile
 */

export const clearFontCache = async (): Promise<void> => {
    try {
        // 1. Limpar cache do Service Worker
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log('🧹 Limpando caches:', cacheNames);

            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    // Limpar caches de fontes especificamente
                    if (cacheName.includes('font') || cacheName.includes('google')) {
                        console.log(`🗑️ Removendo cache: ${cacheName}`);
                        await caches.delete(cacheName);
                    }
                })
            );
        }

        // 2. Desregistrar Service Worker antigo
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('🔄 Service Workers encontrados:', registrations.length);

            for (const registration of registrations) {
                await registration.unregister();
                console.log('✅ Service Worker desregistrado');
            }
        }

        // 3. Limpar localStorage (se houver cache de fontes)
        const fontKeys = Object.keys(localStorage).filter(
            (key) => key.includes('font') || key.includes('typography')
        );
        fontKeys.forEach((key) => {
            localStorage.removeItem(key);
            console.log(`🗑️ Removido do localStorage: ${key}`);
        });

        console.log('✅ Cache de fontes limpo com sucesso!');
        console.log('🔄 Recarregando página...');

        // 4. Forçar reload sem cache
        window.location.reload();
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
    }
};

/**
 * Verificar se as fontes estão carregadas
 */
export const checkFontsLoaded = async (): Promise<boolean> => {
    try {
        if (!('fonts' in document)) {
            console.warn('⚠️ Font Loading API não suportada');
            return false;
        }

        // Verificar se Inter e Outfit estão carregadas
        const inter = await document.fonts.check('12px Inter');
        const outfit = await document.fonts.check('12px Outfit');

        console.log('📊 Status das fontes:');
        console.log('  - Inter:', inter ? '✅ Carregada' : '❌ Não carregada');
        console.log('  - Outfit:', outfit ? '✅ Carregada' : '❌ Não carregada');

        return inter && outfit;
    } catch (error) {
        console.error('❌ Erro ao verificar fontes:', error);
        return false;
    }
};

/**
 * Forçar reload de fontes do Google Fonts
 */
export const reloadGoogleFonts = (): void => {
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');

    fontLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
            // Adicionar timestamp para forçar reload
            const newHref = href.includes('?')
                ? `${href}&t=${Date.now()}`
                : `${href}?t=${Date.now()}`;

            link.setAttribute('href', newHref);
            console.log('🔄 Recarregando fonte:', newHref);
        }
    });
};

// Exportar função de debug para console
if (typeof window !== 'undefined') {
    (window as any).debugFonts = {
        clear: clearFontCache,
        check: checkFontsLoaded,
        reload: reloadGoogleFonts,
    };

    console.log('🛠️ Debug de fontes disponível:');
    console.log('  - window.debugFonts.clear() - Limpar cache');
    console.log('  - window.debugFonts.check() - Verificar fontes');
    console.log('  - window.debugFonts.reload() - Recarregar fontes');
}
