import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Expense = {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    created_at: string;
};

export type CreateExpenseData = {
    description: string;
    amount: number;
    category: string;
    date: Date;
};

export function useExpenses() {
    const [loading, setLoading] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("expenses")
            .select("*")
            .order("date", { ascending: false });

        setLoading(false);
        if (error) {
            console.error("Erro ao buscar despesas:", error);
            return [];
        }
        return data as Expense[];
    }, []);

    const createExpense = async (data: CreateExpenseData) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return null;
        }

        const { data: newExpense, error } = await supabase
            .from("expenses")
            .insert({
                user_id: user.id,
                description: data.description,
                amount: data.amount,
                category: data.category,
                date: data.date.toISOString(),
            })
            .select()
            .single();

        setLoading(false);

        if (error) {
            console.error("Erro ao criar despesa:", error);
            return null;
        }

        return newExpense;
    };

    const deleteExpense = async (id: string) => {
        setLoading(true);
        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erro ao deletar despesa:", error);
        }

        setLoading(false);
        return !error;
    };

    const updateExpense = async (id: string, updates: Partial<CreateExpenseData>) => {
        setLoading(true);

        const updatePayload: any = { ...updates };
        if (updates.date) {
            updatePayload.date = updates.date.toISOString();
        }

        console.log("Atualizando despesa:", id, updatePayload);

        const { error } = await supabase
            .from("expenses")
            .update(updatePayload)
            .eq("id", id);

        if (error) {
            console.error("Erro ao atualizar despesa:", error);
        }

        setLoading(false);
        return !error;
    };

    return {
        loading,
        fetchExpenses,
        createExpense,
        deleteExpense,
        updateExpense
    };
}
