import { useMemo, useState } from "react";
import { ColorCard } from "@/components/pdv/ColorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/pdv-data";
import { Plus, Tag, Trash2, Loader2, Pencil, AlertCircle } from "lucide-react";
import { useProducts, Product } from "@/hooks/use-products";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MascotHeader } from "@/components/pdv/MascotHeader";

export default function Products() {
  const { products, loading, addProduct, deleteProduct, updateProduct } = useProducts();
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Edit States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCost, setEditCost] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const canAdd = useMemo(() => name.trim().length >= 2 && Number(price) > 0 && Number(costPrice) >= 0, [name, price, costPrice]);

  const handleAddProduct = async () => {
    if (!canAdd) return;
    setIsAdding(true);
    const result = await addProduct({
      name: name.trim(),
      price: Number(price),
      cost_price: Number(costPrice),
      category: "Geral",
    });

    if (result) {
      toast.success("Produto adicionado!");
      setName("");
      setPrice("");
      setCostPrice("");
    } else {
      toast.error("Erro ao adicionar produto.");
    }
    setIsAdding(false);
  };

  const handleDeleteProduct = async (id: string) => {
    console.log("🔄 Iniciando exclusão de produto:", id);
    const success = await deleteProduct(id);
    if (success) {
      console.log("✅ Produto excluído com sucesso no componente");
      toast.success("Produto excluído.");
    } else {
      console.error("❌ Falha ao excluir produto no componente");
      toast.error("Erro ao excluir produto. Verifique o console para mais detalhes.");
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditCost(product.cost_price.toString());
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    if (!editName.trim() || Number(editPrice) <= 0) {
      toast.error("Preencha os campos corretamente.");
      return;
    }

    setIsSavingEdit(true);
    const success = await updateProduct(editingProduct.id, {
      name: editName,
      price: Number(editPrice),
      cost_price: Number(editCost)
    });

    if (success) {
      toast.success("Produto atualizado!");
      setEditingProduct(null);
    } else {
      toast.error("Erro ao atualizar produto.");
    }
    setIsSavingEdit(false);
  };

  return (
    <main className="px-4 pb-28 pt-6 animate-fade-in">
      <MascotHeader />
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
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Venda (R$)"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(",", "."))}
                  className="h-12 rounded-2xl bg-background/50 border-none px-4"
                />
                <Input
                  placeholder="Custo (R$)"
                  inputMode="decimal"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value.replace(",", "."))}
                  className="h-12 rounded-2xl bg-background/50 border-none px-4"
                />
              </div>
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
                    <div className="flex gap-2">
                      <p className="text-xs text-muted-foreground">Venda: {formatBRL(p.price)}</p>
                      <p className="text-xs text-muted-foreground/60">Custo: {formatBRL(p.cost_price || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditModal(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingProduct(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Excluir Produto?
                          </DialogTitle>
                          <DialogDescription>
                            Tem certeza que deseja excluir "{p.name}"? Esta ação não pode ser desfeita.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setDeletingProduct(null)}>Cancelar</Button>
                          <Button
                            variant="destructive"
                            className="flex-1 rounded-2xl"
                            onClick={() => {
                              handleDeleteProduct(p.id);
                              setDeletingProduct(null);
                            }}
                          >
                            Excluir
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </ColorCard>
            ))
          )}
        </div>
      </section>

      {/* Edit Modal */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md border-none bg-background/95 backdrop-blur-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Ajuste os detalhes do seu produto.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-12 rounded-2xl bg-secondary/50 border-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Venda (R$)</Label>
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label>Custo (R$)</Label>
                <Input
                  type="number"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setEditingProduct(null)}>Cancelar</Button>
            <Button variant="hero" className="flex-1 rounded-2xl" onClick={handleUpdateProduct} disabled={isSavingEdit}>
              {isSavingEdit ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

