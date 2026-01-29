import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type MascotMood = "active" | "happy" | "sleep";

interface MascotContextType {
    mood: MascotMood;
    setMood: (mood: MascotMood) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
    const [mood, setMood] = useState<MascotMood>("active");

    return (
        <MascotContext.Provider value={{ mood, setMood }}>
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
