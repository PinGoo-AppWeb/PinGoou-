import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MobileShell } from "@/components/layout/MobileShell";
import NewSale from "@/pages/NewSale";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Expenses from "@/pages/Expenses";
import Auth from "@/pages/Auth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MascotProvider } from "@/contexts/MascotContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <MascotProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MobileShell />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/venda/nova" element={<NewSale />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/relatorios" element={<Reports />} />
                  <Route path="/despesas" element={<Expenses />} />
                  <Route path="/configuracoes" element={<Settings />} />
                </Route>
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MascotProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

