import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatBRL, paymentMethods } from "@/lib/pdv-data";
import { Plus, Minus, Trash2, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sale, SaleItem } from "@/hooks/use-sales";
import type { Product } from "@/hooks/use-products";
import { supabase } from "@/lib/supabase";

type SaleItemWithProduct = SaleItem & {
    product_name?: string;
};

type EditSaleModalProps = {
    sale: Sale | null;
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    products: Product[];
};

export function EditSaleModal({ sale, open, onClose, onSave, products }: EditSaleModalProps) {
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [items, setItems] = useState<SaleItemWithProduct[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [isDelivery, setIsDelivery] = useState(false);

    const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

    // Carregar itens da venda
    useEffect(() => {
        if (!sale) return;

        const loadSaleItems = async () => {
            setLoadingItems(true);
            const { data, error } = await supabase
                .from("sale_items")
                .select("*")
                .eq("sale_id", sale.id);

            if (!error && data) {
                const itemsWithNames = data.map((item) => ({
                    ...item,
                    product_name: productsById.get(item.product_id)?.name || "Produto removido",
                }));
                setItems(itemsWithNames);
            }
            setLoadingItems(false);
        };

        setPaymentMethod(sale.payment_method);
        setIsDelivery(sale.is_delivery);
        loadSaleItems();
    }, [sale, productsById]);

    // Calcular totais
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + item.price_at_sale * item.qty, 0);
    }, [items]);

    const taxaDelivery = useMemo(() => (isDelivery ? 6 : 0), [isDelivery]);
    const total = useMemo(() => subtotal + taxaDelivery, [subtotal, taxaDelivery]);

    const handleUpdateQuantity = (productId: string, delta: number) => {
        setItems((prev) =>
            prev
                .map((item) =>
                    item.product_id === productId
                        ? { ...item, qty: Math.max(0, item.qty + delta) }
                        : item
                )
                .filter((item) => item.qty > 0)
        );
    };

    const handleRemoveItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.product_id !== productId));
    };

    const handleAddProduct = (productId: string) => {
        const product = productsById.get(productId);
        if (!product) return;

        const existingItem = items.find((item) => item.product_id === productId);
        if (existingItem) {
            handleUpdateQuantity(productId, 1);
        } else {
            setItems((prev) => [
                ...prev,
                {
                    product_id: productId,
                    qty: 1,
                    price_at_sale: product.price,
                    product_name: product.name,
                },
            ]);
        }
    };

    const handleSave = async () => {
        if (!sale || items.length === 0) return;

        setLoading(true);

        try {
            // 1. Atualizar a venda principal
            const { error: saleError } = await supabase
                .from("sales")
                .update({
                    total,
                    subtotal,
                    taxa_delivery: taxaDelivery,
                    payment_method: paymentMethod,
                    is_delivery: isDelivery,
                })
                .eq("id", sale.id);

            if (saleError) throw saleError;

            // 2. Deletar itens antigos
            await supabase.from("sale_items").delete().eq("sale_id", sale.id);

            // 3. Inserir novos itens
            const itemsToInsert = items.map((item) => ({
                sale_id: sale.id,
                product_id: item.product_id,
                qty: item.qty,
                price_at_sale: item.price_at_sale,
            }));

            const { error: itemsError } = await supabase
                .from("sale_items")
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            onSave();
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar venda:", error);
        } finally {
            setLoading(false);
        }
    };

    const availableProducts = products.filter(
        (p) => !items.some((item) => item.product_id === p.id)
    );

    if (!sale) return null;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg border-none bg-background/95 backdrop-blur-xl rounded-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Venda</DialogTitle>
                    <DialogDescription>
                        Altere produtos, quantidades, forma de pagamento e delivery.
                    </DialogDescription>
                </DialogHeader>

                {loadingItems ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="py-4 space-y-4">
                        {/* Produtos */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Produtos
                            </Label>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                {items.length === 0 ? (
                                    <div className="text-center p-4 text-sm text-muted-foreground border rounded-2xl border-dashed">
                                        Nenhum produto selecionado
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div
                                            key={item.product_id}
                                            className="flex items-center justify-between gap-2 p-3 bg-secondary/30 rounded-2xl border"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatBRL(item.price_at_sale)} × {item.qty} ={" "}
                                                    {formatBRL(item.price_at_sale * item.qty)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() => handleUpdateQuantity(item.product_id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-mono-numbers text-sm font-bold">
                                                    {item.qty}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-7 w-7"
                                                    onClick={() => handleUpdateQuantity(item.product_id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => handleRemoveItem(item.product_id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Adicionar Produto */}
                            {availableProducts.length > 0 && (
                                <Select onValueChange={handleAddProduct}>
                                    <SelectTrigger className="h-10 rounded-2xl bg-secondary/50 border-dashed">
                                        <SelectValue placeholder="+ Adicionar produto" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-premium">
                                        {availableProducts.map((p) => (
                                            <SelectItem key={p.id} value={p.id} className="rounded-xl">
                                                {p.name} - {formatBRL(p.price)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <Separator />

                        {/* Forma de Pagamento */}
                        <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="h-12 rounded-2xl bg-secondary/50 border-none">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-premium">
                                    {paymentMethods.map((m) => (
                                        <SelectItem key={m} value={m} className="rounded-xl">
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Delivery */}
                        <div className="space-y-2">
                            <Label>Delivery?</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setIsDelivery(false)}
                                    className={cn(
                                        "h-12 rounded-2xl border text-sm font-semibold transition-all",
                                        !isDelivery
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary/30 hover:bg-secondary/50"
                                    )}
                                >
                                    Não
                                </button>
                                <button
                                    onClick={() => setIsDelivery(true)}
                                    className={cn(
                                        "h-12 rounded-2xl border text-sm font-semibold transition-all",
                                        isDelivery
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary/30 hover:bg-secondary/50"
                                    )}
                                >
                                    Sim
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Resumo */}
                        <div className="space-y-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono-numbers font-semibold">{formatBRL(subtotal)}</span>
                            </div>
                            {isDelivery && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Taxa Delivery</span>
                                    <span className="font-mono-numbers font-semibold">
                                        {formatBRL(taxaDelivery)}
                                    </span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between">
                                <span className="text-sm font-bold">Total</span>
                                <span className="text-lg font-bold text-primary font-mono-numbers">
                                    {formatBRL(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1 h-12 rounded-2xl"
                        onClick={handleSave}
                        disabled={loading || loadingItems || items.length === 0}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            "Salvar Alterações"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
