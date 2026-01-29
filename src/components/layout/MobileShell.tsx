import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/use-profile";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Moon, Sun } from "lucide-react";
import { useEffect, useMemo } from "react";
import { MascotHeader } from "@/components/pdv/MascotHeader";

function titleFromPath(pathname: string) {
  if (pathname === "/") return "PDV";
  if (pathname.startsWith("/venda")) return "Nova venda";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/produtos") return "Produtos";
  if (pathname === "/relatorios") return "Relatórios";
  if (pathname === "/despesas") return "Despesas";
  if (pathname === "/configuracoes") return "Configurações";
  return "PDV";
}

export function MobileShell() {
  const { profile } = useProfile();
  const location = useLocation();
  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Ocultar MascotHeader na página inicial (Index)
  const showFloatingMascot = location.pathname !== "/";

  const firstName = useMemo(() => {
    if (!profile?.full_name) return "Usuário";
    return profile.full_name.split(" ")[0];
  }, [profile]);

  useEffect(() => {
    document.title = `${pageTitle} • PDV 30`;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-background bg-hero flex flex-col bg-pingoou-main">
      {showFloatingMascot && <MascotHeader />}

      <header className="sticky top-0 z-40">
        <div className="bg-background bg-splash shadow-card rounded-b-[2rem]">
          <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 border bg-background/70 shadow-sm transition-all duration-500 overflow-hidden">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-background/20 text-xs font-semibold">
                  {firstName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground dark:text-zinc-800">Olá, {firstName}</p>
                <p className="truncate text-sm font-semibold tracking-tight dark:text-zinc-950">{pageTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="hero"
                size="icon"
                aria-label="Notificações"
                onClick={() => window.alert("Sem notificações por enquanto")}
              >
                <Bell />
              </Button>
              <Button
                type="button"
                variant="hero"
                size="icon"
                aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? <Sun /> : <Moon />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-md overflow-x-hidden">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
