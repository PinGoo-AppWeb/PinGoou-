import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type SaleItem = {
    product_id: string;
    qty: number;
    price_at_sale: number;
};

export type CreateSaleData = {
    total: number;
    subtotal: number;
    taxa_delivery: number;
    payment_method: string;
    is_delivery: boolean;
    items: SaleItem[];
    sale_date?: Date; // Data da venda (opcional, padrão: agora)
};

export type Sale = {
    id: string;
    created_at: string;
    total: number;
    subtotal: number;
    taxa_delivery: number;
    payment_method: string;
    is_delivery: boolean;
};

export function useSales() {
    const [loading, setLoading] = useState(false);

    const fetchSales = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("sales")
            .select("*")
            .order("created_at", { ascending: false });

        setLoading(false);
        if (error) return [];
        return data as Sale[];
    };

    const createSale = async (saleData: CreateSaleData) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return null;
        }

        const { data: sale, error: saleError } = await supabase
            .from("sales")
            .insert({
                user_id: user.id,
                total: saleData.total,
                subtotal: saleData.subtotal,
                taxa_delivery: saleData.taxa_delivery,
                payment_method: saleData.payment_method,
                is_delivery: saleData.is_delivery,
                ...(saleData.sale_date && { created_at: saleData.sale_date.toISOString() }),
            })
            .select()
            .single();

        if (saleError || !sale) {
            setLoading(false);
            return null;
        }

        const itemsToInsert = saleData.items.map(item => ({
            sale_id: sale.id,
            product_id: item.product_id,
            qty: item.qty,
            price_at_sale: item.price_at_sale,
        }));

        const { error: itemsError } = await supabase
            .from("sale_items")
            .insert(itemsToInsert);

        setLoading(false);
        if (itemsError) return null;

        return sale;
    };

    const deleteSale = async (saleId: string) => {
        setLoading(true);
        try {
            console.log("🔄 Iniciando exclusão da venda:", saleId);

            // 1. Deletar itens da venda primeiro (FK constraint)
            console.log("🗑️ Deletando itens da venda...");
            const { error: itemsError } = await supabase
                .from("sale_items")
                .delete()
                .eq("sale_id", saleId);

            if (itemsError) {
                console.error("❌ Erro ao deletar itens:", itemsError);
                throw itemsError;
            }

            console.log("✅ Itens deletados");

            // 2. Deletar a venda
            console.log("🗑️ Deletando venda...");
            const { error: saleError } = await supabase
                .from("sales")
                .delete()
                .eq("id", saleId);

            if (saleError) {
                console.error("❌ Erro ao deletar venda:", saleError);
                throw saleError;
            }

            console.log("✅ Venda deletada com sucesso");
            setLoading(false);
            return true;
        } catch (error) {
            console.error("❌ Erro geral ao deletar venda:", error);
            setLoading(false);
            return false;
        }
    };

    const updateSale = async (saleId: string, updates: Partial<Sale>) => {
        setLoading(true);
        const { error } = await supabase.from("sales").update(updates).eq("id", saleId);
        setLoading(false);
        return !error;
    };

    return { createSale, fetchSales, deleteSale, updateSale, loading };
}
