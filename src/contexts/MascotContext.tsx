import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { useSaleInactivity } from "@/hooks/use-sale-inactivity";
import { useProfile } from "@/hooks/use-profile";

type MascotMood = "active" | "happy" | "sleep";

interface MascotContextType {
    mood: MascotMood;
    setMood: (mood: MascotMood) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
    const { profile } = useProfile();
    const [mood, setMood] = useState<MascotMood>("active");
    const [forceHappy, setForceHappy] = useState(true);

    // Configuração de sono do perfil
    const sleepSeconds = profile?.mascot_sleep_seconds || 10;

    // Inatividade monitorada globalmente (poll mais lento para poupar CPU se não for crítico)
    const { inactive, msSince } = useSaleInactivity({
        inactivityMs: sleepSeconds * 1000,
        pollMs: 2000
    });

    // Felix na primeira carga
    useEffect(() => {
        const timer = setTimeout(() => setForceHappy(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    // Cálculo automático do humor
    useEffect(() => {
        const isHappy = (!inactive && msSince < 8000) || forceHappy;
        const nextMood = isHappy ? "happy" : (inactive ? "sleep" : "active");

        setMood(prev => prev !== nextMood ? nextMood : prev);
    }, [inactive, msSince, forceHappy]);

    const updateMood = useCallback((newMood: MascotMood) => {
        setMood(prev => prev !== newMood ? newMood : prev);
    }, []);

    const value = useMemo(() => ({ mood, setMood: updateMood }), [mood, updateMood]);

    return (
        <MascotContext.Provider value={value}>
            {children}
        </MascotContext.Provider>
    );
}

export function useMascotMood() {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error("useMascotMood must be used within MascotProvider");
    }
    return context;
}
