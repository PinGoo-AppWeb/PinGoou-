import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Product = {
    id: string;
    name: string;
    price: number;
    cost_price: number;
    category: string | null;
    user_id: string;
};

export function useProducts() {
    const queryClient = useQueryClient();

    const { data: products = [], isLoading: loading, refetch: refresh } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Product[];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
    });

    const addMutation = useMutation({
        mutationFn: async (product: Omit<Product, "id" | "user_id">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { data, error } = await supabase
                .from("products")
                .insert({ ...product, user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData(["products"], (old: Product[] | undefined) =>
                old ? old.filter((p) => p.id !== id) : []
            );
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
            const { error } = await supabase.from("products").update(updates).eq("id", id);
            if (error) throw error;
            return { id, updates };
        },
        onSuccess: ({ id, updates }) => {
            queryClient.setQueryData(["products"], (old: Product[] | undefined) =>
                old ? old.map((p) => (p.id === id ? { ...p, ...updates } : p)) : []
            );
        },
    });

    return {
        products,
        loading,
        addProduct: addMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,
        updateProduct: (id: string, updates: Partial<Product>) => updateMutation.mutateAsync({ id, updates }),
        refresh,
    };
}
