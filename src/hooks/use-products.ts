import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Product = {
    id: string;
    name: string;
    price: number;
    cost_price: number;
    category: string | null;
    user_id: string;
};

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const addProduct = async (product: Omit<Product, "id" | "user_id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("products")
            .insert({ ...product, user_id: user.id })
            .select()
            .single();

        if (!error && data) {
            setProducts(prev => [data, ...prev]);
            return data;
        }
        return null;
    };

    const deleteProduct = async (id: string) => {
        try {
            console.log("🗑️ Tentando excluir produto:", id);

            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("❌ Erro ao excluir produto:", error);
                console.error("Detalhes do erro:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                return false;
            }

            console.log("✅ Produto excluído com sucesso");
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (error) {
            console.error("❌ Erro geral ao excluir produto:", error);
            return false;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        const { error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", id);

        if (!error) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            return true;
        }
        return false;
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, addProduct, deleteProduct, updateProduct, refresh: fetchProducts };
}
