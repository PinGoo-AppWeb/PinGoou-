import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MascotProvider } from "@/contexts/MascotContext";
import { Loader2 } from "lucide-react";

// Lazy loading pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NewSale = lazy(() => import("./pages/NewSale"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Reports = lazy(() => import("./pages/Reports"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Settings = lazy(() => import("./pages/Settings"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <MascotProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </MascotProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

