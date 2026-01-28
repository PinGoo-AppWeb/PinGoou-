import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useProfile } from "@/hooks/use-profile";
import { AvatarImage, Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Moon, Sun } from "lucide-react";
import { useEffect, useMemo } from "react";

function titleFromPath(pathname: string) {
  if (pathname === "/") return "PDV";
  if (pathname.startsWith("/venda")) return "Nova venda";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/produtos") return "Produtos";
  if (pathname === "/relatorios") return "Relatórios";
  if (pathname === "/configuracoes") return "Configurações";
  return "PDV";
}

export function MobileShell() {
  const { profile } = useProfile();
  const location = useLocation();
  const pageTitle = useMemo(() => titleFromPath(location.pathname), [location.pathname]);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const firstName = useMemo(() => {
    if (!profile?.full_name) return "Usuário";
    return profile.full_name.split(" ")[0];
  }, [profile]);

  useEffect(() => {
    document.title = `${pageTitle} • PDV 30`;
  }, [pageTitle]);

  return (
    <div
      className="min-h-screen bg-background bg-hero flex flex-col"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q100,30 200,50 T400,50' stroke='rgba(120,200,100,0.25)' stroke-width='2' fill='none'/%3E%3Cpath d='M0,150 Q80,170 160,150 T320,150' stroke='rgba(120,200,100,0.18)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M50,0 Q70,100 50,200 T50,400' stroke='rgba(120,200,100,0.15)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M250,0 Q230,120 250,240 T250,400' stroke='rgba(120,200,100,0.22)' stroke-width='2' fill='none'/%3E%3Ccircle cx='80' cy='80' r='30' stroke='rgba(120,200,100,0.12)' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='320' cy='200' r='40' stroke='rgba(120,200,100,0.15)' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='150' cy='300' r='25' stroke='rgba(120,200,100,0.1)' stroke-width='1' fill='none'/%3E%3Cpath d='M100,250 Q120,230 140,250 Q120,270 100,250 Z' stroke='rgba(120,200,100,0.18)' stroke-width='1.5' fill='rgba(120,200,100,0.06)'/%3E%3Cpath d='M300,100 Q310,80 320,100 Q310,120 300,100 Z' stroke='rgba(120,200,100,0.15)' stroke-width='1.5' fill='rgba(120,200,100,0.05)'/%3E%3Cpath d='M0,300 Q100,280 200,300 T400,300' stroke='rgba(120,200,100,0.12)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0,380 Q120,360 240,380 T400,380' stroke='rgba(120,200,100,0.1)' stroke-width='1' fill='none'/%3E%3Cpath d='M200,0 Q180,80 200,160 T200,320' stroke='rgba(120,200,100,0.2)' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='200' cy='200' r='50' stroke='rgba(120,200,100,0.08)' stroke-width='1' fill='none'/%3E%3C/svg%3E"), radial-gradient(1200px circle at 0% 0%, hsl(var(--brand) / 0.18), hsl(var(--background)) 55%), radial-gradient(900px circle at 100% 0%, hsl(var(--brand-dark) / 0.12), hsl(var(--background)) 60%)`,
        backgroundRepeat: 'repeat, no-repeat, no-repeat',
        backgroundSize: '400px 400px, auto, auto',
        backgroundAttachment: 'fixed, scroll, scroll'
      }}
    >
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
