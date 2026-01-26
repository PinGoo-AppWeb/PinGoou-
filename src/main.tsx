import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Register PWA service worker
registerSW({
    immediate: true,
    onNeedRefresh() {
        if (confirm("Nova versão disponível! Atualizar agora?")) {
            window.location.reload();
        }
    },
});

createRoot(document.getElementById("root")!).render(<App />);
