import { useMemo, useState } from "react";
import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/pdv-data";
import { Plus, Tag, Trash2, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { toast } from "sonner";

export default function Products() {
  const { products, loading, addProduct, deleteProduct } = useProducts();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const canAdd = useMemo(() => name.trim().length >= 2 && Number(price) > 0, [name, price]);

  const handleAddProduct = async () => {
    if (!canAdd) return;
    setIsAdding(true);
    const result = await addProduct({
      name: name.trim(),
      price: Number(price),
      category: "Geral",
    });

    if (result) {
      toast.success("Produto adicionado!");
      setName("");
      setPrice("");
    } else {
      toast.error("Erro ao adicionar produto.");
    }
    setIsAdding(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      const success = await deleteProduct(id);
      if (success) {
        toast.success("Produto excluído.");
      } else {
        toast.error("Erro ao excluir produto.");
      }
    }
  };

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <section>
        <h1 className="text-base font-semibold tracking-tight">Produtos</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu catálogo de produtos.</p>
      </section>

      <section className="mt-4 grid gap-3">
        <ColorCard tone="orange">
          <div className="p-4">
            <p className="text-sm font-semibold tracking-tight">Novo Produto</p>
            <div className="mt-3 grid gap-2">
              <Input
                placeholder="Nome do produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-2xl bg-background/50 border-none"
              />
              <Input
                placeholder="Preço de venda (R$)"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(",", "."))}
                className="h-12 rounded-2xl bg-background/50 border-none"
              />
              <Button
                variant="hero"
                className="w-full h-12"
                disabled={!canAdd || isAdding}
                onClick={handleAddProduct}
              >
                {isAdding ? <Loader2 className="animate-spin" /> : <Plus />}
                Adicionar produto
              </Button>
            </div>
          </div>
        </ColorCard>

        <div className="grid gap-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
          ) : (
            products.map((p) => (
              <ColorCard key={p.id} tone="lime">
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBRL(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-accent-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      Ativo
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteProduct(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </ColorCard>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

