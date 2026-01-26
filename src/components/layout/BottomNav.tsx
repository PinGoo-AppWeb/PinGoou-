import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Home, Package, Settings2 } from "lucide-react";

const items = [
  { to: "/", label: "PDV", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/configuracoes", label: "Config", icon: Settings2 },
];

export function BottomNav() {
  const location = useLocation();
  const saleActive = location.pathname.startsWith("/venda");

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="relative">
          <div className="relative rounded-full border bg-background/85 p-1 shadow-card backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="grid grid-cols-4 items-center">
              {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center justify-center rounded-full px-1 py-3 text-muted-foreground transition",
                    isActive && "text-foreground",
                  )
                }
                aria-label={item.label}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute inset-1 rounded-full transition",
                        isActive ? "bg-highlight" : "bg-transparent group-hover:bg-secondary/60",
                      )}
                      aria-hidden="true"
                    />
                    <span className="relative inline-flex items-center justify-center">
                      <item.icon className={cn("h-5 w-5", isActive && "text-highlight-foreground")} />
                    </span>
                  </>
                )}
              </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
