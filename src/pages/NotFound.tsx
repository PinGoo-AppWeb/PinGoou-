import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="px-4 pb-28 pt-10 animate-fade-in">
      <Card className="mx-auto max-w-md rounded-3xl shadow-card">
        <div className="p-6 text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">Erro</p>
          <h1 className="mt-2 font-mono text-5xl font-semibold leading-[1] tracking-tight">404</h1>
          <p className="mt-3 text-sm text-muted-foreground">A página que você tentou acessar não existe.</p>
          <a href="/" className="mt-5 inline-block text-sm font-semibold text-primary underline underline-offset-4">
            Voltar para o início
          </a>
        </div>
      </Card>
    </main>
  );
};

export default NotFound;
