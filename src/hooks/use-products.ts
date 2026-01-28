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
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (!error) {
            setProducts(prev => prev.filter(p => p.id !== id));
            return true;
        }
        return false;
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
